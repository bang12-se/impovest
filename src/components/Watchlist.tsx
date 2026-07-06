import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Stock, WatchlistItem } from "../types";
import { STOCKS } from "../utils/stockData";
import { Star, Plus, Trash2, ArrowRight, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

interface WatchlistProps {
  currentUser: User | null;
  onSelectStock: (stock: Stock) => void;
  activeStockSymbol: string;
  marketStocks?: Stock[];
}

export default function Watchlist({ currentUser, onSelectStock, activeStockSymbol, marketStocks = STOCKS }: WatchlistProps) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync Watchlist
  useEffect(() => {
    if (!currentUser) {
      // Load from LocalStorage for Guest
      const stored = localStorage.getItem("sp_watchlist");
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        // Seed default watchlist for guest experience
        const defaults: WatchlistItem[] = [
          { symbol: "005930", name: "삼성전자", market: "KR", addedAt: new Date().toISOString() },
          { symbol: "NVDA", name: "NVIDIA Corp.", market: "US", addedAt: new Date().toISOString() },
          { symbol: "TSLA", name: "Tesla Inc.", market: "US", addedAt: new Date().toISOString() }
        ];
        localStorage.setItem("sp_watchlist", JSON.stringify(defaults));
        setItems(defaults);
      }
      return;
    }

    setLoading(true);
    // Realtime Sync from Firestore
    const q = query(
      collection(db, "watchlists"),
      where("uid", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: WatchlistItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          symbol: data.symbol,
          name: data.name,
          market: data.market,
          addedAt: data.addedAt
        });
      });
      // Sort by addedAt desc
      list.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
      setItems(list);
      setLoading(false);
    }, (err) => {
      console.error("Watchlist Snapshot Error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const toggleWatchlist = async (stock: Stock) => {
    const isExist = items.some(item => item.symbol === stock.symbol);

    if (!currentUser) {
      // Guest Toggle
      let updated: WatchlistItem[];
      if (isExist) {
        updated = items.filter(item => item.symbol !== stock.symbol);
      } else {
        updated = [...items, { symbol: stock.symbol, name: stock.name, market: stock.market, addedAt: new Date().toISOString() }];
      }
      localStorage.setItem("sp_watchlist", JSON.stringify(updated));
      setItems(updated);
      return;
    }

    // Firestore Toggle
    const docId = `${currentUser.uid}_${stock.symbol}`;
    const docRef = doc(db, "watchlists", docId);

    try {
      if (isExist) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {
          uid: currentUser.uid,
          symbol: stock.symbol,
          name: stock.name,
          market: stock.market,
          addedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Error toggling watchlist in DB:", err);
    }
  };

  const getFullStockInfo = (symbol: string): Stock | undefined => {
    return marketStocks.find(s => s.symbol === symbol);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md" id="watchlist-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-400 fill-amber-400/20" />
          관심 종목 <span>({items.length})</span>
        </h3>
        
        {!currentUser && (
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full uppercase font-mono">
            Guest Local
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-12 flex justify-center items-center">
          <RefreshCw className="h-6 w-6 text-emerald-500 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
          <Star className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400 font-medium">등록된 관심 종목이 없습니다.</p>
          <p className="text-xs text-slate-500 mt-1">상단에서 주식을 검색한 후 별표를 눌러 추가해 보세요.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {items.map((item) => {
            const stock = getFullStockInfo(item.symbol);
            if (!stock) return null;
            const isPos = stock.change >= 0;
            const isActive = activeStockSymbol === item.symbol;

            return (
              <div
                key={item.symbol}
                onClick={() => onSelectStock(stock)}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isActive 
                    ? "bg-slate-800/60 border-emerald-500/50 shadow-md shadow-emerald-500/5" 
                    : "bg-slate-950/40 border-slate-800/50 hover:bg-slate-800/30 hover:border-slate-800"
                }`}
                id={`watchlist-item-${item.symbol}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-200 text-sm tracking-tight">{stock.name}</span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded font-mono">
                      {stock.symbol}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{stock.sector}</div>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <div className="font-extrabold text-sm text-slate-100 font-mono">
                      {stock.currentPrice.toLocaleString()}
                      <span className="text-[10px] font-normal text-slate-400 ml-0.5">
                        {stock.currency === "KRW" ? "원" : "$"}
                      </span>
                    </div>
                    <div className={`flex items-center justify-end text-xs font-semibold font-mono mt-0.5 ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                      {isPos ? "+" : ""}{stock.changePercent}%
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(stock);
                    }}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800/80 transition-all cursor-pointer"
                    id={`btn-remove-watchlist-${item.symbol}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Suggested Quick Add Section */}
      <div className="mt-5 pt-4 border-t border-slate-800/50">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">인기 급상승 종목</h4>
        <div className="grid grid-cols-2 gap-2">
          {STOCKS.slice(0, 4).map(stock => {
            const isWatchlisted = items.some(item => item.symbol === stock.symbol);
            if (isWatchlisted) return null;
            return (
              <button
                key={stock.symbol}
                onClick={() => toggleWatchlist(stock)}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/30 hover:bg-slate-800/30 border border-slate-850 text-left transition-all text-xs text-slate-300 font-medium cursor-pointer"
                id={`btn-quick-add-${stock.symbol}`}
              >
                <span className="truncate">{stock.name}</span>
                <Plus className="h-3.5 w-3.5 text-emerald-500 shrink-0 ml-1.5" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
