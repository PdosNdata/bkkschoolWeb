import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MediaForm from "@/components/MediaForm";
import MediaList from "@/components/MediaList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, List } from "lucide-react";

interface MediaResource {
  id: string;
  title: string;
  author_name: string;
  published_date: string;
  description: string;
  media_url: string;
  media_type: string;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

const MediaFormPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("list");
  const [editingMedia, setEditingMedia] = useState<MediaResource | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (media: MediaResource) => {
    setEditingMedia(media);
    setActiveTab("form");
  };

  const handleFormSuccess = () => {
    setEditingMedia(null);
    setActiveTab("list");
    setRefreshTrigger(prev => prev + 1);
  };

  const handleNewMedia = () => {
    setEditingMedia(null);
    setActiveTab("form");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              ย้อนกลับ
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-primary">คลังสื่อออนไลน์</h1>
              <p className="text-lg text-muted-foreground">เพิ่มและจัดการสื่อการเรียนรู้ออนไลน์</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                รายการสื่อ
              </TabsTrigger>
              <TabsTrigger value="form" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {editingMedia ? 'แก้ไขสื่อ' : 'เพิ่มสื่อใหม่'}
              </TabsTrigger>
            </TabsList>
            
            {activeTab === "list" && (
              <Button onClick={handleNewMedia} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                เพิ่มสื่อใหม่
              </Button>
            )}
          </div>

          <TabsContent value="list" className="space-y-4">
            <MediaList 
              onEdit={handleEdit} 
              refreshTrigger={refreshTrigger}
            />
          </TabsContent>

          <TabsContent value="form">
            <MediaForm 
              editingMedia={editingMedia}
              onSuccess={handleFormSuccess}
            />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default MediaFormPage;