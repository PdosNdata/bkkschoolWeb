import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, ArrowLeft, Newspaper, User } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import NewsDetailModal from "./NewsDetailModal";

const NEWS_PAGE_SIZE = 3;

// One vivid colour family per news category (full class strings for Tailwind)
const NEWS_THEMES: Record<string, { border: string; tint: string; title: string; btn: string; glow: string; ring: string }> = {
  general: { border: "from-sky-400 via-blue-500 to-indigo-500", tint: "from-sky-50 to-white", title: "text-blue-700", btn: "from-sky-500 to-blue-600", glow: "shadow-blue-400/40", ring: "ring-blue-400" },
  academic: { border: "from-violet-400 via-purple-500 to-fuchsia-500", tint: "from-violet-50 to-white", title: "text-purple-700", btn: "from-violet-500 to-purple-600", glow: "shadow-purple-400/40", ring: "ring-purple-400" },
  activity: { border: "from-emerald-400 via-green-500 to-teal-500", tint: "from-emerald-50 to-white", title: "text-emerald-700", btn: "from-emerald-500 to-teal-600", glow: "shadow-emerald-400/40", ring: "ring-emerald-400" },
  announcement: { border: "from-rose-400 via-red-500 to-orange-500", tint: "from-rose-50 to-white", title: "text-rose-700", btn: "from-rose-500 to-red-600", glow: "shadow-rose-400/40", ring: "ring-rose-400" },
};

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
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchNews = async (pageIndex: number) => {
    try {
      setLoading(true);
      const from = pageIndex * NEWS_PAGE_SIZE;
      const to = from + NEWS_PAGE_SIZE - 1;
      const { data, error, count } = await supabase
        .from('news')
        .select('*', { count: 'exact' })
        .order('published_date', { ascending: false })
        .range(from, to);

      if (error) {
        throw error;
      }

      setNews(data || []);
      setTotalCount(count ?? 0);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / NEWS_PAGE_SIZE));
  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: document.getElementById('news')?.offsetTop ?? 0, behavior: 'smooth' });
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
    fetchNews(page);
  }, [page]);

  // Handle URL fragment for opening specific news (e.g. from a shared link) —
  // the item may not be on the currently loaded page, so fall back to
  // fetching it directly by id.
  useEffect(() => {
    const handleHashChange = async () => {
      const hash = window.location.hash;
      if (hash.startsWith('#news-detail-')) {
        const newsId = hash.replace('#news-detail-', '');
        const newsItem = news.find(item => item.id === newsId);
        if (newsItem) {
          openNewsDetail(newsItem);
          return;
        }

        const { data } = await supabase
          .from('news')
          .select('*')
          .eq('id', newsId)
          .maybeSingle();
        if (data) {
          openNewsDetail(data);
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
            {news.map((item) => {
              const t = NEWS_THEMES[item.category] ?? NEWS_THEMES.general;
              return (
                <div
                  key={item.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => openNewsDetail(item)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openNewsDetail(item); } }}
                  className={`group cursor-pointer rounded-2xl bg-gradient-to-br ${t.border} p-[3px] shadow-lg ${t.glow} transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${t.ring}`}
                >
                  <div className={`flex h-full flex-col overflow-hidden rounded-[0.85rem] bg-gradient-to-b ${t.tint}`}>
                    <div className="relative h-48 overflow-hidden">
                      {item.cover_image ? (
                        <img
                          src={item.cover_image}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          width="400"
                          height="192"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${t.border}`}>
                          <Newspaper className="h-12 w-12 text-white/90 drop-shadow" />
                        </div>
                      )}
                      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/35 to-transparent" />
                      <span className={`absolute left-3 top-3 rounded-full bg-gradient-to-r ${t.btn} px-3 py-1 text-xs font-bold text-white shadow`}>
                        {getCategoryName(item.category)}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className={`mb-2 line-clamp-2 text-lg font-bold leading-snug ${t.title}`}>{item.title}</h3>
                      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-700">{item.content}</p>
                      <div className="mb-4 mt-auto flex items-center justify-between gap-2 text-xs text-gray-600">
                        <span className="flex min-w-0 items-center"><User className="mr-1 h-4 w-4 shrink-0" /><span className="truncate">{item.author_name}</span></span>
                        <span className="flex shrink-0 items-center"><Calendar className="mr-1 h-4 w-4" />{formatDate(item.published_date)}</span>
                      </div>
                      <span className={`inline-flex w-fit items-center gap-1 rounded-full bg-gradient-to-r ${t.btn} px-5 py-2 text-sm font-semibold text-white shadow-md transition-all group-hover:gap-2 group-hover:shadow-lg`}>
                        อ่านต่อ <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mb-12">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => goToPage(page - 1)}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              ก่อนหน้า
            </Button>
            <span className="text-sm text-muted-foreground">
              หน้า {page + 1} จาก {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => goToPage(page + 1)}
            >
              หน้าถัดไป
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
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