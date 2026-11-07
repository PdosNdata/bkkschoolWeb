import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ปุ่มไมค์: พูดภาษาไทยแล้วแปลงเป็นข้อความ (Web Speech API — Chrome/Edge/Android, Safari iOS 14.5+)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Recognition = any;

const getCtor = (): (new () => Recognition) | undefined => {
  if (typeof window === "undefined") return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

interface Props {
  /** ได้ข้อความสุดท้ายของแต่ละประโยคที่พูด */
  onText: (text: string) => void;
  /** ข้อความระหว่างพูด (ยังไม่จบประโยค) — ใช้แสดงตัวอย่าง */
  onInterim?: (text: string) => void;
  className?: string;
  /** สีปุ่มตอนยังไม่ฟัง */
  tone?: "sky" | "violet" | "emerald";
}

const TONES = {
  sky: "bg-white text-sky-700 ring-1 ring-sky-200 hover:bg-sky-50",
  violet: "bg-white text-violet-700 ring-1 ring-violet-200 hover:bg-violet-50",
  emerald: "bg-white text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-50",
};

const VoiceInputButton = ({ onText, onInterim, className = "", tone = "sky" }: Props) => {
  const { toast } = useToast();
  const [listening, setListening] = useState(false);
  const recRef = useRef<Recognition | null>(null);
  const onTextRef = useRef(onText);
  const onInterimRef = useRef(onInterim);
  onTextRef.current = onText;
  onInterimRef.current = onInterim;

  useEffect(() => () => recRef.current?.abort?.(), []);

  const toggle = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const Ctor = getCtor();
    if (!Ctor) {
      toast({
        title: "เบราว์เซอร์นี้ไม่รองรับไมค์ในเว็บ",
        description: "ใช้ Chrome หรือ Edge หรือแตะช่องพิมพ์แล้วกดไมค์บนแป้นพิมพ์มือถือแทนได้",
        variant: "destructive",
      });
      return;
    }
    const rec = new Ctor();
    rec.lang = "th-TH";
    rec.continuous = true;
    rec.interimResults = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const t = String(r[0]?.transcript ?? "").trim();
        if (r.isFinal) { if (t) onTextRef.current(t); } else interim += t;
      }
      onInterimRef.current?.(interim);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      if (e?.error === "not-allowed" || e?.error === "service-not-allowed") {
        toast({ title: "ยังไม่ได้อนุญาตไมค์", description: "กดอนุญาตการใช้ไมโครโฟนที่แถบที่อยู่ของเบราว์เซอร์ แล้วลองใหม่", variant: "destructive" });
      } else if (e?.error === "no-speech") {
        toast({ title: "ไม่ได้ยินเสียง", description: "ลองพูดใกล้ไมค์อีกนิด" });
      }
    };
    rec.onend = () => {
      setListening(false);
      onInterimRef.current?.("");
      recRef.current = null;
    };
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={listening ? "หยุดฟัง" : "กดแล้วพูด (ภาษาไทย)"}
      aria-pressed={listening}
      className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold shadow-sm transition active:scale-95 ${
        listening ? "animate-pulse bg-rose-500 text-white ring-4 ring-rose-200" : TONES[tone]
      } ${className}`}
    >
      {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      {listening ? "หยุด" : "พูด"}
    </button>
  );
};

export default VoiceInputButton;
