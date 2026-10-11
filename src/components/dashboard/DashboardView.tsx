import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Car,
  Clock,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  DollarSign,
  Package,
  Users,
  ChevronLeft,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  UserCheck,
  Building2,
  FileText,
  Activity,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { state, setActiveTab, theme, t } = useApp();
  const isDark = theme === 'dark';

  // Operational statistics
  const inWorkshopCount = state.vehicles.filter((v) => v.status === 'in_workshop').length;
  const awaitingInspectionCount = state.serviceOrders.filter((o) => o.status === 'awaiting_inspection').length;
  const awaitingApprovalCount = state.serviceOrders.filter((o) => o.status === 'awaiting_approval').length;
  const inProgressCount = state.serviceOrders.filter((o) => o.status === 'in_progress').length;
  const readyForDeliveryCount = state.serviceOrders.filter((o) => o.status === 'ready_for_delivery').length;

  // Active Employees and Users
  const activeEmployeesCount = state.employees.filter((e) => e.status === 'active').length;
  const activeUsersCount = state.users.filter((u) => (u.active !== undefined ? u.active : u.isActive) !== false).length;

  // Financial calculations
  const totalInvoicedRevenue = state.invoices
    .filter((i) => i.status !== 'cancelled')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const actualCollections = state.payments.reduce((sum, pay) => sum + pay.amount, 0);

  const outstandingReceivables = state.invoices
    .filter((i) => i.status !== 'cancelled')
    .reduce((sum, inv) => sum + inv.balanceDue, 0);

  const totalOperatingExpenses = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const partsCost = state.spareParts.reduce((sum, p) => sum + p.costPrice * (20 - p.currentStock > 0 ? 2 : 1), 0);
  const estimatedGrossProfit = Math.max(0, totalInvoicedRevenue - (partsCost * 0.4) - (totalOperatingExpenses * 0.2));

  // Low stock parts
  const lowStockParts = state.spareParts.filter((p) => p.currentStock <= p.minStock);

  // Lead mechanics & workshop team
  const technicians = state.employees.filter((e) => e.department === 'workshop');

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner with Maintenance Center Identity */}
      <div className={`relative rounded-2xl overflow-hidden border shadow-xl ${
        isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
      }`}>
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/workshop_bay_hero_1791696224243.jpg"
            alt="مركز صيانة التجمع الخامس"
            className="w-full h-full object-cover object-center opacity-25"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${
            isDark
              ? 'from-slate-950 via-slate-950/80 to-slate-950/40'
              : 'from-slate-900/90 via-slate-900/70 to-slate-900/40'
          }`} />
        </div>

        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 text-white">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>مركز صيانة التجمع الخامس · القاهرة الجديدة</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {state.settings.workshopName} · {state.settings.branch}
            </h1>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed max-w-xl">
              منظومة المتابعة المتكاملة لإدارة دورة صيانة المركبات، كروت الشغل، تشخيص الأعطال، المستودع، والفواتير الضريبية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('reception')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>استقبال سيارة جديدة</span>
            </button>
            <button
              onClick={() => setActiveTab('workshop_board')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-850 hover:bg-slate-750 text-slate-100 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer bg-slate-800/90 hover:bg-slate-700"
            >
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>لوحة الورشة الفنية</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Workshop Counters (5 Operational KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div
          onClick={() => setActiveTab('vehicles')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">في الورشة حالياً</span>
            <Car className="w-4 h-4 text-blue-500" />
          </div>
          <div className={`text-2xl font-black tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {inWorkshopCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">سيارة قيد الفحص أو العمل</div>
        </div>

        <div
          onClick={() => setActiveTab('service_orders')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">بانتظار الفحص</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-500 tabular-nums">
            {awaitingInspectionCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">بحاجة لكشف وتشخيص فني</div>
        </div>

        <div
          onClick={() => setActiveTab('estimates')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">بانتظار موافقة العميل</span>
            <AlertTriangle className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-500 tabular-nums">
            {awaitingApprovalCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">عروض أسعار مرسلة للعملاء</div>
        </div>

        <div
          onClick={() => setActiveTab('workshop_board')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">قيد التنفيذ على الرافعة</span>
            <Wrench className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-500 tabular-nums">
            {inProgressCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">مهندسون وفنيون يعملون</div>
        </div>

        <div
          onClick={() => setActiveTab('service_orders')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">جاهزة للتسليم للعميل</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-black text-teal-500 tabular-nums">
            {readyForDeliveryCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">اجتازت اختبار الجودة والتنظيف</div>
        </div>
      </div>

      {/* Staff & Accounts Quick Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          onClick={() => setActiveTab('employees')}
          className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
            isDark ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-400">إجمالي فريق العمل والمهندسين</div>
            <div className={`text-xl font-black tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {activeEmployeesCount} <span className="text-xs font-normal text-slate-400">موظف وفني نشط</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('users_permissions')}
          className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
            isDark ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-400">حسابات المستخدمين والصلاحيات</div>
            <div className={`text-xl font-black tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {activeUsersCount} <span className="text-xs font-normal text-slate-400">مستخدم معتمد</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('customers')}
          className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
            isDark ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-400">إجمالي قاعدة العملاء</div>
            <div className={`text-xl font-black tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {state.customers.length} <span className="text-xs font-normal text-slate-400">عميل مسجل</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('spare_parts')}
          className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
            isDark ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-400">أصناف قطع الغيار والمخزون</div>
            <div className={`text-xl font-black tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {state.spareParts.length} <span className="text-xs font-normal text-slate-400">صنف بالمستودع</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Financial Metrics Strip */}
      <div className={`border rounded-2xl p-5 md:p-6 space-y-4 ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              المؤشرات المالية الدقيقة (المبيعات والتحصيلات)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              فصل المبيعات المحققة بالفواتير عن المتحصلات النقدية الفعلية والأرباح وفقاً للمعايير المحاسبية
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
            الشهر الجاري
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Invoiced Revenue */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold">إجمالي المبيعات بالفواتير</span>
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
            <div className={`text-xl font-black tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {totalInvoicedRevenue.toLocaleString()} <span className="text-xs font-medium text-slate-400">{t.currencySymbol}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">إجمالي فواتير الصيانة المعتمدة</div>
          </div>

          {/* Metric 2: Actual Collections */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold">المتحصلات النقدية الفعلية</span>
              <CreditCard className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-black text-emerald-500 tabular-nums">
              {actualCollections.toLocaleString()} <span className="text-xs font-medium text-slate-400">{t.currencySymbol}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">المحصل بالخزينة والنقدي والبنك</div>
          </div>

          {/* Metric 3: Outstanding Receivables */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold">أرصدة العملاء المستحقة</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-black text-amber-500 tabular-nums">
              {outstandingReceivables.toLocaleString()} <span className="text-xs font-medium text-slate-400">{t.currencySymbol}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">متبقيات فواتير قيد السداد</div>
          </div>

          {/* Metric 4: Estimated Profit */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold">مجمل الأرباح التقديرية</span>
              <TrendingUp className="w-4 h-4 text-teal-500" />
            </div>
            <div className="text-xl font-black text-teal-500 tabular-nums">
              {estimatedGrossProfit.toLocaleString()} <span className="text-xs font-medium text-slate-400">{t.currencySymbol}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">الإيرادات بعد خصم القطع والمصروفات</div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Low Stock Warnings & Technician Productivity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Low Stock Parts (6 Cols) */}
        <div className={`lg:col-span-6 border rounded-2xl p-5 md:p-6 space-y-3 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" />
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                تنبيهات نقص مخزون قطع الغيار
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('spare_parts')}
              className="text-xs text-blue-500 hover:underline flex items-center gap-1 font-bold cursor-pointer"
            >
              <span>عرض الكتالوج</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {lowStockParts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                جميع أرصدة قطع الغيار عند المعدلات الآمنة والمطلوبة
              </div>
            ) : (
              lowStockParts.slice(0, 4).map((part) => (
                <div
                  key={part.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="min-w-0">
                    <div className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{part.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      كود: {part.sku} · الرف: {part.binLocation}
                    </div>
                  </div>
                  <div className="text-start shrink-0">
                    <div className="font-bold text-amber-500 tabular-nums">
                      {part.currentStock} {part.unit} (الحد الأدنى: {part.minStock})
                    </div>
                    <button
                      onClick={() => setActiveTab('purchase_orders')}
                      className="mt-1 text-[11px] text-blue-500 hover:underline font-semibold block cursor-pointer"
                    >
                      طلب توريد +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lead Mechanics & Workshop Team (6 Cols) */}
        <div className={`lg:col-span-6 border rounded-2xl p-5 md:p-6 space-y-3 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                توزيع ضغط العمل على المهندسين والفنيين
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('employees')}
              className="text-xs text-blue-500 hover:underline flex items-center gap-1 font-bold cursor-pointer"
            >
              <span>فريق العمل</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {technicians.slice(0, 4).map((tech) => {
              const activeCount = state.serviceOrders.filter(
                (o) => o.assignedTechnicianId === tech.id && o.status !== 'completed' && o.status !== 'cancelled'
              ).length;
              return (
                <div
                  key={tech.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {tech.avatarUrl ? (
                      <img
                        src={tech.avatarUrl}
                        alt={tech.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                        {tech.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {tech.nameAr || tech.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {tech.jobTitleAr || tech.jobTitle}
                      </div>
                    </div>
                  </div>

                  <div className="text-start">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 tabular-nums">
                      {activeCount} أوامر شغل نشطة
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity Log Stream */}
      <div className={`border rounded-2xl p-5 md:p-6 space-y-3 ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              سجل النشاط المباشر والعمليات بالورشة
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('audit_log')}
            className="text-xs text-blue-500 hover:underline flex items-center gap-1 font-bold cursor-pointer"
          >
            <span>سجل الرقابة الكامل</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {state.auditLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className={`p-3 rounded-xl border flex items-start justify-between gap-4 text-xs ${
                isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{log.userName}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 font-mono font-medium">
                    {log.action}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-1">{log.details}</p>
              </div>
              <span className="text-[11px] text-slate-500 font-mono shrink-0 tabular-nums">
                {log.timestamp.slice(11)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
