/** Maximum source file size accepted for an item image, before resizing. */
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

/**
 * Reads an image file, resizes it (max width) and returns a compressed JPEG data URL.
 * This keeps images small so they fit comfortably in localStorage.
 */
export function fileToResizedDataUrl(file: File, maxWidth = 600, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      reject(new Error('ไฟล์รูปภาพมีขนาดใหญ่เกินไป (ไม่เกิน 8MB)'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        if (!img.width || !img.height) {
          reject(new Error('ไม่สามารถอ่านขนาดของรูปภาพนี้ได้'));
          return;
        }
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('ไม่สามารถสร้าง canvas context ได้'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('ไม่สามารถโหลดรูปภาพนี้ได้ ไฟล์อาจเสียหายหรือไม่ใช่รูปภาพ'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
    reader.readAsDataURL(file);
  });
}
