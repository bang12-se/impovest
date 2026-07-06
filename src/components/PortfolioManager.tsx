import React, { useState, useEffect, useMemo } from "react";
import { User } from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Stock, PortfolioItem } from "../types";
import { STOCKS } from "../utils/stockData";
import { 
  Briefcase, Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Award, AlertTriangle, 
  HelpCircle, Sparkles, RefreshCw, Layers 
} from "lucide-react";

interface PortfolioManagerProps {
  currentUser: User | null;
  activeStock: Stock;
  marketStocks?: Stock[];
}

export default function PortfolioManager({ currentUser, activeStock, marketStocks = STOCKS }: PortfolioManagerProps) {
  const [holdings, setHoldings] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Buy form states
  const [selectedSymbol, setSelectedSymbol] = useState(activeStock.symbol);
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Update form selected stock when active stock changes in parent
  useEffect(() => {
    setSelectedSymbol(activeStock.symbol);
    setBuyPrice(activeStock.currentPrice.toString());
  }, [activeStock]);

  // Sync Portfolio data
  useEffect(() => {
    if (!currentUser) {
      // LocalStorage for Guest
      const stored = localStorage.getItem("sp_portfolio");
      if (stored) {
        setHoldings(JSON.parse(stored));
      } else {
        // Seed initial items for rich guest dashboard
        const defaults: PortfolioItem[] = [
          { symbol: "005930", name: "삼성전자", market: "KR", quantity: 50, avgPrice: 72000, currentPrice: 75200 },
          { symbol: "NVDA", name: "NVIDIA Corp.", market: "US", quantity: 15, avgPrice: 110, currentPrice: 124.50 }
        ];
        localStorage.setItem("sp_portfolio", JSON.stringify(defaults));
        setHoldings(defaults);
      }
      return;
    }

    setLoading(true);
    // Realtime Sync from Firestore
    const q = query(
      collection(db, "portfolios"),
      where("uid", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: PortfolioItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          symbol: data.symbol,
          name: data.name,
          market: data.market,
          quantity: data.quantity,
          avgPrice: data.avgPrice,
          currentPrice: getFullStockInfo(data.symbol)?.currentPrice || data.avgPrice
        });
      });
      setHoldings(list);
      setLoading(false);
    }, (err) => {
      console.error("Portfolio snapshot error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const getFullStockInfo = (symbol: string): Stock | undefined => {
    return marketStocks.find(s => s.symbol === symbol);
  };

  // Synchronize current prices for local holdings periodically or on load
  const updatedHoldings = useMemo(() => {
    return holdings.map(h => {
      const stock = getFullStockInfo(h.symbol);
      return {
        ...h,
        currentPrice: stock ? stock.currentPrice : h.currentPrice
      };
    });
  }, [holdings]);

  // Calculate Metrics
  const metrics = useMemo(() => {
    let totalInvestedKRW = 0;
    let totalCurrentKRW = 0;
    let totalInvestedUSD = 0;
    let totalCurrentUSD = 0;

    updatedHoldings.forEach(h => {
      const investment = h.avgPrice * h.quantity;
      const currentVal = h.currentPrice * h.quantity;

      if (h.market === "KR") {
        totalInvestedKRW += investment;
        totalCurrentKRW += currentVal;
      } else {
        totalInvestedUSD += investment;
        totalCurrentUSD += currentVal;
      }
    });

    // We can show aggregated equivalent in KRW using standard 1,350 conversion for visual consistency
    const conversionRate = 1350;
    const grandInvested = totalInvestedKRW + (totalInvestedUSD * conversionRate);
    const grandCurrent = totalCurrentKRW + (totalCurrentUSD * conversionRate);
    const grandReturnVal = grandCurrent - grandInvested;
    const grandReturnPct = grandInvested === 0 ? 0 : (grandReturnVal / grandInvested) * 100;

    return {
      grandInvested,
      grandCurrent,
      grandReturnVal,
      grandReturnPct,
      krwInvested: totalInvestedKRW,
      krwCurrent: totalCurrentKRW,
      usdInvested: totalInvestedUSD,
      usdCurrent: totalCurrentUSD
    };
  }, [updatedHoldings]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const qNum = parseFloat(quantity);
    const pNum = parseFloat(buyPrice);

    if (isNaN(qNum) || qNum <= 0) {
      setError("수량은 0보다 큰 값이어야 합니다.");
      return;
    }
    if (isNaN(pNum) || pNum <= 0) {
      setError("평균 매수단가는 0보다 큰 값이어야 합니다.");
      return;
    }

    const stock = getFullStockInfo(selectedSymbol);
    if (!stock) {
      setError("올바른 종목을 선택해 주세요.");
      return;
    }

    const newItem: PortfolioItem = {
      symbol: stock.symbol,
      name: stock.name,
      market: stock.market,
      quantity: qNum,
      avgPrice: pNum,
      currentPrice: stock.currentPrice
    };

    if (!currentUser) {
      // Guest local addition (if stock exists, we can average them or add as new)
      const existingIndex = holdings.findIndex(h => h.symbol === stock.symbol);
      let updated: PortfolioItem[] = [];

      if (existingIndex > -1) {
        const existing = holdings[existingIndex];
        const newQty = existing.quantity + qNum;
        const newAvg = ((existing.avgPrice * existing.quantity) + (pNum * qNum)) / newQty;
        
        updated = [...holdings];
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          avgPrice: Math.round(newAvg * 100) / 100
        };
      } else {
        updated = [...holdings, newItem];
      }

      localStorage.setItem("sp_portfolio", JSON.stringify(updated));
      setHoldings(updated);
      setSuccess("성공적으로 포트폴리오에 추가되었습니다 (비회원)");
      setQuantity("");
    } else {
      // Firestore addition
      try {
        const existingRef = collection(db, "portfolios");
        const existingQuery = query(existingRef, where("uid", "==", currentUser.uid), where("symbol", "==", stock.symbol));
        const querySnapshot = await getDocs(existingQuery);

        if (!querySnapshot.empty) {
          // Update existing
          const docId = querySnapshot.docs[0].id;
          const docData = querySnapshot.docs[0].data();
          const newQty = docData.quantity + qNum;
          const newAvg = ((docData.avgPrice * docData.quantity) + (pNum * qNum)) / newQty;

          await setDoc(doc(db, "portfolios", docId), {
            uid: currentUser.uid,
            symbol: stock.symbol,
            name: stock.name,
            market: stock.market,
            quantity: newQty,
            avgPrice: Math.round(newAvg * 100) / 100
          });
        } else {
          // Add new doc
          await addDoc(collection(db, "portfolios"), {
            uid: currentUser.uid,
            symbol: stock.symbol,
            name: stock.name,
            market: stock.market,
            quantity: qNum,
            avgPrice: pNum,
            addedAt: new Date().toISOString()
          });
        }

        setSuccess("성공적으로 포트폴리오에 추가되었습니다!");
        setQuantity("");
      } catch (err) {
        console.error("DB portfolio add error:", err);
        setError("데이터베이스 저장 과정에서 오류가 발생했습니다.");
      }
    }

    setTimeout(() => {
      setSuccess("");
    }, 2000);
  };

  const handleSellHolding = async (holding: PortfolioItem) => {
    if (!currentUser) {
      const updated = holdings.filter(h => h.symbol !== holding.symbol);
      localStorage.setItem("sp_portfolio", JSON.stringify(updated));
      setHoldings(updated);
      return;
    }

    if (!holding.id) return;

    try {
      await deleteDoc(doc(db, "portfolios", holding.id));
    } catch (err) {
      console.error("DB remove holding error:", err);
    }
  };

  // Generate customized AI Insights based on holding diversity
  const portfolioDiagnostics = useMemo(() => {
    if (updatedHoldings.length === 0) {
      return {
        rating: "대기 중",
        status: "neutral",
        feedback: "보유 종목을 등록하시면 AI가 투자 포트폴리오의 분산 지수와 안정성을 즉시 분석하여 진단해 드립니다."
      };
    }

    const conversionRate = 1350;
    const totals = updatedHoldings.map(h => {
      const val = h.currentPrice * h.quantity;
      return h.market === "KR" ? val : val * conversionRate;
    });

    const totalVal = totals.reduce((a, b) => a + b, 0);
    const maxWeight = Math.max(...totals) / totalVal;

    if (updatedHoldings.length === 1) {
      return {
        rating: "집중 투자형 (경고)",
        status: "warn",
        feedback: "현재 1개 종목에 100% 자산이 편중되어 있습니다. 시장 리스크 발생 시 변동성에 취약하므로 다른 섹터나 국가(미국/한국)의 우량주로 자산 배분 다변화를 강력하게 검토해 보십시오."
      };
    } else if (maxWeight > 0.7) {
      const topHolding = updatedHoldings[totals.indexOf(Math.max(...totals))];
      return {
        rating: "자산 편중 주의",
        status: "warn",
        feedback: `가장 비중이 높은 '${topHolding.name}'이(가) 전체 자산의 ${(maxWeight * 100).toFixed(1)}%를 차지하고 있습니다. 특정 종목 리스크를 상쇄할 수 있도록 성장과 가치 배분을 재조정할 필요가 있습니다.`
      };
    } else if (updatedHoldings.length >= 4) {
      return {
        rating: "조화로운 분산형 (최우수)",
        status: "success",
        feedback: "자산이 여러 우량 종목에 균형 있게 분산되어 있어 성장의 수익성과 시장 리스크 방어가 동시에 작용하는 안정적인 형태입니다. 각 기업의 주요 AI 분석 점수를 참고하여 성장을 홀딩하십시오."
      };
    } else {
      return {
        rating: "안정적 성장형 (양호)",
        status: "success",
        feedback: "한국과 미국의 주요 핵심 성장 테마에 밸런스 있게 투자 중입니다. 현금 비중을 일정 유지하며 조정 시마다 주기적인 분할 매수를 가져가시는 전략이 장기적으로 유효합니다."
      };
    }
  }, [updatedHoldings]);

  return (
    <div className="space-y-6">
      {/* 1. Aggregated Metrics Card */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 relative overflow-hidden" id="portfolio-metrics-card">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          <Briefcase className="h-4 w-4 text-emerald-500" />
          <span>통합 투자 요약 (환산 기준)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="text-xs text-slate-400">총 평가 자산</span>
            <div className="text-2xl font-black text-slate-100 tracking-tight font-mono mt-1" id="portfolio-total-value">
              {metrics.grandCurrent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              <span className="text-xs font-normal text-slate-400 ml-1">원</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-400">총 매수 금액</span>
            <div className="text-2xl font-black text-slate-200 tracking-tight font-mono mt-1">
              {metrics.grandInvested.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              <span className="text-xs font-normal text-slate-500 ml-1">원</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-400">평가 손익 (수익률)</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-2xl font-black tracking-tight font-mono ${metrics.grandReturnVal >= 0 ? "text-emerald-400" : "text-rose-400"}`} id="portfolio-total-return">
                {metrics.grandReturnVal >= 0 ? "+" : ""}{metrics.grandReturnVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}원
              </span>
              <span className={`text-sm font-bold ${metrics.grandReturnVal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                ({metrics.grandReturnVal >= 0 ? "+" : ""}{metrics.grandReturnPct.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Currency breakdowns */}
        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-500 font-mono">
          <div>국내: <span className="text-slate-300">{metrics.krwCurrent.toLocaleString()}원</span></div>
          <div>미국: <span className="text-slate-300">${metrics.usdCurrent.toLocaleString()}</span></div>
          <div className="text-[10px] text-slate-600 self-center">(참고 환율: 1 USD = 1,350 KRW)</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Transaction Form */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5 text-emerald-500" />
            보유 종목 기록 추가
          </h3>

          {error && (
            <div className="mb-4 rounded-lg bg-rose-500/10 p-3 text-xs text-rose-400 border border-rose-500/20">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-400 border border-emerald-500/20">
              {success}
            </div>
          )}

          <form onSubmit={handleAddTransaction} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">종목 선택</label>
              <select
                value={selectedSymbol}
                onChange={(e) => {
                  setSelectedSymbol(e.target.value);
                  const stock = getFullStockInfo(e.target.value);
                  if (stock) {
                    setBuyPrice(stock.currentPrice.toString());
                  }
                }}
                className="w-full rounded-xl border border-slate-850 bg-slate-950 p-3 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
                id="select-portfolio-stock"
              >
                {STOCKS.map(s => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.name} ({s.symbol}) - {s.market === "KR" ? "원" : "USD"}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">매수 수량</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="예: 10"
                  className="w-full rounded-xl border border-slate-850 bg-slate-950 p-3 text-sm text-slate-100 placeholder:text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  id="input-portfolio-qty"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">매수 평균단가</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  placeholder="단가"
                  className="w-full rounded-xl border border-slate-850 bg-slate-950 p-3 text-sm text-slate-100 placeholder:text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  id="input-portfolio-price"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3.5 text-sm font-semibold text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition-all cursor-pointer shadow-lg shadow-emerald-500/5 mt-4"
              id="btn-add-portfolio-submit"
            >
              포트폴리오 기록 추가
            </button>
          </form>
        </div>

        {/* Right: Portfolio Holdings Table */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI Diagnostic Report Panel */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 relative overflow-hidden flex flex-col sm:flex-row items-start gap-4">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI 포트폴리오 자산 진단</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  portfolioDiagnostics.status === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                }`}>
                  {portfolioDiagnostics.rating}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mt-1.5">
                {portfolioDiagnostics.feedback}
              </p>
            </div>
          </div>

          {/* Holdings Grid */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                보유 자산 내역
              </h3>
            </div>

            {updatedHoldings.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                <Briefcase className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">등록된 보유 주식이 없습니다.</p>
                <p className="text-xs text-slate-500 mt-1">기록 생성 양식을 이용해 보유 주가와 평단가를 기록해 보세요.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1">
                {updatedHoldings.map((h, index) => {
                  const currentTotal = h.currentPrice * h.quantity;
                  const investTotal = h.avgPrice * h.quantity;
                  const diff = currentTotal - investTotal;
                  const returnPct = investTotal === 0 ? 0 : (diff / investTotal) * 100;
                  const isPos = diff >= 0;

                  return (
                    <div 
                      key={h.symbol + index}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/30 hover:bg-slate-950/50 transition-all gap-4"
                      id={`portfolio-holding-row-${h.symbol}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200 text-sm tracking-tight">{h.name}</span>
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded font-mono">
                            {h.symbol}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 mt-2 text-xs font-mono text-slate-500">
                          <div>보유량: <span className="text-slate-300 font-bold">{h.quantity}주</span></div>
                          <div>매수평단: <span className="text-slate-300 font-bold">{h.avgPrice.toLocaleString()}</span></div>
                          <div>현재가: <span className="text-slate-300 font-bold">{h.currentPrice.toLocaleString()}</span></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-800/60 pt-3 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <div className="font-extrabold text-sm text-slate-100 font-mono">
                            {currentTotal.toLocaleString(undefined, { maximumFractionDigits: h.market === "KR" ? 0 : 2 })}
                            <span className="text-[10px] font-normal text-slate-500 ml-0.5">
                              {h.market === "KR" ? "원" : "$"}
                            </span>
                          </div>
                          <div className={`flex items-center sm:justify-end text-xs font-semibold font-mono mt-0.5 ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                            {isPos ? "+" : ""}{returnPct.toFixed(2)}%
                          </div>
                        </div>

                        <button
                          onClick={() => handleSellHolding(h)}
                          className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                          id={`btn-remove-portfolio-${h.symbol}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
