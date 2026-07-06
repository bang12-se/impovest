import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { collection, query, where, onSnapshot, deleteDoc, doc, limit } from "firebase/firestore";
import { db } from "../firebase";
import { Stock } from "../types";
import { STOCKS } from "../utils/stockData";
import { History, Sparkles, Trash2, ArrowRight, RefreshCw } from "lucide-react";

interface AnalysisHistoryItem {
  id?: string;
  symbol: string;
  name: string;
  market: "US" | "KR";
  score: number;
  rating: number;
  overallOpinion: "positive" | "negative" | "neutral";
  analyzedAt: string;
}

interface AnalysisHistoryProps {
  currentUser: User | null;
  onSelectStock: (stock: Stock) => void;
  activeStockSymbol: string;
  refreshTrigger?: number; // Used to trigger local storage reload when a new analysis is run
  marketStocks?: Stock[];
}

export default function AnalysisHistory({ 
  currentUser, 
  onSelectStock, 
  activeStockSymbol,
  refreshTrigger = 0,
  marketStocks = STOCKS
}: AnalysisHistoryProps) {
  const [historyItems, setHistoryItems] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync / Load History
  useEffect(() => {
    if (!currentUser) {
      // Guest Load from LocalStorage
      const stored = localStorage.getItem("sp_analysis_history");
      if (stored) {
        setHistoryItems(JSON.parse(stored));
      } else {
        // Seed some initial items for a rich guest experience
        const defaults: AnalysisHistoryItem[] = [
          {
            symbol: "005930",
            name: "삼성전자",
            market: "KR",
            score: 85,
            rating: 4,
            overallOpinion: "positive",
            analyzedAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
          },
          {
            symbol: "NVDA",
            name: "NVIDIA Corp.",
            market: "US",
            score: 91,
            rating: 5,
            overallOpinion: "positive",
            analyzedAt: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
          }
        ];
        localStorage.setItem("sp_analysis_history", JSON.stringify(defaults));
        setHistoryItems(defaults);
      }
      return;
    }

    setLoading(true);
    // Realtime Sync from Firestore
    const q = query(
      collection(db, "analyses"),
      where("uid", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: AnalysisHistoryItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          symbol: data.symbol,
          name: data.name,
          market: data.market || "KR",
          score: data.score,
          rating: data.rating,
          overallOpinion: data.overallOpinion,
          analyzedAt: data.analyzedAt
        });
      });

      // Sort by analyzedAt desc & limit to 6 items to keep UI compact
      list.sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime());
      setHistoryItems(list.slice(0, 6));
      setLoading(false);
    }, (err) => {
      console.error("Analysis history snapshot error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, refreshTrigger]);

  const handleDeleteItem = async (e: React.MouseEvent, item: AnalysisHistoryItem) => {
    e.stopPropagation();

    if (!currentUser) {
      // Guest local removal
      const updated = historyItems.filter(h => h.symbol !== item.symbol);
      localStorage.setItem("sp_analysis_history", JSON.stringify(updated));
      setHistoryItems(updated);
      return;
    }

    if (!item.id) return;

    try {
      await deleteDoc(doc(db, "analyses", item.id));
    } catch (err) {
      console.error("DB remove analysis history error:", err);
    }
  };

  const getFullStockInfo = (symbol: string): Stock | undefined => {
    return marketStocks.find(s => s.symbol === symbol);
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" }) + " " + 
             d.toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit", hour12: false });
    } catch {
      return "방금 전";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md" id="analysis-history-panel">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 select-none">
          <History className="h-4 w-4 text-emerald-500" />
          최근 AI 분석 이력 <span>({historyItems.length})</span>
        </h3>
        {!currentUser && (
          <span className="text-[9px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono">
            Guest
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-8 flex justify-center items-center">
          <RefreshCw className="h-5 w-5 text-emerald-500 animate-spin" />
        </div>
      ) : historyItems.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-850 rounded-xl bg-slate-950/10">
          <History className="h-7 w-7 text-slate-700 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">이전 분석 기록이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
          {historyItems.map((item, index) => {
            const stock = getFullStockInfo(item.symbol);
            const isActive = activeStockSymbol === item.symbol;
            
            let opinionBadge = "text-slate-500 bg-slate-950 border border-slate-900";
            let opinionText = "중립";
            if (item.overallOpinion === "positive") {
              opinionBadge = "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
              opinionText = "긍정";
            } else if (item.overallOpinion === "negative") {
              opinionBadge = "text-rose-400 bg-rose-500/10 border border-rose-500/20";
              opinionText = "주의";
            }

            return (
              <div
                key={(item.id || item.symbol) + index}
                onClick={() => {
                  if (stock) {
                    onSelectStock(stock);
                  } else {
                    // Fallback to minimal stock object if not in list
                    onSelectStock({
                      symbol: item.symbol,
                      name: item.name,
                      market: item.market,
                      currentPrice: item.score * 1000, // pseudo
                      change: 0,
                      changePercent: 0,
                      high: item.score * 1010,
                      low: item.score * 990,
                      volume: 100000,
                      sector: "기타",
                      description: "AI 분석 이력 복구 종목",
                      currency: item.market === "KR" ? "KRW" : "USD"
                    });
                  }
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isActive 
                    ? "bg-slate-800/50 border-emerald-500/40" 
                    : "bg-slate-950/20 border-slate-850 hover:bg-slate-800/20"
                }`}
                id={`history-item-${item.symbol}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-300 text-xs truncate max-w-[90px]">{item.name}</span>
                    <span className="text-[9px] font-mono font-semibold text-slate-500 bg-slate-900 px-1 rounded">
                      {item.symbol}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">{formatTime(item.analyzedAt)}</div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-300 font-mono">
                      {item.score}
                      <span className="text-[9px] font-normal text-slate-500 ml-0.5">점</span>
                    </div>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${opinionBadge}`}>
                      {opinionText}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteItem(e, item)}
                    className="text-slate-600 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800/80 transition-colors"
                    id={`btn-delete-history-${item.symbol}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
