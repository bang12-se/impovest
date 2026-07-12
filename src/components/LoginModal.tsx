import React, { useState } from "react";
import { auth } from "../firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from "firebase/auth";
import { X, Mail, Lock, User as UserIcon, LogOut, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export default function LoginModal({ isOpen, onClose, currentUser }: LoginModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccess("회원가입이 성공적으로 완료되었습니다! 자동 로그인됩니다.");
        setTimeout(() => {
          onClose();
          setSuccess("");
          setEmail("");
          setPassword("");
        }, 1500);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess("성공적으로 로그인되었습니다!");
        setTimeout(() => {
          onClose();
          setSuccess("");
          setEmail("");
          setPassword("");
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("이미 사용 중인 이메일입니다.");
      } else if (err.code === "auth/weak-password") {
        setError("비밀번호는 최소 6자 이상이어야 합니다.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        setError("인증 과정에서 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setSuccess("로그아웃되었습니다.");
      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 1500);
    } catch (err: any) {
      setError("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl transition-all duration-300">
        
        {/* Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition-colors"
          id="btn-close-auth-modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8">
          {currentUser ? (
            <div className="text-center py-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-100">로그인 완료</h3>
              <p className="mt-2 text-sm text-slate-400">
                현재 <span className="text-emerald-400 font-medium">{currentUser.email}</span> 계정으로 접속 중입니다.
              </p>
              
              {success && (
                <div className="mt-4 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-400 border border-emerald-500/20">
                  {success}
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                  id="btn-auth-signout"
                >
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </button>
                <button
                  onClick={onClose}
                  className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-all cursor-pointer"
                  id="btn-auth-modal-confirm"
                >
                  확인
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-100">
                  {isRegister ? "회원가입" : "로그인"}
                </h3>
                <p className="mt-1.5 text-sm text-slate-400">
                  {isRegister 
                    ? "StockPilot AI의 회원이 되어 관심종목과 포트폴리오를 동기화하세요!" 
                    : "로그인 후 나만의 맞춤 AI 분석과 포트폴리오를 관리하세요."}
                </p>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-xs text-rose-400 border border-rose-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-400 border border-emerald-500/20">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">이메일 주소</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                      <Mail className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                      id="input-auth-email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">비밀번호</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                      <Lock className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                      id="input-auth-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3.5 text-sm font-semibold text-slate-950 hover:from-emerald-400 hover:to-teal-400 focus:outline-none disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 mt-6"
                  id="btn-auth-submit"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isRegister ? (
                    "계정 생성하기"
                  ) : (
                    "로그인"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-500">
                <span>{isRegister ? "이미 계정이 있으신가요? " : "처음 방문하셨나요? "}</span>
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors underline bg-transparent border-0 cursor-pointer"
                  id="btn-toggle-register"
                >
                  {isRegister ? "로그인하기" : "회원가입하기"}
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  id="btn-continue-guest"
                >
                  로그인 없이 체험하기 (비회원 모드) &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
