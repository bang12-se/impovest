export interface Stock {
  symbol: string;
  name: string;
  market: "US" | "KR";
  currentPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  sector: string;
  description: string;
  currency: "USD" | "KRW";
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: "bullish" | "bearish" | "neutral";
  summary: string;
}

export interface AnalysisResult {
  score: number;
  rating: number; // 1 to 5 stars
  upsideFactors: string[];
  downsideFactors: string[];
  overallOpinion: "positive" | "negative" | "neutral";
  deepInsight: string;
  analyzedAt: string;
}

export interface PortfolioItem {
  id?: string;
  symbol: string;
  name: string;
  market: "US" | "KR";
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

export interface SavedAnalysis {
  id: string;
  symbol: string;
  name: string;
  analysis: AnalysisResult;
  createdAt: string;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  market: "US" | "KR";
  addedAt: string;
}
