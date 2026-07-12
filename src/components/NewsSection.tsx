import { useState, useEffect } from "react";
import { Stock, NewsItem } from "../types";
import { generateDefaultNews } from "../utils/stockData";
import { getApiUrl } from "../utils/api";
import { Newspaper, Sparkles, AlertCircle, CheckCircle2, MinusCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface NewsSectionProps {
  stock: Stock;
}

export default function NewsSection({ stock }: NewsSectionProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchAINews = async (forceAI = false) => {
    setLoading(true);
    setError("");
    
    // Default mock local news to feed into the API or fallback
    const defaults = generateDefaultNews(stock);

    try {
      const response = await fetch(getApiUrl("/api/news"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: stock.symbol,
          name: stock.name,
          market: stock.market,
          headlines: defaults.map(d => d.title)
        })
      });

      if (!response.ok) {
        throw new Error("서버 통신 오류가 발생했습니다.");
      }

      const data = await response.json();
      
      // Map API news array with local IDs for keys
      const mappedNews: NewsItem[] = data.news.map((item: any, idx: number) => ({
        id: item.id || `news_${stock.symbol}_${idx}`,
        title: item.title,
        source: item.source || "Finance AI News",
        time: item.time || "방금 전",
        sentiment: item.sentiment || "neutral",
        summary: item.summary
      }));

      setNews(mappedNews);
    } catch (err: any) {
      console.error("Error fetching AI news:", err);
      // Fallback to standard mock news if API key is missing or errored
      const mappedDefaults: NewsItem[] = defaults.map((item, idx) => ({
        id: `news_mock_${stock.symbol}_${idx}`,
        title: item.title,
        source: item.source,
        time: item.time,
        sentiment: item.sentiment,
        summary: item.summary
      }));
      setNews(mappedDefaults);
    } finally {
      setLoading(false);
    }
  };

  // Fetch news when stock changes
  useEffect(() => {
    fetchAINews();
    setExpandedId(null);
  }, [stock]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md" id="news-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-emerald-500" />
            AI 실시간 뉴스 브리핑
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Gemini AI가 업계 수급 현황 및 외신 기사를 수집하여 호재(Bull)와 악재(Bear)를 원페이지 요약합니다.
          </p>
        </div>

        <button
          onClick={() => fetchAINews(true)}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50 transition-all cursor-pointer"
          id="btn-refresh-news"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin text-emerald-500" : ""}`} />
          AI 최신 요약 갱신
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col justify-center items-center gap-3">
          <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
          <p className="text-xs text-slate-500 font-mono">가장 고신뢰의 해외/국내 뉴스를 요약 중...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 rounded-xl border border-rose-500/10 bg-rose-500/5 text-rose-400 text-xs">
          {error}
        </div>
      ) : (
        <div className="space-y-3">
          {news.map((item) => {
            const isExpanded = expandedId === item.id;
            
            // Badge styles
            let badgeBg = "bg-slate-950 text-slate-400 border border-slate-800";
            let badgeLabel = "중립 (Neutral)";
            let Icon = MinusCircle;

            if (item.sentiment === "bullish") {
              badgeBg = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
              badgeLabel = "호재 (Bullish)";
              Icon = CheckCircle2;
            } else if (item.sentiment === "bearish") {
              badgeBg = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
              badgeLabel = "악재 (Bearish)";
              Icon = AlertCircle;
            }

            return (
              <div
                key={item.id}
                onClick={() => toggleExpand(item.id)}
                className={`rounded-xl border border-slate-800/60 bg-slate-950/20 hover:bg-slate-950/40 hover:border-slate-800 cursor-pointer p-4 transition-all duration-200 ${
                  isExpanded ? "border-slate-700/80 bg-slate-950/50" : ""
                }`}
                id={`news-row-${item.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${badgeBg}`}>
                        <Icon className="h-3 w-3 shrink-0" />
                        {badgeLabel}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{item.source} • {item.time}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-200 hover:text-white transition-colors leading-snug">
                      {item.title}
                    </h4>
                  </div>

                  <div className="text-slate-500 pt-1">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3.5 pt-3.5 border-t border-slate-800/50 text-xs text-slate-400 leading-relaxed font-normal">
                    <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                      <Sparkles className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-300 font-bold block mb-1">AI 3초 요약 브리핑:</strong>
                        {item.summary}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
