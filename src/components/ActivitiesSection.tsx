import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight, ArrowLeft, Calendar, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ACTIVITIES_PAGE_SIZE = 3;
interface Activity {
  id: string;
  title: string;
  content: string;
  author_name: string;
  cover_image?: string;
  images?: string[];
  cover_image_index?: number;
  created_at: string;
}

// Activities store their photos in `images`, with `cover_image_index`
// picking which one is the cover — `cover_image` itself is never set.
const getCoverImage = (activity: Activity): string | undefined =>
  activity.cover_image || activity.images?.[activity.cover_image_index ?? 0];
const ActivitiesSection = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const fetchActivities = async (pageIndex: number) => {
    try {
      setLoading(true);
      const from = pageIndex * ACTIVITIES_PAGE_SIZE;
      const to = from + ACTIVITIES_PAGE_SIZE - 1;
      const {
        data,
        error,
        count
      } = await supabase.from('activities').select('*', { count: 'exact' })
        .in('category', ['กิจกรรมภายใน', 'กิจกรรมภายนอก'])
        .order('created_at', {
          ascending: false
        }).range(from, to);
      if (error) {
        throw error;
      }
      setActivities(data || []);
      setTotalCount(count ?? 0);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };
  const openActivityDetail = (activity: Activity) => {
    navigate(`/activities/${activity.id}`);
  };
  useEffect(() => {
    fetchActivities(page);
  }, [page]);
  const totalPages = Math.max(1, Math.ceil(totalCount / ACTIVITIES_PAGE_SIZE));
  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: document.getElementById('activities')?.offsetTop ?? 0, behavior: 'smooth' });
  };
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
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">กิจกรรมสร้างสรรค์</h2>
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
            {activities.map(activity => {
              const cover = getCoverImage(activity);
              return <Card key={activity.id} className="bg-white border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group cursor-pointer" onClick={() => openActivityDetail(activity)}>
                <CardContent className="p-0">
                  <div className="w-full h-48 overflow-hidden rounded-t-lg bg-gradient-primary relative">
                    {cover ? (
                      <img src={cover} alt={activity.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" width="400" height="192" loading="lazy" decoding="async" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                        {activity.title}
                      </div>
                    )}
                  </div>
                  
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
              </Card>;
            })}
          </div>}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mb-12">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => goToPage(page - 1)}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              ก่อนหน้า
            </Button>
            <span className="text-sm text-muted-foreground">
              หน้า {page + 1} จาก {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => goToPage(page + 1)}>
              หน้าถัดไป
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

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
      </div>
    </section>;
};
export default ActivitiesSection;