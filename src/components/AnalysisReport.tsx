import { useState, useEffect } from "react";
import { Stock, AnalysisResult } from "../types";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { User } from "firebase/auth";
import { getApiUrl } from "../utils/api";
import { 
  TrendingUp, TrendingDown, Star, AlertTriangle, CheckCircle, Sparkles, 
  HelpCircle, RefreshCw, FileText, ChevronRight, Bookmark 
} from "lucide-react";

interface AnalysisReportProps {
  stock: Stock;
  currentUser: User | null;
  onAnalysisSaved?: () => void;
}

// Simple Custom Markdown Renderer for perfect React 19 compatibility
function SimpleMarkdown({ text }: { text: string }) {
  if (!text) return null;
  
  const lines = text.split("\n");
  
  return (
    <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        
        // Headers (e.g. ### 1. 재무 안정성)
        if (trimmed.startsWith("###")) {
          const headerText = trimmed.replace(/^###\s*/, "");
          return (
            <h4 key={idx} className="text-base font-extrabold text-slate-100 mt-6 mb-2 tracking-tight flex items-center gap-2 border-b border-slate-800/60 pb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {parseBold(headerText)}
            </h4>
          );
        }
        
        // Bold headers (e.g. ## 1. ...)
        if (trimmed.startsWith("##")) {
          const headerText = trimmed.replace(/^##\s*/, "");
          return (
            <h3 key={idx} className="text-lg font-bold text-emerald-400 mt-8 mb-3">
              {parseBold(headerText)}
            </h3>
          );
        }

        // Bullet Points
        if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
          const bulletText = trimmed.replace(/^[-*]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-2 my-1">
              <span className="text-emerald-500 shrink-0 select-none font-bold mt-0.5">&bull;</span>
              <span>{parseBold(bulletText)}</span>
            </div>
          );
        }

        if (trimmed === "") {
          return <div key={idx} className="h-2" />;
        }

        // Normal paragraph
        return (
          <p key={idx} className="text-slate-300 leading-relaxed font-normal">
            {parseBold(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Inline Bold parser
function parseBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="font-bold text-slate-100">{part}</strong>;
    }
    return part;
  });
}

export default function AnalysisReport({ stock, currentUser, onAnalysisSaved }: AnalysisReportProps) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const performAIAnalysis = async () => {
    setLoading(true);
    setError("");
    setSaveSuccess(false);

    try {
      const response = await fetch(getApiUrl("/api/analyze"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: stock.symbol,
          name: stock.name,
          market: stock.market,
          currentPrice: stock.currentPrice,
          sector: stock.sector,
          description: stock.description
        })
      });

      if (!response.ok) {
        throw new Error("분석 요청 중 오류가 발생했습니다.");
      }

      const data: AnalysisResult = await response.json();
      setResult(data);

      // Automatically save report to user history in Firestore if logged in, or LocalStorage if guest
      if (currentUser) {
        try {
          await addDoc(collection(db, "analyses"), {
            uid: currentUser.uid,
            symbol: stock.symbol,
            name: stock.name,
            market: stock.market,
            score: data.score,
            rating: data.rating,
            overallOpinion: data.overallOpinion,
            analyzedAt: new Date().toISOString()
          });
          if (onAnalysisSaved) onAnalysisSaved();
        } catch (dbErr) {
          console.error("Error saving search report to Firestore:", dbErr);
        }
      } else {
        try {
          const stored = localStorage.getItem("sp_analysis_history");
          const history = stored ? JSON.parse(stored) : [];
          // Filter out existing item for this stock to move it to top
          const filtered = history.filter((h: any) => h.symbol !== stock.symbol);
          const newItem = {
            symbol: stock.symbol,
            name: stock.name,
            market: stock.market,
            score: data.score,
            rating: data.rating,
            overallOpinion: data.overallOpinion,
            analyzedAt: new Date().toISOString()
          };
          const updated = [newItem, ...filtered].slice(0, 6);
          localStorage.setItem("sp_analysis_history", JSON.stringify(updated));
          if (onAnalysisSaved) onAnalysisSaved();
        } catch (localErr) {
          console.error("Error saving search report to LocalStorage:", localErr);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("AI 분석 데이터를 수집하는 과정에서 에러가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  // Perform analysis when stock changes
  useEffect(() => {
    performAIAnalysis();
  }, [stock]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[400px]" id="analysis-report-loading">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-emerald-400 animate-pulse" />
        </div>
        <div className="space-y-1.5 mt-3">
          <h4 className="text-slate-200 font-bold text-base">Gemini AI가 종목을 분석하고 있습니다</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            최신 거래량 추이, 외국인 수급 모멘텀, 업계 재무 지표 및 상승/하락 리스크 요인을 실시간 합성하는 중입니다.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-900/30 bg-rose-500/5 p-8 text-center" id="analysis-report-error">
        <AlertTriangle className="h-10 w-10 text-rose-400 mx-auto mb-3" />
        <p className="text-sm font-semibold text-rose-300">{error}</p>
        <button
          onClick={performAIAnalysis}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          재시도
        </button>
      </div>
    );
  }

  if (!result) return null;

  // Custom rating colors & text
  let opinionText = "의견 보류";
  let opinionColor = "text-slate-400 bg-slate-800/60 border border-slate-700/50";
  let scoreColor = "text-amber-400";
  let scoreBg = "border-amber-500/30";

  if (result.overallOpinion === "positive") {
    opinionText = "적극 긍정 (Bull)";
    opinionColor = "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
    scoreColor = "text-emerald-400";
    scoreBg = "border-emerald-500";
  } else if (result.overallOpinion === "negative") {
    opinionText = "주의 요망 (Bear)";
    opinionColor = "text-rose-400 bg-rose-500/10 border border-rose-500/20";
    scoreColor = "text-rose-400";
    scoreBg = "border-rose-500";
  } else {
    opinionText = "중립 관망 (Neutral)";
    opinionColor = "text-amber-400 bg-amber-500/10 border border-amber-500/20";
  }

  return (
    <div className="space-y-6" id="analysis-report">
      {/* 1. Score & Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Ring */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-1 right-2 text-[9px] font-mono text-slate-600">StockPilot AI Score</div>
          
          <div className="relative flex items-center justify-center h-28 w-28">
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="48"
                className="stroke-slate-800 fill-none"
                strokeWidth="8"
              />
              <circle
                cx="56"
                cy="56"
                r="48"
                className={`fill-none stroke-current ${scoreColor} transition-all duration-1000 ease-out`}
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - result.score / 100)}
              />
            </svg>
            <span className="text-3xl font-black text-slate-100 font-mono tracking-tight" id="analysis-ai-score">
              {result.score}
              <span className="text-xs text-slate-500 font-normal">점</span>
            </span>
          </div>

          <div className="mt-4">
            <div className="flex justify-center mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4.5 w-4.5 ${
                    i < result.rating ? "text-amber-400 fill-amber-400" : "text-slate-700"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-500">인공지능 투자 매력도</span>
          </div>
        </div>

        {/* Opinion Summary Card */}
        <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI 종합 진단 의견</span>
              <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full ${opinionColor}`} id="analysis-opinion-badge">
                {opinionText}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="text-sm font-semibold text-slate-300">상승 및 긍정 요인 (Upside Catalyst)</div>
              <div className="space-y-1.5 pl-1">
                {result.upsideFactors.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>분석 완료 시점: {new Date(result.analyzedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
            <div className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Sparkles className="h-3 w-3" />
              <span>실시간 동적 진단 활성화</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Downside / Warnings Panel */}
      {result.downsideFactors && result.downsideFactors.length > 0 && (
        <div className="rounded-2xl border border-rose-950/20 bg-rose-500/5 p-5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-rose-300 uppercase tracking-wider">주의 및 투자 위험 요인 (Risk Factors)</h4>
            <div className="mt-2 space-y-1.5">
              {result.downsideFactors.map((f, i) => (
                <div key={i} className="text-xs text-rose-300/80 flex items-start gap-1.5">
                  <span className="text-rose-400 font-black shrink-0 font-mono">✖</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Deep Insight Report */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-6">
          <FileText className="h-5 w-5 text-emerald-500" />
          AI 심층 기술 리포트
        </h3>

        <SimpleMarkdown text={result.deepInsight} />
      </div>
    </div>
  );
}
