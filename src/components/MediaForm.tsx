import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MediaForm = () => {
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [publishedDate, setPublishedDate] = useState<Date>();
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !authorName || !description || !mediaUrl || !mediaType) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "กรุณากรอกข้อมูลที่จำเป็นทั้งหมด",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('media_resources')
        .insert({
          title,
          author_name: authorName,
          published_date: publishedDate ? format(publishedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          description,
          media_url: mediaUrl,
          media_type: mediaType,
          thumbnail_url: thumbnailUrl || null,
        });

      if (error) throw error;

      toast({
        title: "เพิ่มข้อมูลสำเร็จ",
        description: "เพิ่มข้อมูลสื่อออนไลน์เรียบร้อยแล้ว",
      });

      // Reset form
      setTitle("");
      setAuthorName("");
      setPublishedDate(undefined);
      setDescription("");
      setMediaUrl("");
      setMediaType("");
      setThumbnailUrl("");

    } catch (error) {
      console.error('Error adding media resource:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          เพิ่มข้อมูลคลังสื่อออนไลน์
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">หัวข้อ *</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="หัวข้อสื่อการเรียนรู้"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authorName">ผู้เขียน *</Label>
              <Input
                id="authorName"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="ชื่อผู้เขียนหรือผู้สร้าง"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>วันที่</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !publishedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {publishedDate ? format(publishedDate, "dd/MM/yyyy") : "เลือกวันที่"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={publishedDate}
                    onSelect={setPublishedDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mediaType">ประเภทสื่อ *</Label>
              <Select value={mediaType} onValueChange={setMediaType} required>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทสื่อ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">วิดีโอ</SelectItem>
                  <SelectItem value="website">เว็บไซต์</SelectItem>
                  <SelectItem value="document">เอกสาร</SelectItem>
                  <SelectItem value="image">รูปภาพ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mediaUrl">ลิงค์สื่อ *</Label>
            <Input
              id="mediaUrl"
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... หรือ https://facebook.com/... หรือลิงค์อื่นๆ"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">ลิงค์รูปภาพตัวอย่าง (ไม่บังคับ)</Label>
            <Input
              id="thumbnailUrl"
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียด *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="รายละเอียดของสื่อการเรียนรู้..."
              rows={4}
              required
            />
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MediaForm;