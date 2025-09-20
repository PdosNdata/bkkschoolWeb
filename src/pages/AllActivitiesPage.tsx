import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, User, Share2, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  id: string;
  title: string;
  content: string;
  author_name: string;
  cover_image?: string;
  created_at: string;
}

const AllActivitiesPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAllActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllActivities();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = (activity: Activity, platform: 'facebook') => {
    const baseUrl = 'https://www.bankhodonkan.ac.th';
    const activityUrl = `${baseUrl}/#activity-detail-${activity.id}`;
    
    if (platform === 'facebook') {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(activityUrl)}`;
      window.open(facebookUrl, '_blank', 'width=600,height=400');
    }

    toast({
      title: "แชร์สำเร็จ",
      description: `เปิดหน้าต่างแชร์ไปยัง Facebook แล้ว`,
    });
  };

  const handleCopyLink = (activity: Activity) => {
    const baseUrl = 'https://www.bankhodonkan.ac.th';
    const activityUrl = `${baseUrl}/#activity-detail-${activity.id}`;
    
    navigator.clipboard.writeText(activityUrl).then(() => {
      toast({
        title: "คัดลอกลิงค์สำเร็จ",
        description: "ลิงค์ถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
      });
    }).catch(() => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถคัดลอกลิงค์ได้",
        variant: "destructive"
      });
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Users className="w-4 h-4 mr-2" />
            กิจกรรมสร้างสรรค์
          </Badge>
          <h1 className="text-4xl font-bold text-primary mb-4">กิจกรรมทั้งหมด</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            รวมกิจกรรมสร้างสรรค์ทั้งหมดของโรงเรียน เพื่อพัฒนาทักษะชีวิตและความสามารถในด้านต่าง ๆ อย่างรอบด้าน
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p>กำลังโหลดกิจกรรม...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <p>ยังไม่มีกิจกรรม</p>
          </div>
        ) : (
          <div className="space-y-8">
            {activities.map((activity) => (
              <Card key={activity.id} className="bg-white border-0 shadow-elegant">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    {activity.cover_image && (
                      <div className="md:col-span-1">
                        <div className="w-full h-64 overflow-hidden rounded-lg">
                          <img
                            src={activity.cover_image}
                            alt={activity.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className={activity.cover_image ? "md:col-span-2" : "md:col-span-3"}>
                      <h2 className="text-2xl font-bold text-foreground mb-4">
                        {activity.title}
                      </h2>
                      
                      <div className="prose prose-sm max-w-none text-muted-foreground mb-6">
                        <p className="whitespace-pre-wrap">{activity.content}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            <span>{activity.author_name}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{formatDate(activity.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleCopyLink(activity)}
                          className="flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          คัดลอกลิงค์
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleShare(activity, 'facebook')}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        >
                          <Share2 className="w-4 h-4" />
                          แชร์ Facebook
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AllActivitiesPage;