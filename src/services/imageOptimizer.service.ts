import sharp from 'sharp';
import crypto from 'node:crypto';

export interface OptimizedImageResult {
  verificationBuffer: Buffer;
  verificationSize: number;
  thumbnailBuffer: Buffer;
  thumbnailSize: number;
  width: number;
  height: number;
  mimeType: 'image/jpeg';
  savingsPercent: number;
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  detectedFormat?: string;
}

// 10MB maximum raw original upload limit
export const MAX_DOCUMENT_UPLOAD_BYTES = 10 * 1024 * 1024;

// Permitted input MIME types
export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

/**
 * Checks file header magic bytes to prevent MIME spoofing and reject executables/scripts.
 */
export function validateImageMagicBytes(buffer: Buffer): ImageValidationResult {
  if (!buffer || buffer.length < 12) {
    return { valid: false, error: 'File buffer is too small or corrupted' };
  }

  // Check for SVG or HTML payload signatures
  const headStr = buffer.subarray(0, 200).toString('utf8').toLowerCase();
  if (
    headStr.includes('<svg') ||
    headStr.includes('<?xml') ||
    headStr.includes('<html') ||
    headStr.includes('<script') ||
    headStr.includes('<!doctype')
  ) {
    return { valid: false, error: 'Vector or script-containing files (SVG/HTML) are strictly prohibited' };
  }

  // Check JPEG magic bytes (FF D8 FF)
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedFormat: 'jpeg' };
  }

  // Check PNG magic bytes (89 50 4E 47 0D 0A 1A 0A)
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, detectedFormat: 'png' };
  }

  // Check WebP magic bytes (RIFF .... WEBP)
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { valid: true, detectedFormat: 'webp' };
  }

  return {
    valid: false,
    error: 'Unsupported file format. Please upload a genuine JPG, PNG, or WebP document image.',
  };
}

/**
 * Optimizes an uploaded document image:
 * 1. Strips all EXIF, GPS, and camera metadata.
 * 2. Auto-rotates orientation based on EXIF tag before stripping.
 * 3. Compresses to verification-quality progressive JPEG (max 1800px, quality 78).
 * 4. Generates a compact thumbnail (max 450px, quality 70).
 */
export async function optimizeDocumentImage(
  inputBuffer: Buffer
): Promise<OptimizedImageResult> {
  const originalSize = inputBuffer.length;

  if (originalSize > MAX_DOCUMENT_UPLOAD_BYTES) {
    throw new Error(`File exceeds maximum upload size of 10MB (${(originalSize / 1024 / 1024).toFixed(2)}MB)`);
  }

  const validation = validateImageMagicBytes(inputBuffer);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid file type');
  }

  // 1. Build Verification Image:
  // - Rotate according to orientation
  // - Resize to max 1800x1800 inside bounds
  // - Strip all metadata
  // - Progressive JPEG quality 78
  const verificationPipeline = sharp(inputBuffer)
    .rotate() // auto-orient based on EXIF
    .resize({
      width: 1800,
      height: 1800,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 78,
      progressive: true,
      chromaSubsampling: '4:2:0',
      mozjpeg: true,
    });

  const verificationBuffer = await verificationPipeline.toBuffer();
  const metadata = await sharp(verificationBuffer).metadata();

  const width = metadata.width || 1200;
  const height = metadata.height || 800;
  const verificationSize = verificationBuffer.length;

  // 2. Build Fast Admin List Thumbnail (max 450x450, quality 70):
  const thumbnailBuffer = await sharp(verificationBuffer)
    .resize({
      width: 450,
      height: 450,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 70,
      progressive: false,
    })
    .toBuffer();

  const thumbnailSize = thumbnailBuffer.length;
  const savingsPercent = Math.max(0, Math.round(((originalSize - verificationSize) / originalSize) * 100));

  console.log('[DriverBee ImageOptimizer] Document image compressed:', {
    originalKB: (originalSize / 1024).toFixed(1),
    verificationKB: (verificationSize / 1024).toFixed(1),
    thumbnailKB: (thumbnailSize / 1024).toFixed(1),
    dimensions: `${width}x${height}`,
    savings: `${savingsPercent}%`,
  });

  return {
    verificationBuffer,
    verificationSize,
    thumbnailBuffer,
    thumbnailSize,
    width,
    height,
    mimeType: 'image/jpeg',
    savingsPercent,
  };
}

/**
 * Generates an opaque, randomized server-side storage path.
 * Never preserves or uses the client-supplied original filename.
 */
export function generateSecureStoragePath(
  applicationId: string,
  docType: 'AADHAAR' | 'PAN' | 'DRIVING_LICENSE',
  isThumbnail: boolean = false
): string {
  const randomSuffix = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  const typeTag = docType.toLowerCase().replace(/_/g, '-');
  const variant = isThumbnail ? 'thumb' : 'verify';
  return `docs/${applicationId}/${typeTag}_${variant}_${randomSuffix}.jpg`;
}

/**
 * Helper to mask sensitive identity document numbers for UI display.
 * E.g. "123456789012" -> "XXXX XXXX 9012" (Aadhaar)
 * E.g. "ABCDE1234F"   -> "XXXXX 1234F" (PAN)
 */
export function maskDocumentNumber(docType: string, rawNumber: string | null | undefined): string {
  if (!rawNumber) return 'Not Provided';
  const clean = rawNumber.trim();
  if (docType === 'AADHAAR') {
    const digits = clean.replace(/\D/g, '');
    if (digits.length >= 4) {
      return `XXXX XXXX ${digits.slice(-4)}`;
    }
    return 'XXXX XXXX XXXX';
  }
  if (docType === 'PAN') {
    if (clean.length >= 5) {
      return `XXXXX ${clean.slice(-5)}`;
    }
    return 'XXXXX XXXXX';
  }
  if (docType === 'DRIVING_LICENSE') {
    if (clean.length >= 4) {
      return `DL-XXXX-${clean.slice(-4)}`;
    }
    return 'DL-XXXX-XXXX';
  }
  return clean;
}
