import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * จัดตำแหน่งเลื่อนหน้าเมื่อเปลี่ยนหน้า (เว็บเป็น SPA เบราว์เซอร์จึงทำให้เองไม่ถูก)
 *  - ไปหน้าใหม่ (คลิกลิงก์/เมนู)   → ขึ้นบนสุดทันที ไม่ค้างตำแหน่งเดิม เช่น ค้างที่ footer
 *  - ลิงก์มี #หัวข้อ (เช่น /#news)  → เริ่มบนสุด แล้วเลื่อนไปที่หัวข้อเมื่อหัวข้อแสดงแล้ว
 *  - กดย้อนกลับ/ไปข้างหน้า          → กลับไปตำแหน่งเดิมของหน้านั้น หลังเนื้อหาโหลดสูงพอ
 *    (ปล่อยเบราว์เซอร์ทำเองจะไปตกที่ footer เพราะตอนนั้นข้อมูลยังโหลดไม่เสร็จ หน้ายังสั้นอยู่)
 */
const MAX_WAIT_MS = 4000;

const ScrollManager = () => {
  const location = useLocation();
  const navType = useNavigationType();
  const positions = useRef<Record<string, number>>({});
  const currentKey = useRef(location.key);
  const first = useRef(true);

  // จำตำแหน่งของหน้าปัจจุบันไว้ตลอด (ใช้ตอนกดย้อนกลับมา)
  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    const save = () => {
      positions.current[currentKey.current] = window.scrollY;
    };
    window.addEventListener("scroll", save, { passive: true });
    // บันทึกตอนคลิกด้วย (ก่อนเปลี่ยนหน้า) — บางเบราว์เซอร์/สถานะหน้าไม่ส่ง scroll event ทุกครั้ง
    document.addEventListener("click", save, true);
    return () => {
      window.removeEventListener("scroll", save);
      document.removeEventListener("click", save, true);
    };
  }, []);

  // เปลี่ยน key ก่อนเบราว์เซอร์วาดหน้าใหม่ ตำแหน่งที่ขยับเพราะหน้าใหม่สั้นกว่าจะได้ไม่ไปทับค่าของหน้าเดิม
  useLayoutEffect(() => {
    currentKey.current = location.key;
  }, [location.key]);

  useEffect(() => {
    const isFirst = first.current;
    first.current = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    const stop = () => {
      cancelled = true;
    };
    // ผู้ใช้เลื่อนเองระหว่างรอ → หยุดเลื่อนอัตโนมัติ
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    const started = Date.now();

    const saved = positions.current[location.key];    if (navType === "POP" && !isFirst && saved !== undefined) {
      // กลับไปตำแหน่งเดิม: รอจนหน้ายาวพอ (ข้อมูลโหลดครบ) แล้วค่อยเลื่อน
      const restore = () => {
        if (cancelled) return;
        const tallEnough = document.documentElement.scrollHeight >= saved + window.innerHeight - 4;
        window.scrollTo({ top: saved, left: 0, behavior: "auto" });
        if (!tallEnough && Date.now() - started < MAX_WAIT_MS) timer = setTimeout(restore, 100);
      };
      restore();
    } else if (location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      const id = decodeURIComponent(location.hash.slice(1));
      // กระโดดไปที่หัวข้อทันที (ไม่ใช้ smooth) แล้วคอยจัดให้ตรงซ้ำจนเนื้อหาด้านบนโหลดเสร็จ
      // ไม่อย่างนั้นรูป/การ์ดที่โหลดทีหลังจะดันหัวข้อลงไป ผู้ใช้ไม่ได้อยู่ตรงหัวข้อจริง
      const seek = () => {
        if (cancelled) return;
        const el = document.getElementById(id);
        if (el) {
          const offset = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
          if (Math.abs(el.getBoundingClientRect().top - offset) > 4) {
            el.scrollIntoView({ behavior: "auto", block: "start" });
          }
        }
        if (Date.now() - started < MAX_WAIT_MS + 2000) timer = setTimeout(seek, 150);
      };
      timer = setTimeout(seek, 60);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
    };
  }, [location.key, location.hash, navType]);

  return null;
};

export default ScrollManager;
