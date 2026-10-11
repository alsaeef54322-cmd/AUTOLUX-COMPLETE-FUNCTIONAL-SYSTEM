import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wrench,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  Building2,
  Sparkles,
  Sun,
  Moon,
  ShieldAlert,
  Crown,
  UserCheck,
  Calculator,
  Package,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, theme, setTheme } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoleKey, setSelectedRoleKey] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);

  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleInstantRoleLogin = (uname: string, pass: string, roleKey: string) => {
    setSelectedRoleKey(roleKey);
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(uname, pass);
      setIsLoading(false);
      if (!res.success) {
        setError(res.error || 'فشل تسجيل الدخول، يرجى إعادة المحاولة.');
      }
    }, 220);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      setIsLoading(false);
      if (!res.success) {
        setError(res.error || 'فشل تسجيل الدخول، يرجى مراجعة البيانات.');
      }
    }, 250);
  };

  // Modern visual role accounts with high-tech icons
  const roleCards = [
    {
      key: 'admin',
      roleTitle: 'مدير المركز (Admin)',
      roleSubtitle: 'صلاحيات الإدارة والرقابة الكاملة',
      employeeName: 'م. أحمد السيد',
      username: 'admin',
      pass: '123456',
      icon: Crown,
      tag: 'إدارة عليا',
      accentColor: 'blue',
      cardDark: 'from-blue-600/20 via-slate-900 to-slate-900 border-blue-500/40 hover:border-blue-400 text-blue-300',
      cardLight: 'from-blue-50 via-white to-white border-blue-200 hover:border-blue-400 text-blue-800 shadow-blue-100/50',
      badgeDark: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      badgeLight: 'bg-blue-100 text-blue-800 border-blue-200',
      iconBgDark: 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/30',
      iconBgLight: 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-400/40',
    },
    {
      key: 'chief',
      roleTitle: 'كبير مهندسي الورشة',
      roleSubtitle: 'فحص وتشخيص وأوامر الإصلاح',
      employeeName: 'م. طارق منصور',
      username: 'engineer',
      pass: '123456',
      icon: Wrench,
      tag: 'الورشة الفنية',
      accentColor: 'amber',
      cardDark: 'from-amber-600/20 via-slate-900 to-slate-900 border-amber-500/40 hover:border-amber-400 text-amber-300',
      cardLight: 'from-amber-50 via-white to-white border-amber-200 hover:border-amber-400 text-amber-900 shadow-amber-100/50',
      badgeDark: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      badgeLight: 'bg-amber-100 text-amber-800 border-amber-200',
      iconBgDark: 'bg-gradient-to-tr from-amber-600 to-orange-600 text-white shadow-amber-500/30',
      iconBgLight: 'bg-gradient-to-tr from-amber-600 to-orange-600 text-white shadow-amber-400/40',
    },
    {
      key: 'reception',
      roleTitle: 'استقبال العملاء',
      roleSubtitle: 'استلام المركبات والمقايسات والتسليم',
      employeeName: 'نوران شريف',
      username: 'reception',
      pass: '123456',
      icon: UserCheck,
      tag: 'خدمة العملاء',
      accentColor: 'emerald',
      cardDark: 'from-emerald-600/20 via-slate-900 to-slate-900 border-emerald-500/40 hover:border-emerald-400 text-emerald-300',
      cardLight: 'from-emerald-50 via-white to-white border-emerald-200 hover:border-emerald-400 text-emerald-900 shadow-emerald-100/50',
      badgeDark: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      badgeLight: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      iconBgDark: 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-emerald-500/30',
      iconBgLight: 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-emerald-400/40',
    },
    {
      key: 'technician',
      roleTitle: 'فني صيانة محركات وكهرباء',
      roleSubtitle: 'تنفيذ المهام وقطع الغيار وجودة الإصلاح',
      employeeName: 'حسن سليمان',
      username: 'technician',
      pass: '123456',
      icon: Cpu,
      tag: 'الصيانة والتنفيذ',
      accentColor: 'purple',
      cardDark: 'from-purple-600/20 via-slate-900 to-slate-900 border-purple-500/40 hover:border-purple-400 text-purple-300',
      cardLight: 'from-purple-50 via-white to-white border-purple-200 hover:border-purple-400 text-purple-900 shadow-purple-100/50',
      badgeDark: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      badgeLight: 'bg-purple-100 text-purple-800 border-purple-200',
      iconBgDark: 'bg-gradient-to-tr from-purple-600 to-violet-600 text-white shadow-purple-500/30',
      iconBgLight: 'bg-gradient-to-tr from-purple-600 to-violet-600 text-white shadow-purple-400/40',
    },
    {
      key: 'accountant',
      roleTitle: 'المحاسب المالي والخزينة',
      roleSubtitle: 'الفواتير الضريبية والتحصيل والمصروفات',
      employeeName: 'يوسف البحر',
      username: 'accountant',
      pass: '123456',
      icon: Calculator,
      tag: 'المالية والحسابات',
      accentColor: 'cyan',
      cardDark: 'from-cyan-600/20 via-slate-900 to-slate-900 border-cyan-500/40 hover:border-cyan-400 text-cyan-300',
      cardLight: 'from-cyan-50 via-white to-white border-cyan-200 hover:border-cyan-400 text-cyan-900 shadow-cyan-100/50',
      badgeDark: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      badgeLight: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      iconBgDark: 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-cyan-500/30',
      iconBgLight: 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-cyan-400/40',
    },
    {
      key: 'inventory',
      roleTitle: 'مسؤول المخزن وقطع الغيار',
      roleSubtitle: 'كتالوج الأصناف وحركات الصرف وأوامر الشراء',
      employeeName: 'سامح رضا',
      username: 'inventory',
      pass: '123456',
      icon: Package,
      tag: 'المخزن والتوريد',
      accentColor: 'rose',
      cardDark: 'from-rose-600/20 via-slate-900 to-slate-900 border-rose-500/40 hover:border-rose-400 text-rose-300',
      cardLight: 'from-rose-50 via-white to-white border-rose-200 hover:border-rose-400 text-rose-900 shadow-rose-100/50',
      badgeDark: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      badgeLight: 'bg-rose-100 text-rose-800 border-rose-200',
      iconBgDark: 'bg-gradient-to-tr from-rose-600 to-pink-600 text-white shadow-rose-500/30',
      iconBgLight: 'bg-gradient-to-tr from-rose-600 to-pink-600 text-white shadow-rose-400/40',
    },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Background Ambient Glow */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          isDark
            ? 'bg-radial from-blue-900/20 via-slate-950/80 to-slate-950 opacity-100'
            : 'bg-radial from-blue-200/50 via-slate-100/80 to-slate-100 opacity-90'
        }`}
      />
      <div
        className={`absolute top-0 inset-x-0 h-96 pointer-events-none transition-colors duration-300 ${
          isDark
            ? 'bg-gradient-to-b from-blue-600/15 to-transparent'
            : 'bg-gradient-to-b from-blue-500/15 to-transparent'
        }`}
      />

      {/* Top Floating Bar: Controls (Theme Only) */}
      <div className="absolute top-4 sm:top-6 start-4 sm:start-8 end-4 sm:end-8 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md shadow-xs ${
              isDark
                ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                : 'bg-white/90 border-slate-200 text-slate-700 shadow-slate-200/50'
            }`}
          >
            <span>مركز صيانة التجمع الخامس</span>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {/* Day / Night Toggle (زر ليل ونهار) */}
          <button
            onClick={toggleTheme}
            type="button"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold backdrop-blur-md transition-all cursor-pointer select-none shadow-xs ${
              isDark
                ? 'bg-slate-900/90 border-slate-700 hover:bg-slate-800 text-amber-300 hover:text-amber-200'
                : 'bg-white/95 border-slate-300 hover:bg-slate-50 text-blue-700 hover:text-blue-800 shadow-sm'
            }`}
            title={isDark ? 'التحويل إلى الوضع النهاري' : 'التحويل إلى الوضع الليلي'}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span className="font-bold">نهار</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-600" />
                <span className="font-bold">ليل</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Login Viewport */}
      <div className="relative z-10 w-full max-w-4xl my-auto py-10 sm:py-12">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/25 border border-blue-400/30 mx-auto">
            <Wrench className="w-8 h-8 text-white" />
          </div>

          <div>
            <div
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold mb-2 transition-colors ${
                isDark
                  ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                  : 'bg-blue-100 border border-blue-200 text-blue-700'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>منظومة صيانة السيارات الفاخرة · التجمع الخامس</span>
            </div>
            <h1
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight transition-colors ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              تسجيل الدخول السريع الذكي
            </h1>
            <p
              className={`text-sm mt-1.5 max-w-md mx-auto transition-colors ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              اختر دورك الوظيفي بضغطة زر واحدة للدخول المباشر إلى المنظومة بدون إدخال بيانات معقدة
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-300 text-xs flex items-center justify-between gap-3 max-w-xl mx-auto shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs font-bold underline cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* SECTION 1: Modern Icon-Based Quick Role Selection */}
        {!showManualForm ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {roleCards.map((role) => {
                const Icon = role.icon;
                const isThisLoading = isLoading && selectedRoleKey === role.key;

                return (
                  <button
                    key={role.key}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleInstantRoleLogin(role.username, role.pass, role.key)}
                    className={`group relative flex flex-col justify-between p-5 rounded-2xl border text-start transition-all duration-200 cursor-pointer overflow-hidden shadow-lg backdrop-blur-md hover:scale-[1.02] active:scale-[0.99] disabled:opacity-70 ${
                      isDark
                        ? `bg-gradient-to-b ${role.cardDark}`
                        : `bg-gradient-to-b ${role.cardLight}`
                    }`}
                  >
                    {/* Top zone: Icon + Tag */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110 ${
                          isDark ? role.iconBgDark : role.iconBgLight
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                          isDark ? role.badgeDark : role.badgeLight
                        }`}
                      >
                        {role.tag}
                      </span>
                    </div>

                    {/* Middle zone: Role Title & Employee info */}
                    <div className="space-y-1 mb-4">
                      <div
                        className={`font-extrabold text-base transition-colors ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {role.roleTitle}
                      </div>
                      <div
                        className={`text-xs font-medium truncate ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        {role.employeeName}
                      </div>
                      <div
                        className={`text-[11px] line-clamp-1 ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {role.roleSubtitle}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div
                      className={`pt-3 border-t flex items-center justify-between text-xs font-bold transition-colors ${
                        isDark
                          ? 'border-slate-800/80 text-blue-400 group-hover:text-blue-300'
                          : 'border-slate-200/80 text-blue-600 group-hover:text-blue-700'
                      }`}
                    >
                      {isThisLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>جاري تسجيل الدخول...</span>
                        </div>
                      ) : (
                        <>
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>دخول فوري بلمسة واحدة</span>
                          </span>
                          <ArrowRight className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Switch to manual credentials input */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowManualForm(true)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isDark
                    ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                    : 'border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-white shadow-xs'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>أو الدخول اليدوي باسم مستخدم وكلمة مرور مخصصة</span>
              </button>
            </div>
          </div>
        ) : (
          /* SECTION 2: Manual Credentials Form */
          <div className="max-w-md mx-auto">
            <div
              className={`p-6 sm:p-8 rounded-2xl border backdrop-blur-md shadow-2xl transition-all ${
                isDark
                  ? 'bg-slate-900/90 border-slate-800 text-white'
                  : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/40'
              }`}
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/40">
                <div className="font-bold text-sm">تسجيل الدخول اليدوي</div>
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="text-xs text-blue-500 hover:underline cursor-pointer"
                >
                  الرجوع لاختيار الأيقونات السريعة
                </button>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold block">اسم المستخدم أو البريد</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute end-3.5 top-3 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin أو engineer أو reception..."
                      className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-hidden ${
                        isDark
                          ? 'bg-slate-950/70 border border-slate-700/80 text-white placeholder:text-slate-500 focus:border-blue-500'
                          : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold block">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute end-3.5 top-3 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-hidden ps-10 ${
                        isDark
                          ? 'bg-slate-950/70 border border-slate-700/80 text-white placeholder:text-slate-500 focus:border-blue-500'
                          : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute start-3 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>تأكيد تسجيل الدخول</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div
          className={`mt-8 text-center text-xs space-y-1 transition-colors ${
            isDark ? 'text-slate-500' : 'text-slate-600'
          }`}
        >
          <div className="flex items-center justify-center gap-2 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>نظام الإدارة المتكامل لمركز صيانة السيارات الفاخرة · AutoLux ERP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
