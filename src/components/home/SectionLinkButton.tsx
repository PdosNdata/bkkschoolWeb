import { useState } from "react";
import { Check, Link2 } from "lucide-react";

/** ปุ่ม "คัดลอกลิงก์" มาที่ส่วนหนึ่งของหน้าแรก เช่น https://www.bankhodonkhan.ac.th/#news (ใช้ใส่ใน LINE OA / Facebook) */
const SectionLinkButton = ({ anchor, label }: { anchor: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const url = `${window.location.origin}/#${anchor}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("คัดลอกลิงก์นี้", url);
    }
    window.history.replaceState(null, "", `#${anchor}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button type="button" onClick={() => void copy()} title={`คัดลอกลิงก์มาที่${label}`}
      className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary shadow ring-1 ring-primary/20 transition hover:bg-white">
      {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
      {copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}
    </button>
  );
};

export default SectionLinkButton;
