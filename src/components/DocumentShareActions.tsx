import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Share2, Link2, Facebook, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LineIcon from "@/components/LineIcon";
import { openLineShare } from "@/lib/lineShare";
import { withShareVersion, type SchoolDocument } from "@/lib/documents";

// The link people should share/copy/scan is the document's page on our own
// site, never the raw Supabase storage URL.
export const docPageUrl = (doc: Pick<SchoolDocument, "id">) =>
  withShareVersion(`${window.location.origin}/documents/${doc.id}`);

type ShareDoc = Pick<SchoolDocument, "id" | "title">;

/** Share menu (LINE / Facebook / other) + copy-link button for one document. */
const DocumentShareActions = ({ doc }: { doc: ShareDoc }) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(docPageUrl(doc));
      toast({ title: "คัดลอกลิงก์แล้ว", description: "วางลิงก์เพื่อแชร์ได้เลย" });
    } catch {
      toast({ title: "คัดลอกไม่สำเร็จ", variant: "destructive" });
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: doc.title, text: doc.title, url: docPageUrl(doc) });
      } catch {
        // user cancelled — do nothing
      }
      return;
    }
    handleCopy();
  };

  const handleShareLine = () => {
    openLineShare(`${doc.title}\n${docPageUrl(doc)}`, () =>
      toast({
        title: "คัดลอกข้อความแล้ว",
        description: "ถ้า LINE ไม่ขึ้นข้อความให้ ให้กดวาง (Ctrl+V) ในช่องแชทได้เลย",
      }),
    );
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(docPageUrl(doc))}`;
    window.open(url, "facebook-share", "width=600,height=400,scrollbars=yes,resizable=yes");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" title="แชร์">
            <Share2 className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleShareLine} className="text-[#06C755] focus:text-[#06C755]">
            <LineIcon className="w-4 h-4 mr-2" /> แชร์ไปที่ LINE
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareFacebook} className="text-[#1877F2] focus:text-[#1877F2]">
            <Facebook className="w-4 h-4 mr-2" /> แชร์ไปที่ Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareNative}>
            <Send className="w-4 h-4 mr-2" /> แชร์แบบอื่น ๆ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="ghost" size="sm" onClick={handleCopy} title="คัดลอกลิงก์">
        <Link2 className="w-4 h-4" />
      </Button>
    </>
  );
};

export default DocumentShareActions;
