import fs from 'fs';
import zlib from 'zlib';

const buf = fs.readFileSync('/Users/javedsayed/Downloads/driverbeee/public/driverbee-official-logo.png');
let pos = 8;
let width, height;
const idatChunks = [];

while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.toString('ascii', pos + 4, pos + 8);
  if (type === 'IHDR') {
    width = buf.readUInt32BE(pos + 8);
    height = buf.readUInt32BE(pos + 12);
  } else if (type === 'IDAT') {
    idatChunks.push(buf.subarray(pos + 8, pos + 8 + len));
  }
  pos += 12 + len;
}

const raw = zlib.inflateSync(Buffer.concat(idatChunks));
const bpp = 4;
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

// Bounding box from earlier detection: { minX: 58, maxX: 540, minY: 381, maxY: 452 }
const padX = 2;
const padY = 2;
const minX = Math.max(0, 58 - padX);
const maxX = Math.min(width - 1, 540 + padX);
const minY = Math.max(0, 381 - padY);
const maxY = Math.min(height - 1, 452 + padY);
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

// 1. Dark Logo (transparent background)
const darkRgba = Buffer.alloc(cropW * cropH * 4);
for (let y = 0; y < cropH; y++) {
  for (let x = 0; x < cropW; x++) {
    const srcIdx = ((minY + y) * width + (minX + x)) * 4;
    const dstIdx = (y * cropW + x) * 4;

    const r = uncompressed[srcIdx];
    const g = uncompressed[srcIdx + 1];
    const b = uncompressed[srcIdx + 2];

    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    if (brightness > 248) {
      darkRgba[dstIdx] = 0;
      darkRgba[dstIdx + 1] = 0;
      darkRgba[dstIdx + 2] = 0;
      darkRgba[dstIdx + 3] = 0;
    } else {
      darkRgba[dstIdx] = r;
      darkRgba[dstIdx + 1] = g;
      darkRgba[dstIdx + 2] = b;
      darkRgba[dstIdx + 3] = brightness < 180 ? 255 : Math.round((255 - brightness) * 2.5);
    }
  }
}
fs.writeFileSync('/Users/javedsayed/Downloads/driverbeee/public/driverbee-logo.png', encodePNG(cropW, cropH, darkRgba));

// 2. White Logo (for dark navy header or footer)
const whiteRgba = Buffer.alloc(cropW * cropH * 4);
for (let y = 0; y < cropH; y++) {
  for (let x = 0; x < cropW; x++) {
    const dstIdx = (y * cropW + x) * 4;
    const r = darkRgba[dstIdx];
    const g = darkRgba[dstIdx + 1];
    const b = darkRgba[dstIdx + 2];
    const a = darkRgba[dstIdx + 3];

    if (a === 0) {
      whiteRgba[dstIdx] = 0;
      whiteRgba[dstIdx + 1] = 0;
      whiteRgba[dstIdx + 2] = 0;
      whiteRgba[dstIdx + 3] = 0;
    } else {
      const isYellow = (r > 160 && g > 120 && b < 110);
      if (isYellow) {
        whiteRgba[dstIdx] = r;
        whiteRgba[dstIdx + 1] = g;
        whiteRgba[dstIdx + 2] = b;
        whiteRgba[dstIdx + 3] = a;
      } else {
        whiteRgba[dstIdx] = 255;
        whiteRgba[dstIdx + 1] = 255;
        whiteRgba[dstIdx + 2] = 255;
        whiteRgba[dstIdx + 3] = a;
      }
    }
  }
}
fs.writeFileSync('/Users/javedsayed/Downloads/driverbeee/public/driverbee-logo-white.png', encodePNG(cropW, cropH, whiteRgba));

console.log('Successfully generated driverbee-logo.png and driverbee-logo-white.png (', cropW, 'x', cropH, ')');
