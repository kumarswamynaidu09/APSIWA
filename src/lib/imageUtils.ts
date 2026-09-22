/**
 * Image Compression & Size Optimization Utility for APSIWA
 * Compresses and resizes images on the client side using HTML5 Canvas
 * to minimize database storage costs and optimize load performance.
 */

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default: 0.75)
  maxSizeBytes?: number; // e.g. 100KB = 100 * 1024
}

/**
 * Compresses an image File or Data URL and returns an optimized Base64 JPEG string
 */
export async function compressImage(
  source: File | string,
  options: CompressImageOptions = {}
): Promise<{ dataUrl: string; sizeBytes: number; sizeKb: number }> {
  const {
    maxWidth = 600,
    maxHeight = 600,
    quality = 0.75
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Maintain aspect ratio while bounding within maxWidth & maxHeight
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context not available'));
        return;
      }

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Export as compressed JPEG
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      // Calculate approximate size in bytes
      const stringLength = compressedDataUrl.length - 'data:image/jpeg;base64,'.length;
      const sizeBytes = Math.round((stringLength * 3) / 4);
      const sizeKb = Math.round(sizeBytes / 1024);

      resolve({
        dataUrl: compressedDataUrl,
        sizeBytes,
        sizeKb
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Validates file type and raw size before processing
 */
export function validateImageFile(file: File, maxRawMb = 10): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPG, PNG, or WEBP).'
    };
  }

  const maxBytes = maxRawMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `Image file size is too large (max ${maxRawMb}MB). Please select a smaller photo.`
    };
  }

  return { valid: true };
}
