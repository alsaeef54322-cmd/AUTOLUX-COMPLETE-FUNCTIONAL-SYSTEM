import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Building,
  Save,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Sun,
  Moon,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  FileText,
  Percent,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { state, updateSettings, resetDemoData, setTheme, theme, t } = useApp();

  const [workshopName, setWorkshopName] = useState(state.settings.workshopName);
  const [branch, setBranch] = useState(state.settings.branch);
  const [address, setAddress] = useState(state.settings.address);
  const [phone, setPhone] = useState(state.settings.phone);
  const [email, setEmail] = useState(state.settings.email);
  const [taxNumber, setTaxNumber] = useState(state.settings.taxNumber);
  const [commercialReg, setCommercialReg] = useState(state.settings.commercialReg);
  const [taxRate, setTaxRate] = useState(state.settings.taxRate);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const isDark = theme === 'dark';

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      workshopName,
      branch,
      address,
      phone,
      email,
      taxNumber,
      commercialReg,
      taxRate: Number(taxRate),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Settings className="w-6 h-6 text-blue-500" />
            <span>إعدادات النظام والمركز</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            بيانات مركز صيانة التجمع الخامس، السجل التجاري، البطاقة الضريبية، المظهر والفواتير
          </p>
        </div>

        {/* Demo reset button */}
        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            isDark
              ? 'bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 text-rose-300'
              : 'bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>استعادة البيانات الافتراضية</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>تم حفظ وتحديث إعدادات المركز بنجاح.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Workshop Legal & Tax Profile (7 cols) */}
        <div className={`lg:col-span-7 border rounded-2xl p-5 md:p-6 space-y-4 text-xs ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className={`flex items-center gap-2 pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <Building className="w-4 h-4 text-blue-500" />
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              البيانات الرسمية والضريبية للمركز
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-slate-400 font-medium">اسم المركز التجاري *</label>
              <input
                type="text"
                required
                value={workshopName}
                onChange={(e) => setWorkshopName(e.target.value)}
                className={`w-full p-2.5 rounded-xl border text-xs ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                }`}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-slate-400 font-medium">اسم الفرع *</label>
              <input
                type="text"
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className={`w-full p-2.5 rounded-xl border text-xs ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-400 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>العنوان الجغرافي بالتفصيل *</span>
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`w-full p-2.5 rounded-xl border text-xs ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-slate-400 font-medium flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>أرقام الهواتف والخدمة *</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full p-2.5 rounded-xl border text-xs font-mono ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                }`}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-slate-400 font-medium flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>البريد الإلكتروني للخدمة</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-2.5 rounded-xl border text-xs ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                }`}
              />
            </div>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="space-y-1">
              <label className="block text-slate-400 font-medium flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>رقم التسجيل الضريبي</span>
              </label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                className={`w-full p-2.5 rounded-xl border text-xs font-mono ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                }`}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-slate-400 font-medium flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                <span>رقم السجل التجاري</span>
              </label>
              <input
                type="text"
                value={commercialReg}
                onChange={(e) => setCommercialReg(e.target.value)}
                className={`w-full p-2.5 rounded-xl border text-xs font-mono ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                }`}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-slate-400 font-medium flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-slate-500" />
                <span>ضريبة القيمة المضافة (%)</span>
              </label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className={`w-full p-2.5 rounded-xl border text-xs font-mono ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                }`}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all cursor-pointer shadow-md shadow-blue-600/20"
            >
              <Save className="w-4 h-4" />
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </div>

        {/* Right: Storage & Appearance (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Theme card */}
          <div className={`border rounded-2xl p-5 md:p-6 space-y-4 text-xs ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>المظهر والعرض</span>
            </h3>

            <div className={`flex items-center justify-between p-3.5 rounded-xl border ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>الوضع الليلي والنهاري</div>
                <div className="text-[11px] text-slate-400 mt-0.5">تبديل ألوان الواجهة بين الداكن والفاتح</div>
              </div>
              <button
                type="button"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-blue-600 border-slate-200 shadow-xs'
                }`}
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4" />
                    <span>الوضع النهاري</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    <span>الوضع الليلي</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Official Invoices & Documentation Settings card */}
          <div className={`border rounded-2xl p-5 md:p-6 space-y-4 text-xs ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <FileText className="w-4 h-4 text-blue-500" />
              <span>إعدادات الفواتير والمطبوعات الرسمية</span>
            </h3>

            <div className={`p-4 rounded-xl border space-y-3 ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/40">
                <span className="text-slate-400">العملة الافتراضية للمعاملات:</span>
                <span className="font-bold text-blue-400 font-mono">{state.settings.currency || 'ج.م'} (جنيه مصري)</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/40">
                <span className="text-slate-400">بادئة الفواتير الضريبية:</span>
                <span className="font-bold font-mono text-emerald-400">{state.settings.invoicePrefix || 'INV-2026-'}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/40">
                <span className="text-slate-400">بادئة كروت وأوامر الشغل:</span>
                <span className="font-bold font-mono text-amber-400">{state.settings.workOrderPrefix || 'WO-2026-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">المنطقة الزمنية:</span>
                <span className="font-mono text-slate-300">توقيت القاهرة (GMT+2)</span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Confirmation modal for demo reset */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4" dir="rtl">
          <div className={`w-full max-w-md border rounded-2xl p-6 shadow-2xl text-center space-y-4 text-xs ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
          }`}>
            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
              هل أنت متأكد من استعادة البيانات الافتراضية؟
            </h3>
            <p className="text-slate-400 leading-relaxed">
              سيتم إعادة تعيين قاعدة البيانات إلى الحالة الأولية الخاصة بمركز صيانة التجمع الخامس شاملة الفنيين، العملاء، أوامر الشغل، والمخزون.
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                إلغاء الأمر
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDemoData();
                  setIsResetConfirmOpen(false);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md shadow-rose-600/30"
              >
                تأكيد الاستعادة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
