import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wrench,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, state, theme, setTheme } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      setIsLoading(false);
      if (!res.success) {
        setError(res.error || 'فشل تسجيل الدخول، يرجى التحقق من صحة البيانات.');
      }
    }, 250);
  };

  const handleQuickLogin = (uname: string, pass: string) => {
    setUsername(uname);
    setPassword(pass);
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(uname, pass);
      setIsLoading(false);
      if (!res.success) {
        setError(res.error || 'فشل تسجيل الدخول.');
      }
    }, 200);
  };

  const demoAccounts = [
    {
      title: 'مدير المركز (Admin)',
      name: 'م. أحمد السيد',
      username: 'admin',
      pass: '123456',
      role: 'صلاحيات كاملة',
      color: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    },
    {
      title: 'مهندس الورشة (Chief)',
      name: 'م. طارق منصور',
      username: 'engineer',
      pass: '123456',
      role: 'إدارة الورشة والفحص',
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    },
    {
      title: 'موظف الاستقبال',
      name: 'نوران شريف',
      username: 'reception',
      pass: '123456',
      role: 'الاستقبال والعملاء',
      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    },
    {
      title: 'مهندس / فني صيانة',
      name: 'حسن سليمان',
      username: 'technician',
      pass: '123456',
      role: 'تنفيذ أوامر الشغل',
      color: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    },
    {
      title: 'المحاسب المالي',
      name: 'يوسف البحر',
      username: 'accountant',
      pass: '123456',
      role: 'الفواتير والخزينة',
      color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden bg-slate-950 text-slate-100 transition-colors duration-200">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-radial from-blue-900/20 via-slate-950/80 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />

      {/* Top Controls: Theme toggle */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
          title="تبديل الوضع الليلي / النهاري"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Brand Card Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/20 border border-blue-400/30 mx-auto">
            <Wrench className="w-8 h-8 text-white" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>القاهرة الجديدة · التجمع الخامس</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              مركز صيانة التجمع الخامس
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
              بوابة تسجيل الدخول الآمنة لمنظومة إدارة الورش، استقبال المركبات، الفحص الفني، والعمليات المالية
            </p>
          </div>
        </div>

        {/* Login Form Container */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute end-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="مثال: admin أو engineer أو reception"
                  className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute end-3.5 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors ps-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute start-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>دخول إلى النظام</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>تسجيل دخول سريع للتجربة (نقرة واحدة):</span>
              </span>
              <span className="text-[11px] text-slate-500">كلمة المرور: 123456</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleQuickLogin(acc.username, acc.pass)}
                  className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer hover:scale-[1.01] ${acc.color}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{acc.title}</span>
                    <span className="text-[10px] font-mono opacity-80">{acc.username}</span>
                  </div>
                  <div className="text-[11px] opacity-90 mt-0.5 truncate">{acc.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
          <p>مركز صيانة التجمع الخامس · المنطقة الصناعية ومحور محمد نجيب</p>
          <p className="text-[11px] text-slate-600">
            جميع البيانات محفوظة ومحدثة محلياً على المتصفح عبر LocalStorage
          </p>
        </div>
      </div>
    </div>
  );
};
