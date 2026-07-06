import { useState, useRef, useEffect } from "react";
import { Stock } from "../types";
import { STOCKS } from "../utils/stockData";
import { Search, X, Star, TrendingUp, TrendingDown } from "lucide-react";

interface StockSearchProps {
  onSelectStock: (stock: Stock) => void;
  activeStock: Stock;
  marketStocks?: Stock[];
}

export default function StockSearch({ onSelectStock, activeStock, marketStocks = STOCKS }: StockSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter stocks based on name or symbol matching query
  const filteredStocks = query.trim() === "" 
    ? [] 
    : marketStocks.filter(stock => 
        stock.name.toLowerCase().includes(query.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(query.toLowerCase())
      );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (stock: Stock) => {
    onSelectStock(stock);
    setQuery("");
    setIsOpen(false);
  };

  const isPos = activeStock.change >= 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-xl" id="stock-search-container">
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
          <Search className="h-4.5 w-4.5 text-emerald-500" />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="주식명 또는 종목 코드를 입력해 검색... (예: 삼성전자, NVDA)"
          className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 py-3.5 pl-11 pr-11 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-xl"
          id="input-stock-search"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-slate-300 transition-colors"
            id="btn-clear-search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && filteredStocks.length > 0 && (
        <div className="absolute top-full left-0 z-40 w-full mt-2 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl backdrop-blur-md">
          <div className="max-h-[280px] overflow-y-auto p-1.5 space-y-1">
            {filteredStocks.map((stock) => {
              const itemPos = stock.change >= 0;
              return (
                <button
                  key={stock.symbol}
                  onClick={() => handleSelect(stock)}
                  className="flex items-center justify-between w-full p-3 text-left rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
                  id={`search-suggestion-${stock.symbol}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 text-sm tracking-tight">{stock.name}</span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded font-mono">
                        {stock.symbol}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-sm">{stock.sector}</p>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-slate-200">
                      {stock.currentPrice.toLocaleString()}
                      <span className="text-[9px] text-slate-400 font-normal ml-0.5">{stock.currency}</span>
                    </div>
                    <div className={`text-[10px] font-semibold ${itemPos ? "text-emerald-400" : "text-rose-400"} mt-0.5`}>
                      {itemPos ? "+" : ""}{stock.changePercent}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No results message */}
      {isOpen && query.trim() !== "" && filteredStocks.length === 0 && (
        <div className="absolute top-full left-0 z-40 w-full mt-2 p-5 text-center rounded-xl border border-slate-850 bg-slate-900 text-xs text-slate-500 shadow-2xl">
          주식명 또는 기호 <span className="text-slate-300 font-semibold font-mono">"{query}"</span> 에 부합하는 등록된 종목을 찾지 못했습니다.
        </div>
      )}
    </div>
  );
}
