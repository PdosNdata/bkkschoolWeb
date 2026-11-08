// ย่อรูปก่อนอัพโหลด ใช้ร่วมกันทุกฟอร์มที่อัพโหลดรูป — ประหยัดโควตา Storage/Egress ของ Supabase
// (โปรเจกต์นี้แชร์กับ CAI และระบบ LINE OA รูปใหญ่ทำให้โควตาฟรี Cached Egress 5 GB/เดือนหมดเร็ว)
const DEFAULT_MAX_SIDE = 1600; // รูปโปรไฟล์ส่ง 600, รูปปกส่ง 1000
const KEEP_BELOW_BYTES = 300 * 1024; // ขนาดไม่เกินและไฟล์เล็กอยู่แล้ว ไม่ต้องทำซ้ำ
const JPEG_QUALITY = 0.8;
const WEBP_QUALITY = 0.82;

/**
 * ย่อรูปใหญ่ก่อนอัพโหลด: ด้านยาวไม่เกิน maxSide
 * - JPEG/WebP → JPEG · PNG → WebP เพื่อคงพื้นโปร่งใส (เบราว์เซอร์ที่ทำ WebP ไม่ได้ → JPEG พื้นขาว)
 * - ถ้าย่อไม่ได้ (เช่น GIF, HEIC ที่เบราว์เซอร์ไม่รองรับ, ไฟล์ที่ไม่ใช่รูป) หรือย่อแล้วไม่เล็กลง ใช้ไฟล์เดิม
 */
export async function shrinkImage(file: File, maxSide: number = DEFAULT_MAX_SIDE): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < KEEP_BELOW_BYTES) {
      bmp.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bmp.close();
      return file;
    }
    const toBlob = (type: string, quality: number) =>
      new Promise<Blob | null>((r) => canvas.toBlob(r, type, quality));

    let blob: Blob | null = null;
    if (file.type === "image/png") {
      ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      blob = await toBlob("image/webp", WEBP_QUALITY);
      if (blob?.type !== "image/webp") blob = null; // Safari รุ่นเก่าคืน PNG มาแทน
    }
    if (!blob) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      blob = await toBlob("image/jpeg", JPEG_QUALITY);
    }
    bmp.close();
    if (!blob || blob.size >= file.size) return file;
    const ext = blob.type === "image/webp" ? ".webp" : ".jpg";
    return new File([blob], file.name.replace(/\.\w+$/, "") + ext, { type: blob.type });
  } catch {
    return file;
  }
}
