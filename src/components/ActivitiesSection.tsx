import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight, Calendar, User } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ActivitiesDetailModal from "./ActivitiesDetailModal";
interface Activity {
  id: string;
  title: string;
  content: string;
  author_name: string;
  cover_image?: string;
  created_at: string;
}
const ActivitiesSection = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fetchActivities = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('activities').select('*').order('created_at', {
        ascending: false
      }).limit(6);
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
  const openActivityDetail = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };
  const closeActivityDetail = () => {
    setSelectedActivity(null);
    setIsModalOpen(false);
  };
  useEffect(() => {
    fetchActivities();
  }, []);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  return <section id="activities" className="py-20 bg-gradient-news-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Users className="w-4 h-4 mr-2" />
            กิจกรรมสร้างสรรค์
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">กิจกรรมภายในและภายนอกโรงเรียน</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            ส่งเสริมการเรียนรู้ผ่านกิจกรรมที่หลากหลาย 
            เพื่อพัฒนาทักษะชีวิตและความสามารถในด้านต่าง ๆ อย่างรอบด้าน
          </p>
        </div>

        {loading ? <div className="text-center py-8">
            <p>กำลังโหลดกิจกรรม...</p>
          </div> : activities.length === 0 ? <div className="text-center py-8">
            <p>ยังไม่มีกิจกรรม</p>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {activities.map(activity => <Card key={activity.id} className="bg-white border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group cursor-pointer" onClick={() => openActivityDetail(activity)}>
                <CardContent className="p-0">
                  {activity.cover_image && <div className="w-full h-48 overflow-hidden rounded-t-lg">
                      <img src={activity.cover_image} alt={activity.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" width="400" height="192" loading="lazy" decoding="async" />
                    </div>}
                  
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                      {activity.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                      {activity.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span>{activity.author_name}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(activity.created_at)}</span>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground" onClick={e => {
                e.stopPropagation();
                openActivityDetail(activity);
              }}>
                      อ่านต่อ
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>)}
          </div>}

        {/* Highlight Section */}
        <div className="bg-gradient-primary rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            ร่วมเป็นส่วนหนึ่งของกิจกรรมสุดพิเศษ
          </h3>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            ทุกภาคเรียนมีกิจกรรมพิเศษและการแข่งขันที่จะช่วยพัฒนาศักยภาพของนักเรียน
            ให้สามารถแสดงออกและเรียนรู้ได้อย่างเต็มที่
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/activities">
              <Button variant="hero" size="lg" className="bg-white text-primary hover:bg-white/90">
                ดูกิจกรรมทั้งหมด
              </Button>
            </Link>
            <Link to="/activities-form">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                เพิ่มกิจกรรม
              </Button>
            </Link>
          </div>
        </div>

        <ActivitiesDetailModal activity={selectedActivity} isOpen={isModalOpen} onClose={closeActivityDetail} />
      </div>
    </section>;
};
export default ActivitiesSection;