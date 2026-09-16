import fs from 'fs';
import zlib from 'zlib';

const buf = fs.readFileSync('public/outside-the-city.png');
let pos = 8;
let width, height, colorType;
const idat = [];

while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.toString('ascii', pos + 4, pos + 8);
  if (type === 'IHDR') {
    width = buf.readUInt32BE(pos + 8);
    height = buf.readUInt32BE(pos + 12);
    colorType = buf.readUInt8(pos + 17);
  } else if (type === 'IDAT') {
    idat.push(buf.subarray(pos + 8, pos + 8 + len));
  }
  pos += 12 + len;
}

const raw = zlib.inflateSync(Buffer.concat(idat));
const bpp = colorType === 6 ? 4 : 3;
const stride = 1 + width * bpp;
const uncompressed = Buffer.alloc(width * height * bpp);

for (let y = 0; y < height; y++) {
  const filter = raw[y * stride];
  const rowStart = y * stride + 1;
  const outStart = y * width * bpp;

  for (let x = 0; x < width * bpp; x++) {
    const curr = raw[rowStart + x];
    const left = x >= bpp ? uncompressed[outStart + x - bpp] : 0;
    const up = y > 0 ? uncompressed[outStart - width * bpp + x] : 0;
    const upLeft = (y > 0 && x >= bpp) ? uncompressed[outStart - width * bpp + x - bpp] : 0;

    let val = curr;
    if (filter === 1) val = (curr + left) & 0xff;
    else if (filter === 2) val = (curr + up) & 0xff;
    else if (filter === 3) val = (curr + Math.floor((left + up) / 2)) & 0xff;
    else if (filter === 4) {
      const p = left + up - upLeft;
      const pa = Math.abs(p - left);
      const pb = Math.abs(p - up);
      const pc = Math.abs(p - upLeft);
      let pr = left;
      if (pb < pa && pb <= pc) pr = up;
      else if (pc < pa && pc <= pb) pr = upLeft;
      val = (curr + pr) & 0xff;
    }
    uncompressed[outStart + x] = val;
  }
}

// Bounding box: { minX: 119, maxX: 406, minY: 32, maxY: 319, boxW: 288, boxH: 288 }
const minX = 119;
const maxX = 406;
const minY = 32;
const maxY = 319;
const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + data.length));
  chunk.writeUInt32BE(crc, 8 + data.length);
  return chunk;
}

function encodePNG(w, h, rgba) {
  const lineStride = 1 + w * 4;
  const rawData = Buffer.alloc(h * lineStride);
  for (let y = 0; y < h; y++) {
    rawData[y * lineStride] = 0;
    rgba.copy(rawData, y * lineStride + 1, y * w * 4, (y + 1) * w * 4);
  }
  const compressed = zlib.deflateSync(rawData);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(w, 0);
  ihdrData.writeUInt32BE(h, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(6, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = makeChunk('IHDR', ihdrData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

const croppedRgba = Buffer.alloc(cropW * cropH * 4);
for (let y = 0; y < cropH; y++) {
  for (let x = 0; x < cropW; x++) {
    const srcIdx = ((minY + y) * width + (minX + x)) * bpp;
    const dstIdx = (y * cropW + x) * 4;

    const r = uncompressed[srcIdx];
    const g = uncompressed[srcIdx + 1];
    const b = uncompressed[srcIdx + 2];
    const a = bpp === 4 ? uncompressed[srcIdx + 3] : 255;

    // Check if background is white/transparent
    if (a < 20 || (r > 248 && g > 248 && b > 248)) {
      croppedRgba[dstIdx] = 0;
      croppedRgba[dstIdx + 1] = 0;
      croppedRgba[dstIdx + 2] = 0;
      croppedRgba[dstIdx + 3] = 0;
    } else {
      croppedRgba[dstIdx] = r;
      croppedRgba[dstIdx + 1] = g;
      croppedRgba[dstIdx + 2] = b;
      croppedRgba[dstIdx + 3] = a;
    }
  }
}

// Backup original then save cropped
fs.copyFileSync('public/outside-the-city.png', 'public/outside-the-city-original.png');
fs.writeFileSync('public/outside-the-city.png', encodePNG(cropW, cropH, croppedRgba));
console.log('Successfully cropped outside-the-city.png to', cropW, 'x', cropH, 'square icon!');
