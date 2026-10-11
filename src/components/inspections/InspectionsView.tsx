import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Inspection, InspectionItem } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Plus,
  FileCheck,
  FileSpreadsheet,
} from 'lucide-react';

const SYSTEM_CHECKLIST_TEMPLATE = [
  { system: 'الفرامل والمكابح', component: 'تيل الفرامل والطنابير الأمامية' },
  { system: 'الفرامل والمكابح', component: 'تيل الفرامل والطنابير الخلفية' },
  { system: 'الفرامل والمكابح', component: 'مستوى ورطوبة زيت الفرامل (أقل من 2%)' },
  { system: 'العفشة والتعليق', component: 'جلب مقصات العفشة السفلية' },
  { system: 'العفشة والتعليق', component: 'المساعدين والبطاحات الأمامية' },
  { system: 'العفشة والتعليق', component: 'بارات ومسامير ميزان الاتزان' },
  { system: 'المحرك والسوائل', component: 'مستوى ولزوجة زيت المحرك التخليقي' },
  { system: 'المحرك والسوائل', component: 'سائل التبريد وضغط غطاء الرادياتير' },
  { system: 'المحرك والسوائل', component: 'سير المجموعة وشداد المحرك' },
  { system: 'الكهرباء والبطارية', component: 'حالة بطارية 12V AGM وكفاءة التشغيل' },
  { system: 'الكهرباء والبطارية', component: 'خرج شحن الدينامو (14.2 فولت)' },
  { system: 'الإطارات والزوايا', component: 'عمق نقشة الإطارات وحالة الكاوتش' },
  { system: 'الإطارات والزوايا', component: 'استقامة الشاسيه وضبط الزوايا' },
];

export const InspectionsView: React.FC = () => {
  const { state, createInspection, convertInspectionToEstimate, setActiveTab, theme, t } = useApp();

  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(
    state.inspections[0] || null
  );

  const [isCreating, setIsCreating] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [inspectorName, setInspectorName] = useState('م. طارق منصور');

  const isDark = theme === 'dark';

  // Dynamic items state for new inspection
  const [checklistItems, setChecklistItems] = useState<
    { system: string; component: string; condition: 'good' | 'attention' | 'critical'; notes: string; recommendedAction: string }[]
  >(
    SYSTEM_CHECKLIST_TEMPLATE.map((t) => ({
      ...t,
      condition: 'good',
      notes: 'تم الفحص - بحالة ممتازة ومطابق للمواصفات القياسية.',
      recommendedAction: '',
    }))
  );

  const handleItemConditionChange = (idx: number, condition: 'good' | 'attention' | 'critical') => {
    const updated = [...checklistItems];
    updated[idx].condition = condition;
    if (condition === 'critical') {
      updated[idx].notes = 'تلف أو تآكل ملحوظ يتجاوز حد الأمان.';
      updated[idx].recommendedAction = `تغيير أو صيانة فورية لـ ${updated[idx].component}`;
    } else if (condition === 'attention') {
      updated[idx].notes = 'تآكل طفيف بحاجة للملاحظة.';
      updated[idx].recommendedAction = 'متابعة في الصيانة الدورية القادمة';
    }
    setChecklistItems(updated);
  };

  const handleItemNotesChange = (idx: number, notes: string) => {
    const updated = [...checklistItems];
    updated[idx].notes = notes;
    setChecklistItems(updated);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;
    const order = state.serviceOrders.find((o) => o.id === selectedOrderId);
    if (!order) return;

    const criticalCount = checklistItems.filter((i) => i.condition === 'critical').length;
    const attentionCount = checklistItems.filter((i) => i.condition === 'attention').length;
    const score = Math.max(20, 100 - criticalCount * 20 - attentionCount * 8);

    const formattedItems: InspectionItem[] = checklistItems.map((item, i) => ({
      id: `ii-${Date.now()}-${i}`,
      system: item.system,
      component: item.component,
      condition: item.condition,
      notes: item.notes,
      recommendedAction: item.recommendedAction,
    }));

    const newInsp = createInspection({
      serviceOrderId: order.id,
      vehicleId: order.vehicleId,
      inspectorId: state.currentUser.id,
      inspectorName,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      mileage: order.mileageIn,
      overallScore: score,
      items: formattedItems,
      summary: summaryText || 'تم إتمام الفحص الفني الشامل لكافة الأنظمة الميكانيكية والكهربائية.',
      exportedToEstimate: false,
    });

    setSelectedInspection(newInsp);
    setIsCreating(false);
  };

  const handleExportToEstimate = (inspId: string) => {
    convertInspectionToEstimate(inspId);
    setActiveTab('estimates');
  };

  const handleExportCSV = () => {
    exportToCSV(
      state.inspections.map((insp) => {
        const order = state.serviceOrders.find((o) => o.id === insp.serviceOrderId);
        const vehicle = state.vehicles.find((v) => v.id === insp.vehicleId);
        return {
          'رقم تقرير الفحص': insp.inspectionNumber,
          'رقم أمر الشغل': order?.orderNumber || '-',
          'السيارة': vehicle ? `${vehicle.make} ${vehicle.model}` : '-',
          'رقم اللوحة': vehicle?.plateNumber || '-',
          'مهندس الفحص': insp.inspectorName,
          'التاريخ': insp.date,
          'درجة الحالة العامة (من 100)': insp.overallScore,
          'الملاحظات الفنية': insp.summary,
        };
      }),
      `تقارير_الفحص_الفني_مركز_صيانة_التجمع_الخامس_${new Date().toISOString().substring(0, 10)}`
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Title */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <ClipboardCheck className="w-6 h-6 text-blue-500" />
            <span>الفحص والتشخيص الفني (24 نقطة)</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            فحص شامل لأنظمة السيارة: الفرامل، العفشة، المحرك والكهرباء مع تحويل مباشر لعروض الأسعار
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>تصدير إكسيل</span>
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ بدء فحص فني جديد</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left List (4 Cols), Right Detail (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inspection Reports List */}
        <div className={`lg:col-span-4 border rounded-2xl p-4 space-y-3 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <h3 className={`font-bold text-xs uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            تقارير الفحص الفني المنجزة ({state.inspections.length})
          </h3>

          <div className="space-y-2">
            {state.inspections.map((insp) => {
              const order = state.serviceOrders.find((o) => o.id === insp.serviceOrderId);
              const vehicle = state.vehicles.find((v) => v.id === insp.vehicleId);
              const isSelected = selectedInspection?.id === insp.id;
              const criticalItems = insp.items.filter((i) => i.condition === 'critical').length;

              return (
                <div
                  key={insp.id}
                  onClick={() => {
                    setSelectedInspection(insp);
                    setIsCreating(false);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs space-y-2 ${
                    isSelected
                      ? 'bg-blue-500/10 border-blue-500 text-blue-500 font-bold'
                      : isDark
                      ? 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-500">{insp.inspectionNumber}</span>
                    <span className="text-[11px] font-bold tabular-nums">
                      التقييم: {insp.overallScore}/100
                    </span>
                  </div>
                  <div>
                    <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {vehicle?.make} {vehicle?.model}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      اللوحة: {vehicle?.plateNumber} · كارت: {order?.orderNumber}
                    </div>
                  </div>
                  <div className={`flex items-center justify-between text-[11px] pt-1.5 border-t ${
                    isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                  }`}>
                    <span>{insp.inspectorName}</span>
                    {criticalItems > 0 && (
                      <span className="text-rose-500 font-bold">
                        {criticalItems} ملاحظات حرجة
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-8">
          {isCreating ? (
            /* Create Inspection Form */
            <form onSubmit={handleCreateSubmit} className={`border rounded-2xl p-5 md:p-6 space-y-5 ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  نموذج فحص وتشخيص فني جديد
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  إلغاء
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold">اختر أمر الصيانة النشط *</label>
                  <select
                    required
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="">اختر أمر الشغل...</option>
                    {state.serviceOrders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} - {state.vehicles.find((v) => v.id === o.vehicleId)?.make} (
                        {state.vehicles.find((v) => v.id === o.vehicleId)?.plateNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold">المهندس الفاحص المسئول</label>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Checklist items table */}
              <div className="space-y-3 pt-2">
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider">
                  قائمة بنود الفحص الميكانيكي والكهربائي
                </label>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {checklistItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                        isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] text-blue-500 font-bold">{item.system}</span>
                          <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.component}</div>
                        </div>

                        {/* Condition selector buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleItemConditionChange(idx, 'good')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              item.condition === 'good'
                                ? 'bg-emerald-600 text-white'
                                : isDark
                                ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                            }`}
                          >
                            سليم تماماً
                          </button>
                          <button
                            type="button"
                            onClick={() => handleItemConditionChange(idx, 'attention')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              item.condition === 'attention'
                                ? 'bg-amber-600 text-white'
                                : isDark
                                ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                            }`}
                          >
                            بحاجة لملاحظة
                          </button>
                          <button
                            type="button"
                            onClick={() => handleItemConditionChange(idx, 'critical')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              item.condition === 'critical'
                                ? 'bg-rose-600 text-white'
                                : isDark
                                ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                            }`}
                          >
                            تالف / حرج
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => handleItemNotesChange(idx, e.target.value)}
                        placeholder="ملاحظات المهندس الفاحص..."
                        className={`w-full p-2.5 rounded-lg border text-xs ${
                          isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="text-xs space-y-1">
                <label className="block text-slate-400 font-bold">الخلاصة والتوصيات الفنية</label>
                <textarea
                  rows={2}
                  value={summaryText}
                  onChange={(e) => setSummaryText(e.target.value)}
                  placeholder="ملخص تقرير الفحص والقطع الموصى بتغييرها..."
                  className={`w-full p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className={`flex justify-end gap-3 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-blue-600/30"
                >
                  حفظ واعتماد التقرير
                </button>
              </div>
            </form>
          ) : selectedInspection ? (
            /* View Inspection Details */
            <div className={`border rounded-2xl p-5 md:p-6 space-y-6 ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              {/* Header */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-lg font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedInspection.inspectionNumber}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      تقييم الحالة: {selectedInspection.overallScore}/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    فحص بواسطة {selectedInspection.inspectorName} في {selectedInspection.date}
                  </p>
                </div>

                {/* Export to Estimate Button */}
                <button
                  onClick={() => handleExportToEstimate(selectedInspection.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-blue-600/30"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>تصدير النتائج لعرض سعر (مقايسة)</span>
                </button>
              </div>

              {/* Summary note */}
              <div className={`p-4 rounded-xl border text-xs space-y-1 ${
                isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="font-bold text-slate-400">ملخص النتائج الفنية:</div>
                <p className={`leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{selectedInspection.summary}</p>
              </div>

              {/* Items Table */}
              <div className={`border rounded-xl overflow-hidden ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <table className="w-full text-xs text-start border-collapse">
                  <thead className={`border-b text-[11px] font-bold ${
                    isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    <tr>
                      <th className="py-2.5 px-3 text-start">النظام والقطعة</th>
                      <th className="py-2.5 px-3 text-center">حالة الفحص</th>
                      <th className="py-2.5 px-3 text-start">ملاحظات المهندس</th>
                      <th className="py-2.5 px-3 text-start">الإجراء المقترح</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                    {selectedInspection.items.map((item) => (
                      <tr key={item.id} className={isDark ? 'hover:bg-slate-950/40' : 'hover:bg-slate-50'}>
                        <td className="py-2.5 px-3">
                          <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.component}</div>
                          <div className="text-[10px] text-slate-500">{item.system}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {item.condition === 'critical' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30">
                              <AlertCircle className="w-3 h-3" /> حرج وتالف
                            </span>
                          ) : item.condition === 'attention' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                              <AlertTriangle className="w-3 h-3" /> يحتاج ملاحظة
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> سليم تماماً
                            </span>
                          )}
                        </td>
                        <td className={`py-2.5 px-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.notes}</td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {item.recommendedAction || 'لا يلزم إجراء'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-slate-500">
              اختر تقرير فحص من القائمة للاطلاع على النتائج
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
