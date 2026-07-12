import { Stock } from "../types";

export const STOCKS: Stock[] = [
  // Domestic Stocks (KR)
  {
    symbol: "005930",
    name: "삼성전자",
    market: "KR",
    currentPrice: 75200,
    change: 1400,
    changePercent: 1.89,
    high: 75800,
    low: 74100,
    volume: 14230492,
    sector: "반도체 및 전자장비",
    description: "대한민국 대표 글로벌 IT 기업으로 메모리 반도체, 스마트폰, TV 분야 등에서 세계 시장을 선도하고 있습니다. 최근 HBM(고대역폭메모리) 양산 가속화 및 파운드리 부문 체질 개선을 꾀하고 있습니다.",
    currency: "KRW"
  },
  {
    symbol: "000660",
    name: "SK하이닉스",
    market: "KR",
    currentPrice: 182300,
    change: 5400,
    changePercent: 3.05,
    high: 184500,
    low: 178200,
    volume: 3824090,
    sector: "반도체 및 전자장비",
    description: "D램 및 낸드플래시를 주력으로 하는 글로벌 메모리 반도체 전문 기업입니다. NVIDIA향 HBM3/HBM3E 공급에서 압도적 우위를 바탕으로 AI 열풍의 최대 수혜주로 꼽힙니다.",
    currency: "KRW"
  },
  {
    symbol: "035420",
    name: "NAVER",
    market: "KR",
    currentPrice: 168400,
    change: -2100,
    changePercent: -1.23,
    high: 171500,
    low: 167900,
    volume: 681240,
    sector: "인터넷 서비스",
    description: "국내 1위 검색 포털 네이버를 기반으로 쇼핑, 페이, 클라우드, 콘텐츠(웹툰) 등 다양한 비즈니스 생태계를 보유하고 있습니다. 자체 초거대 AI 모델 '하이퍼클로바X'를 통해 B2B 혁신에 중점을 두고 있습니다.",
    currency: "KRW"
  },
  {
    symbol: "035720",
    name: "카카오",
    market: "KR",
    currentPrice: 42150,
    change: -350,
    changePercent: -0.82,
    high: 42800,
    low: 41950,
    volume: 1254390,
    sector: "인터넷 서비스",
    description: "국민 메신저 '카카오톡'을 중심으로 모빌리티, 페이, 게임, 뱅크, 엔터테인먼트 등 전방위적 모바일 서비스를 제공하는 플랫폼 기업입니다. 비핵심 자산 효율화 및 핵심 플랫폼 경쟁력 강화에 전념하고 있습니다.",
    currency: "KRW"
  },
  {
    symbol: "005380",
    name: "현대자동차",
    market: "KR",
    currentPrice: 242500,
    change: 4500,
    changePercent: 1.89,
    high: 245000,
    low: 239000,
    volume: 485120,
    sector: "자동차 제조업",
    description: "글로벌 완성차 메이커로 제네시스 브랜드의 고급화, 전기차(IONIQ) 라인업 확장, 하이브리드(HEV) 차량의 강력한 이익률을 기반으로 사상 최대 실적 릴레이를 이어가고 있습니다.",
    currency: "KRW"
  },
  {
    symbol: "247540",
    name: "에코프로비엠",
    market: "KR",
    currentPrice: 191200,
    change: -4300,
    changePercent: -2.20,
    high: 198000,
    low: 189500,
    volume: 981400,
    sector: "이차전지 소재",
    description: "글로벌 하이니켈계 양극소재 시장 선도 기업입니다. 초고용량 주행거리를 가능케 하는 양극재 가공 기술력을 바탕으로 삼성SDI, SK온 등 주요 배터리 셀 메이커에 납품 중이며 전기차 캐즘(Chasm) 극복을 타진하고 있습니다.",
    currency: "KRW"
  },
  {
    symbol: "068270",
    name: "셀트리온",
    market: "KR",
    currentPrice: 178900,
    change: 1200,
    changePercent: 0.68,
    high: 180500,
    low: 176500,
    volume: 512400,
    sector: "바이오 및 제약",
    description: "램시마, 트룩시마, 허쥬마 등 바이오시밀러 제품을 개발, 생산하는 대한민국 대표 바이오테크 기업입니다. 통합 셀트리온 출범 이후 합병 시너지 가속화 및 미국 짐펜트라(Zymfentra)의 신약 판매 확대에 집중하고 있습니다.",
    currency: "KRW"
  },

  // US Stocks (US)
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    market: "US",
    currentPrice: 214.32,
    change: 3.45,
    changePercent: 1.64,
    high: 215.80,
    low: 211.20,
    volume: 52391000,
    sector: "소비자 가전 및 IT",
    description: "iPhone, iPad, Mac 등의 하드웨어 생태계와 App Store, Apple Music 등의 고수익 서비스 매출을 보유한 세계 최대 IT 기업입니다. 'Apple Intelligence'를 온디바이스 AI 형태로 도입하며 강력한 기기 교체 수요를 유도하고 있습니다.",
    currency: "USD"
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    market: "US",
    currentPrice: 421.90,
    change: 2.10,
    changePercent: 0.50,
    high: 424.50,
    low: 418.10,
    volume: 18452000,
    sector: "소프트웨어 및 클라우드",
    description: "Windows, Office 솔루션을 넘어 클라우드 플랫폼 Azure와 OpenAI 투자를 통한 코파일럿(Copilot) 통합을 통해 생성형 AI 비즈니스 생태계를 압도적으로 지배하는 글로벌 테크 리더입니다.",
    currency: "USD"
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    market: "US",
    currentPrice: 176.45,
    change: -1.82,
    changePercent: -1.02,
    high: 179.20,
    low: 175.50,
    volume: 24190000,
    sector: "인터넷 서비스 및 광고",
    description: "글로벌 검색엔진 구글, 유튜브, 안드로이드를 소유한 거대 지주회사입니다. 강력한 광고 매출을 캐시카우로 삼아 AI 비서 'Gemini' 및 Google Cloud 인프라 판매를 적극 가속화하고 있습니다.",
    currency: "USD"
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    market: "US",
    currentPrice: 198.80,
    change: 8.25,
    changePercent: 4.33,
    high: 201.50,
    low: 190.10,
    volume: 81450000,
    sector: "전기자동차 및 에너지",
    description: "전기자동차(EV), 에너지 저장 시스템(ESS), 자율주행(FSD) 및 로봇공학(Optimus)을 개발하는 기술 혁신 기업입니다. AI 슈퍼컴퓨터 Dojo 투자 및 자율주행 로보택시(Robotaxi) 상용화를 모멘텀으로 삼고 있습니다.",
    currency: "USD"
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    market: "US",
    currentPrice: 124.50,
    change: 5.60,
    changePercent: 4.71,
    high: 126.10,
    low: 118.90,
    volume: 194500000,
    sector: "반도체 설계 (Fabless)",
    description: "AI 연산에 필수적인 GPU 설계 및 가속 연산 생태계 CUDA 소프트웨어 시장을 사실상 독점하고 있는 최대 테크 기업입니다. H100, H200 및 차세대 아키텍처 'Blackwell' 플랫폼 출시로 폭발적 실적 성장을 달성 중입니다.",
    currency: "USD"
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    market: "US",
    currentPrice: 187.95,
    change: 1.15,
    changePercent: 0.62,
    high: 189.40,
    low: 185.80,
    volume: 31240000,
    sector: "전자상거래 및 클라우드",
    description: "글로벌 전자상거래 유통 공룡이자 세계 최대 클라우드 인프라 서비스 AWS(Amazon Web Services) 운영사입니다. 물류 자동화, 클라우드 부문 AI 고성능 컴퓨팅 판매 확대로 고성장 안정 수익을 내고 있습니다.",
    currency: "USD"
  }
];

// Seed random price movements to simulate active markets
export function getSimulatedStocks(currentStocks?: Stock[]): Stock[] {
  const baseStocks = currentStocks && currentStocks.length > 0 ? currentStocks : STOCKS;
  return baseStocks.map(stock => {
    // Generate a small random variation (-0.1% to +0.1%)
    const pct = (Math.random() * 0.2 - 0.1) / 100;
    const priceDiff = stock.currentPrice * pct;
    const newPrice = Math.round((stock.currentPrice + priceDiff) * 100) / 100;
    const finalPrice = stock.market === "KR" ? Math.round(newPrice / 50) * 50 : newPrice; // Round KRW to nearest 50

    // Get the original stock to find the baseline yesterday close
    const original = STOCKS.find(s => s.symbol === stock.symbol) || stock;
    const yesterdayClose = original.currentPrice - original.change;

    const initialChange = finalPrice - yesterdayClose;
    const initialChangePercent = Math.round((initialChange / yesterdayClose) * 10000) / 100;

    return {
      ...stock,
      currentPrice: finalPrice,
      change: Math.round(initialChange * 100) / 100,
      changePercent: initialChangePercent,
      high: Math.max(stock.high, finalPrice),
      low: Math.min(stock.low, finalPrice),
    };
  });
}

// Generate realistic chart data
export interface ChartDataPoint {
  time: string;
  price: number;
}

export function generateChartData(stock: Stock, period: "1D" | "1W" | "1M" | "1Y"): ChartDataPoint[] {
  const points: ChartDataPoint[] = [];
  let numPoints = 0;
  let intervalDays = 1;
  const now = new Date();

  switch (period) {
    case "1D":
      numPoints = 24; // Hourly
      break;
    case "1W":
      numPoints = 7;
      break;
    case "1M":
      numPoints = 30;
      break;
    case "1Y":
      numPoints = 52; // Weekly
      break;
  }

  let currentVal = stock.currentPrice - (stock.change * (period === "1D" ? 0.7 : 2.5));

  // Determine a trend multiplier based on changePercent
  const trend = stock.changePercent / 100 / numPoints;

  for (let i = 0; i < numPoints; i++) {
    const pointDate = new Date(now);
    if (period === "1D") {
      pointDate.setHours(now.getHours() - (numPoints - i));
    } else if (period === "1W" || period === "1M") {
      pointDate.setDate(now.getDate() - (numPoints - i));
    } else {
      pointDate.setDate(now.getDate() - (numPoints - i) * 7);
    }

    // Random walk with a slight trend
    const volatility = stock.market === "US" ? 0.015 : 0.01; // US is slightly more volatile
    const randomChange = currentVal * (Math.random() * volatility * 2 - volatility);
    const trendContribution = currentVal * trend;

    currentVal += randomChange + trendContribution;

    // Boundary conditions
    if (currentVal < stock.low * 0.9) currentVal = stock.low * 0.95;
    if (currentVal > stock.high * 1.1) currentVal = stock.high * 1.05;

    // Rounding
    const finalVal = stock.market === "KR" ? Math.round(currentVal / 10) * 10 : Math.round(currentVal * 100) / 100;

    let timeString = "";
    if (period === "1D") {
      timeString = pointDate.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    } else {
      timeString = pointDate.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
    }

    points.push({
      time: timeString,
      price: finalVal
    });
  }

  // Force the final point to match currentPrice
  points[points.length - 1].price = stock.currentPrice;

  return points;
}

// Generate fallback News Items when API calls aren't fetched yet or to seed the initial UI
export function generateDefaultNews(stock: Stock): { title: string; source: string; time: string; sentiment: "bullish" | "bearish" | "neutral"; summary: string }[] {
  if (stock.market === "US") {
    return [
      {
        title: `${stock.name} (${stock.symbol}) 2분기 강력한 가이던스 제시, 시장 컨센서스 상회`,
        source: "Wall Street Journal",
        time: "1시간 전",
        sentiment: "bullish",
        summary: "고부가가치 서비스 부문의 성장 가속화와 주력 하드웨어 기기의 안정적 판매 흐름이 호실적을 견인했습니다. 특히 공급망 최적화 및 운영 효율화에 힘입어 마진율이 전년 동기 대비 1.5%p 증가했습니다."
      },
      {
        title: `글로벌 금리 변동성 및 거시경제 지표 발표 앞두고 테크 대형주 눈치보기 국면`,
        source: "Bloomberg",
        time: "3시간 전",
        sentiment: "neutral",
        summary: "이번 주 예정된 미 연준 위원들의 연설과 물가 지표 발표를 앞두고 대형 기술주 중심의 보수적 차익 실현 매물이 출현했습니다. 전문가들은 단기 금리 변동성이 주가 등락에 주요 변수가 될 것으로 전망합니다."
      },
      {
        title: `원자재 및 칩 제조 공급망 비용 단기 상승 우려, 하반기 영업이익 영향 주목`,
        source: "Reuters",
        time: "6시간 전",
        sentiment: "bearish",
        summary: "반도체 기판 및 주요 희토류 등의 글로벌 물류 지연으로 일부 부품 조달 원가가 단기 상승 추세에 직면했습니다. 이로 인해 가전 및 기기 제조 전반에 걸쳐 하반기 마진 압박 요인이 일부 누적되고 있다는 분석입니다."
      }
    ];
  } else {
    return [
      {
        title: `${stock.name} (${stock.symbol}) 외국인·기관 대규모 순매수 유입... 동반 매수세 급증`,
        source: "연합인포맥스",
        time: "30분 전",
        sentiment: "bullish",
        summary: "차세대 반도체 공급 계약 확대 및 주요 핵심 원자재 안정 수급 호재가 전해지면서 국내외 메이저 투신권의 장내 순매수가 거세지고 있습니다. 주간 단위 외국인 누적 지분율은 올해 최고치를 갱신했습니다."
      },
      {
        title: `${stock.name} 실적 턴어라운드 본격화 기대감 확산, 하반기 목표주가 잇따라 상향`,
        source: "한국경제",
        time: "2시간 전",
        sentiment: "bullish",
        summary: "수출 시장에서의 고사양 프리미엄 제품군 수요 호조로 고수익성 믹스 개선 효과가 본격 발휘되고 있습니다. 다수의 증권사 리서치센터는 기업 가치 재평가 국면에 진입했다며 목표 주가를 기존 대비 평균 12% 이상 일제히 상향 조정했습니다."
      },
      {
        title: `대외 환율 변동성 확대에 따른 환차손 우려 및 글로벌 규제 동향 면밀한 점검 필요`,
        source: "매일경제",
        time: "5시간 전",
        sentiment: "neutral",
        summary: "최근 달러 대비 원화 환율의 급변동은 수출 효자 기업인 동사 실적의 양날의 검입니다. 수출 단가 이익이 증대되는 긍정적 측면과 함께 해외 지사 운영비용 상승 등의 변수를 함께 상쇄해야 하는 대외적 관리 과제를 안고 있습니다."
      }
    ];
  }
}
