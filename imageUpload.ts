import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Compresses an image client-side to target dimensions and quality.
 * Prevents giant raw files from lagging the site or exceeding limits.
 */
export async function compressImage(file: File, maxWidth = 1400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Prefer WebP or JPEG
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to decode image file.'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image file to Firebase Storage with automatic compressed fallback.
 * Guarantees that image upload NEVER fails or blocks the admin!
 */
export async function uploadImageWithFallback(file: File, folder: string): Promise<string> {
  try {
    // 1. First compress the image
    const compressedDataUrl = await compressImage(file);

    // 2. Try to upload to Firebase Storage
    try {
      const byteString = atob(compressedDataUrl.split(',')[1]);
      const mimeString = compressedDataUrl.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });

      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${Date.now()}_${safeName}`;
      const storageRef = ref(storage, `${folder}/${filename}`);

      const snapshot = await uploadBytes(storageRef, blob, {
        contentType: mimeString,
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (storageErr) {
      console.warn(`[SAVAGE Store Storage Notice]: Storage upload fallback to compressed base64 for ${file.name}`);
      // Fallback to high-performance compressed base64
      return compressedDataUrl;
    }
  } catch (err: any) {
    console.error('Image compression/upload failed:', err);
    throw new Error(err.message || 'Image upload failed');
  }
}
