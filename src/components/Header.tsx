import { useState } from "react";
import { User } from "firebase/auth";
import { Sparkles, User as UserIcon, LogIn, LogOut, ChevronDown, Award } from "lucide-react";

interface HeaderProps {
  currentUser: User | null;
  onOpenLogin: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Header({ currentUser, onOpenLogin, activeTab, setActiveTab }: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  const tabs = [
    { id: "dashboard", label: "대시보드" },
    { id: "analysis", label: "AI 종목분석" },
    { id: "news", label: "뉴스 브리핑" },
    { id: "portfolio", label: "내 포트폴리오" }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md" id="app-header">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab("dashboard")} 
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          id="brand-logo"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md shadow-emerald-500/10 transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5 fill-slate-950/20" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-slate-100 bg-gradient-to-r from-slate-100 via-slate-200 to-emerald-400 bg-clip-text text-transparent">
              StockPilot
            </span>
            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded ml-1.5 border border-emerald-500/15 uppercase font-mono tracking-wider">
              AI
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive 
                    ? "bg-slate-900 text-emerald-400 border border-slate-800 shadow-sm" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
                id={`btn-nav-tab-${tab.id}`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* User Auth Info */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-1.5 pl-3 pr-2.5 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                id="btn-profile-toggle"
              >
                <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Award className="h-3.5 w-3.5" />
                </div>
                <span className="max-w-[120px] truncate">{currentUser.email?.split("@")[0]}</span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </button>

              {profileOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-800 bg-slate-950 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setProfileOpen(false)}
                >
                  <div className="px-3.5 py-2.5 border-b border-slate-900">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">접속 이메일</p>
                    <p className="text-xs font-bold text-slate-300 truncate mt-0.5">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onOpenLogin();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3.5 py-2.5 text-left text-xs text-slate-400 hover:bg-slate-900 hover:text-rose-400 transition-all cursor-pointer"
                    id="btn-header-signout"
                  >
                    <LogOut className="h-4 w-4" />
                    로그아웃 및 계정 정보
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer"
              id="btn-header-login"
            >
              <LogIn className="h-3.5 w-3.5 text-emerald-500" />
              로그인 / 회원가입
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
