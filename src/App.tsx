import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { STOCKS, getSimulatedStocks } from "./utils/stockData";
import { Stock } from "./types";
import Header from "./components/Header";
import LoginModal from "./components/LoginModal";
import StockSearch from "./components/StockSearch";
import StockChart from "./components/StockChart";
import Watchlist from "./components/Watchlist";
import PortfolioManager from "./components/PortfolioManager";
import NewsSection from "./components/NewsSection";
import AnalysisReport from "./components/AnalysisReport";

import { 
  TrendingUp, TrendingDown, Star, Globe, ShieldAlert, Sparkles, 
  HelpCircle, BarChart3, Clock, ArrowUpRight, ArrowDownRight, Award,
  LayoutDashboard, Newspaper, Briefcase
} from "lucide-react";
import AnalysisHistory from "./components/AnalysisHistory";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeStock, setActiveStock] = useState<Stock>(STOCKS[0]);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [marketStocks, setMarketStocks] = useState<Stock[]>(STOCKS);
  const [analysisRefreshTrigger, setAnalysisRefreshTrigger] = useState(0);

  const tabs = [
    { id: "dashboard", label: "대시보드", icon: LayoutDashboard },
    { id: "analysis", label: "AI 종목분석", icon: Sparkles },
    { id: "news", label: "뉴스 브리핑", icon: Newspaper },
    { id: "portfolio", label: "내 포트폴리오", icon: Briefcase }
  ];

  // Market Indices states
  const [kospi, setKospi] = useState({ price: 2684.50, change: 18.25, pct: 0.68 });
  const [nasdaq, setNasdaq] = useState({ price: 17924.10, change: 142.30, pct: 0.80 });

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Simulate periodic stock price ticks (every 6 seconds) to make the page alive!
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketStocks(prev => {
        const updated = getSimulatedStocks(prev);
        // Keep activeStock reference fresh
        const currentActive = updated.find(s => s.symbol === activeStock.symbol);
        if (currentActive) {
          setActiveStock(currentActive);
        }
        return updated;
      });

      // Fluctuate indices slightly
      setKospi(prev => {
        const diff = (Math.random() * 2 - 0.8);
        const nextPrice = Math.round((prev.price + diff) * 100) / 100;
        const totalChange = Math.round((nextPrice - 2666.25) * 100) / 100;
        const totalPct = Math.round((totalChange / 2666.25) * 10000) / 100;
        return { price: nextPrice, change: totalChange, pct: totalPct };
      });

      setNasdaq(prev => {
        const diff = (Math.random() * 8 - 3);
        const nextPrice = Math.round((prev.price + diff) * 100) / 100;
        const totalChange = Math.round((nextPrice - 17781.80) * 100) / 100;
        const totalPct = Math.round((totalChange / 17781.80) * 10000) / 100;
        return { price: nextPrice, change: totalChange, pct: totalPct };
      });

    }, 6000);

    return () => clearInterval(interval);
  }, [activeStock]);

  const handleSelectStock = (stock: Stock) => {
    // Find latest price from simulated list
    const fresh = marketStocks.find(s => s.symbol === stock.symbol) || stock;
    setActiveStock(fresh);
    // Smooth scroll to top of page when changing stock
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isPos = activeStock.change >= 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-300 font-sans">
      
      {/* 1. Header Navbar */}
      <Header 
        currentUser={currentUser} 
        onOpenLogin={() => setIsLoginModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-24 md:pb-8">
        
        {/* Tab content router */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Top Interactive Row: Indices & Quick Search */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Left & Mid: Auto-complete Stock Search & Quick Tags */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <StockSearch onSelectStock={handleSelectStock} activeStock={activeStock} marketStocks={marketStocks} />
                  
                  {/* Market tags */}
                  <div className="flex gap-2">
                    <span className="text-[10px] font-bold bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                      KOSPI / KOSDAQ
                    </span>
                    <span className="text-[10px] font-bold bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                      NASDAQ / S&P
                    </span>
                  </div>
                </div>

                {/* Popular Stock Badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-500 font-bold mr-1 select-none">인기 종목:</span>
                  {marketStocks.slice(0, 6).map(s => {
                    const isSelected = activeStock.symbol === s.symbol;
                    const stockPos = s.change >= 0;
                    return (
                      <button
                        key={s.symbol}
                        onClick={() => handleSelectStock(s)}
                        className={`px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/5"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                        id={`quick-tag-${s.symbol}`}
                      >
                        {s.name}
                        <span className={`ml-1.5 font-mono text-[10px] font-bold ${stockPos ? "text-emerald-400" : "text-rose-400"}`}>
                          {stockPos ? "▲" : "▼"}{Math.abs(s.changePercent)}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Sidebar: Market Indices Widgets */}
              <div className="grid grid-cols-2 gap-4">
                {/* KOSPI */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4 font-mono select-none">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-sans font-bold uppercase tracking-wider">
                    <span>KOSPI 지수</span>
                    <span className="text-emerald-500 flex items-center">● LIVE</span>
                  </div>
                  <div className="text-lg font-black tracking-tight text-slate-200 mt-1">
                    {kospi.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className={`flex items-center text-xs font-bold mt-0.5 ${kospi.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {kospi.change >= 0 ? <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> : <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />}
                    {kospi.change >= 0 ? "+" : ""}{kospi.change.toLocaleString()} ({kospi.pct}%)
                  </div>
                </div>

                {/* NASDAQ */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4 font-mono select-none">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-sans font-bold uppercase tracking-wider">
                    <span>NASDAQ 지수</span>
                    <span className="text-emerald-500 flex items-center">● LIVE</span>
                  </div>
                  <div className="text-lg font-black tracking-tight text-slate-200 mt-1">
                    {nasdaq.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className={`flex items-center text-xs font-bold mt-0.5 ${nasdaq.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {nasdaq.change >= 0 ? <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> : <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />}
                    {nasdaq.change >= 0 ? "+" : ""}{nasdaq.change.toLocaleString()} ({nasdaq.pct}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column (Main Stock Info) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Stock Identification Card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md relative overflow-hidden" id="dashboard-stock-details">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded uppercase tracking-wider font-mono">
                          {activeStock.market} MARKET
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">{activeStock.sector}</span>
                      </div>
                      
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mt-2 tracking-tight flex items-center gap-2.5">
                        {activeStock.name}
                        <span className="text-sm font-semibold text-slate-500 bg-slate-950 px-2 py-1 rounded font-mono border border-slate-850">
                          {activeStock.symbol}
                        </span>
                      </h2>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-3xl font-black text-slate-100 font-mono tracking-tight">
                        {activeStock.currentPrice.toLocaleString()}
                        <span className="text-sm font-semibold text-slate-400 ml-1">
                          {activeStock.currency === "KRW" ? "원" : " USD"}
                        </span>
                      </div>
                      <div className={`flex items-center sm:justify-end text-sm font-bold mt-1.5 ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                        {isPos ? "+" : ""}{activeStock.change.toLocaleString()} ({activeStock.changePercent}%)
                      </div>
                    </div>
                  </div>

                  {/* Stock Meta Description */}
                  <p className="text-slate-400 text-xs leading-relaxed mt-4 pt-4 border-t border-slate-800/60 font-medium">
                    {activeStock.description}
                  </p>

                  {/* Meta stats */}
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-800/40 text-xs font-mono text-slate-500">
                    <div>고가: <span className="text-slate-300 font-bold">{activeStock.high.toLocaleString()}</span></div>
                    <div>저가: <span className="text-slate-300 font-bold">{activeStock.low.toLocaleString()}</span></div>
                    <div className="truncate">거래량: <span className="text-slate-300 font-bold">{activeStock.volume.toLocaleString()}주</span></div>
                  </div>
                </div>

                {/* SVG Live Interactive Chart */}
                <StockChart stock={activeStock} />

                {/* Prompt Card: View full AI report */}
                <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                      <Sparkles className="h-4.5 w-4.5 text-emerald-400" />
                      Gemini 인공지능 종목분석 가동
                    </h3>
                    <p className="text-xs text-slate-400 max-w-lg">
                      '{activeStock.name}'의 상승 모멘텀, 기술적 차트 과열 여부 및 외신 호재 분석을 합성한 맞춤 리포트를 제공합니다.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("analysis")}
                    className="shrink-0 flex items-center gap-1.5 px-4.5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                    id="btn-goto-ai-analysis"
                  >
                    AI 심층분석 보고서 읽기
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>

              </div>

              {/* Right Sidebar (Watchlist & Quick Utilities) */}
              <div className="space-y-6">
                
                {/* Watchlist Manager Panel */}
                <Watchlist 
                  currentUser={currentUser} 
                  onSelectStock={handleSelectStock} 
                  activeStockSymbol={activeStock.symbol} 
                  marketStocks={marketStocks}
                />

                {/* Platform Values Info Panel */}
                <div className="rounded-2xl border border-slate-850 bg-slate-950/40 p-5 text-slate-500 space-y-3 select-none">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-emerald-500" />
                    실시간 데이터 연결 정보
                  </h4>
                  <p className="text-[11px] leading-relaxed">
                    본 시스템은 한국 KOSPI/KOSDAQ 및 미국 NASDAQ 핵심 우량주에 대해 6초 간격의 동적 모의 시세 피드를 수신하고 있습니다.
                  </p>
                  <p className="text-[11px] leading-relaxed border-t border-slate-900 pt-2.5">
                    회원으로 가입하시면 포트폴리오 자산 배분 현황과 맞춤 관심 종목 리스트가 실시간 Firestore 클라우드와 안전하게 동기화됩니다.
                  </p>
                </div>

              </div>
            </div>

          </div>
        )}

        {activeTab === "analysis" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-300">
            {/* Left sidebar to switch stock within analysis */}
            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-2xl border border-slate-850 bg-slate-900/20 p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">분석 대상 종목 선택</h3>
                <div className="space-y-1">
                  {marketStocks.map(s => {
                    const isSelected = activeStock.symbol === s.symbol;
                    return (
                      <button
                        key={s.symbol}
                        onClick={() => handleSelectStock(s)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-slate-850 text-emerald-400 border border-emerald-500/20" 
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                        }`}
                        id={`analysis-sidebar-stock-${s.symbol}`}
                      >
                        <span>{s.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{s.symbol}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Analysis History */}
              <AnalysisHistory
                currentUser={currentUser}
                onSelectStock={handleSelectStock}
                activeStockSymbol={activeStock.symbol}
                refreshTrigger={analysisRefreshTrigger}
                marketStocks={marketStocks}
              />

              {/* Watchlist Quick Access */}
              <Watchlist 
                currentUser={currentUser} 
                onSelectStock={handleSelectStock} 
                activeStockSymbol={activeStock.symbol} 
                marketStocks={marketStocks}
              />
            </div>

            {/* Main AI Analysis Report */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-emerald-400 fill-emerald-400/10" />
                    AI 주식 종목 심층 분석
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    현재 선택된 종목 <span className="text-emerald-400 font-bold">{activeStock.name} ({activeStock.symbol})</span> 에 대해 생성형 AI의 입체적인 실시간 기업 진단을 보고서 형태로 조회합니다.
                  </p>
                </div>
              </div>

              <AnalysisReport 
                stock={activeStock} 
                currentUser={currentUser} 
                onAnalysisSaved={() => setAnalysisRefreshTrigger(prev => prev + 1)}
              />
            </div>
          </div>
        )}

        {activeTab === "news" && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="rounded-2xl border border-slate-850 bg-slate-900/20 p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span>뉴스 브리핑 필터 종목:</span>
                <span className="font-extrabold text-emerald-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-850">
                  {activeStock.name} ({activeStock.symbol})
                </span>
              </div>
              
              {/* Quick switch */}
              <select
                value={activeStock.symbol}
                onChange={(e) => {
                  const target = STOCKS.find(s => s.symbol === e.target.value);
                  if (target) handleSelectStock(target);
                }}
                className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-semibold"
                id="select-news-stock-filter"
              >
                {STOCKS.map(s => (
                  <option key={s.symbol} value={s.symbol}>{s.name}</option>
                ))}
              </select>
            </div>

            <NewsSection stock={activeStock} />
          </div>
        )}

        {activeTab === "portfolio" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-emerald-400" />
                  나의 투자 포트폴리오
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  보유 주식의 평균 단가와 수량을 등록하여 전체 자산 가치 평가, 원화/달러 수익률 계산 및 AI 진단 조언을 실시간 확인하세요.
                </p>
              </div>
            </div>

            <PortfolioManager currentUser={currentUser} activeStock={activeStock} marketStocks={marketStocks} />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-900 bg-slate-950 py-10 text-center select-none">
        <div className="mx-auto max-w-7xl px-4 text-xs text-slate-600 space-y-2 font-medium">
          <p>© 2026 StockPilot AI. All rights reserved.</p>
          <p>이 서비스는 모의 시뮬레이션 데이터와 인공지능 요약에 기반하여 구성되었습니다. 본 분석 보고서는 투자 의사 결정의 참고 용도일 뿐 최종 투자 손실 책임은 전적으로 본인에게 귀속됩니다.</p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-900 backdrop-blur-md pb-safe">
        <div className="grid grid-cols-4 h-16">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  isActive ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                }`}
                id={`mobile-tab-${tab.id}`}
              >
                <IconComponent className="h-5 w-5" />
                <span className="text-[10px] font-bold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Authentication Modal Popup */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        currentUser={currentUser}
      />

    </div>
  );
}
