import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, Newspaper, User } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import NewsDetailModal from "./NewsDetailModal";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  author_name: string;
  category: string;
  published_date: string;
  created_at: string;
  cover_image?: string;
}

const NewsSection = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_date', { ascending: false })
        .limit(6);

      if (error) {
        throw error;
      }

      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const openNewsDetail = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    setIsModalOpen(true);
  };

  const closeNewsDetail = () => {
    setSelectedNews(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Handle URL fragment for opening specific news
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#news-detail-')) {
        const newsId = hash.replace('#news-detail-', '');
        const newsItem = news.find(item => item.id === newsId);
        if (newsItem) {
          openNewsDetail(newsItem);
        }
      }
    };

    // Check on component mount
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [news]);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "general": "bg-gray-100 text-gray-800",
      "academic": "bg-blue-100 text-blue-800",
      "activity": "bg-green-100 text-green-800",
      "announcement": "bg-red-100 text-red-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getCategoryName = (category: string) => {
    const names: { [key: string]: string } = {
      "general": "ทั่วไป",
      "academic": "วิชาการ", 
      "activity": "กิจกรรม",
      "announcement": "ประกาศ",
    };
    return names[category] || category;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section id="news" className="py-20 bg-gradient-news-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Newspaper className="w-4 h-4 mr-2" />
            ข่าวสาร
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ข่าวสารและประกาศล่าสุด
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            ติดตามข่าวสาร กิจกรรม และประกาศสำคัญต่าง ๆ 
            ของโรงเรียนบ้านค้อดอนแคนได้ที่นี่
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p>กำลังโหลดข่าวสาร...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-8">
            <p>ยังไม่มีข่าวสาร</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {news.map((item) => (
              <Card 
                key={item.id} 
                className="bg-white border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group cursor-pointer"
                onClick={() => openNewsDetail(item)}
              >
                <CardContent className="p-0">
                  {item.cover_image && (
                    <div className="w-full h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        width="400"
                        height="192"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge 
                        className={`${getCategoryColor(item.category)} border-0`}
                      >
                        {getCategoryName(item.category)}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                      {item.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                      {item.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span>{item.author_name}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(item.published_date)}</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        openNewsDetail(item);
                      }}
                    >
                      อ่านต่อ
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Newsletter Section */}
        <div className="bg-gradient-card rounded-2xl p-8 md:p-12 text-center border shadow-elegant">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              ติดตามข่าวสารจากเรา
            </h3>
            <p className="text-muted-foreground text-lg mb-8">
              สมัครรับข่าวสารและกิจกรรมใหม่ ๆ ของโรงเรียนส่งตรงถึงอีเมลของคุณ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="อีเมลของคุณ"
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button variant="default" size="lg">
                สมัครรับข่าวสาร
              </Button>
            </div>
          </div>
        </div>

        <NewsDetailModal
          news={selectedNews}
          isOpen={isModalOpen}
          onClose={closeNewsDetail}
        />
      </div>
    </section>
  );
};

export default NewsSection;