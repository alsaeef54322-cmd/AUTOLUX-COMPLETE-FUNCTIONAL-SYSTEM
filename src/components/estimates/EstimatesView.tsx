import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Estimate } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';
import {
  Calculator,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Receipt,
  Printer,
} from 'lucide-react';

export const EstimatesView: React.FC = () => {
  const { state, approveEstimate, convertEstimateToInvoice, setActiveTab, printDocument, theme, t } = useApp();

  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(
    state.estimates[0] || null
  );
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'approved' | 'rejected'>('all');
  const isDark = theme === 'dark';

  const filteredEstimates = state.estimates.filter((est) => {
    if (filter !== 'all' && est.status !== filter) return false;
    return true;
  });

  const handleApprove = (estId: string) => {
    approveEstimate(estId);
    const updated = state.estimates.find((e) => e.id === estId);
    if (updated) setSelectedEstimate({ ...updated, status: 'approved' });
  };

  const handleConvertToInvoice = (estId: string) => {
    convertEstimateToInvoice(estId);
    setActiveTab('invoices');
  };

  const handleExportCSV = () => {
    exportToCSV(
      filteredEstimates.map((est) => {
        const customer = state.customers.find((c) => c.id === est.customerId);
        const vehicle = state.vehicles.find((v) => v.id === est.vehicleId);
        return {
          'رقم المقايسة': est.estimateNumber,
          'اسم العميل': customer?.nameAr || customer?.name || '-',
          'السيارة': vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : '-',
          'رقم اللوحة': vehicle?.plateNumber || '-',
          'المجموع الفرعي (ج.م)': est.subtotal,
          'ضريبة القيمة المضافة': est.taxAmount,
          'الإجمالي النهائي (ج.م)': est.total,
          'الحالة': est.status === 'approved' ? 'معتمد' : est.status === 'sent' ? 'مرسل للعميل' : 'مسودة',
          'سارية حتى': est.validUntil,
        };
      }),
      `عروض_أسعار_مركز_صيانة_التجمع_الخامس_${new Date().toISOString().substring(0, 10)}`
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Title */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Calculator className="w-6 h-6 text-purple-500" />
            <span>عروض الأسعار والمقايسات الفنية</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            إعداد مقايسات الصيانة، تسجيل موافقات العملاء والتحويل التلقائي للفواتير الضريبية
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

          {/* Filter buttons */}
          <div className={`flex items-center gap-1 p-1 rounded-xl border text-xs ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            {[
              { id: 'all', label: 'الكل' },
              { id: 'sent', label: 'بانتظار الموافقة' },
              { id: 'approved', label: 'معتمدة' },
              { id: 'draft', label: 'مسودة' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilter(st.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  filter === st.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Estimates List (4 cols) */}
        <div className={`lg:col-span-4 border rounded-2xl p-4 space-y-3 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <h3 className={`font-bold text-xs uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            المقايسات المسجلة بالمركز ({filteredEstimates.length})
          </h3>

          <div className="space-y-2">
            {filteredEstimates.map((est) => {
              const customer = state.customers.find((c) => c.id === est.customerId);
              const vehicle = state.vehicles.find((v) => v.id === est.vehicleId);
              const isSelected = selectedEstimate?.id === est.id;

              return (
                <div
                  key={est.id}
                  onClick={() => setSelectedEstimate(est)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs space-y-2 ${
                    isSelected
                      ? 'bg-purple-500/10 border-purple-500 text-purple-500 font-bold'
                      : isDark
                      ? 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-purple-500">{est.estimateNumber}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                        est.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                          : est.status === 'sent'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                          : 'bg-slate-500/10 text-slate-400'
                      }`}
                    >
                      {est.status === 'approved' ? 'معتمد' : est.status === 'sent' ? 'مرسل للعميل' : 'مسودة'}
                    </span>
                  </div>

                  <div>
                    <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{customer?.nameAr || customer?.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {vehicle?.make} {vehicle?.model} ({vehicle?.plateNumber})
                    </div>
                  </div>

                  <div className={`flex items-center justify-between text-[11px] pt-1.5 border-t ${
                    isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                  }`}>
                    <span>صالحة حتى: {est.validUntil}</span>
                    <span className={`font-bold tabular-nums font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {est.total.toLocaleString()} {t.currencySymbol}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Estimate Detail Pane (8 cols) */}
        <div className="lg:col-span-8">
          {selectedEstimate ? (
            <div className={`border rounded-2xl p-5 md:p-6 space-y-6 ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              {/* Header */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className={`font-bold text-lg font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedEstimate.estimateNumber}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                        selectedEstimate.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                      }`}
                    >
                      {selectedEstimate.status === 'approved' ? 'معتمد وموافق عليه' : 'بانتظار اعتماد العميل'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    تاريخ التحرير: {selectedEstimate.createdAt} · سارية حتى: {selectedEstimate.validUntil}
                  </p>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-2">
                  {selectedEstimate.status !== 'approved' && (
                    <button
                      onClick={() => handleApprove(selectedEstimate.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-600/30"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>اعتماد موافقة العميل</span>
                    </button>
                  )}

                  {selectedEstimate.status === 'approved' && !selectedEstimate.convertedToInvoiceId && (
                    <button
                      onClick={() => handleConvertToInvoice(selectedEstimate.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-600/30"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>تحويل لفاتورة ضريبية</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="space-y-4">
                <div className={`border rounded-xl overflow-hidden ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <table className="w-full text-xs text-start border-collapse">
                    <thead className={`border-b text-[11px] font-bold ${
                      isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      <tr>
                        <th className="py-2.5 px-3 text-start">بيان المصنعية أو قطعة الغيار</th>
                        <th className="py-2.5 px-3 text-center">الكمية / الساعات</th>
                        <th className="py-2.5 px-3 text-end">سعر الوحدة</th>
                        <th className="py-2.5 px-3 text-end">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                      {/* Labor rows */}
                      {selectedEstimate.laborItems.map((l) => (
                        <tr key={l.id} className={isDark ? 'hover:bg-slate-950/40' : 'hover:bg-slate-50'}>
                          <td className="py-2.5 px-3">
                            <span className="text-[10px] font-bold text-blue-500 me-2 px-1.5 py-0.5 rounded bg-blue-500/10">مصنعية</span>
                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{l.description}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center tabular-nums text-slate-400 font-mono">{l.hours} س</td>
                          <td className="py-2.5 px-3 text-end tabular-nums text-slate-400 font-mono">{l.hourlyRate}</td>
                          <td className={`py-2.5 px-3 text-end font-bold tabular-nums font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {l.total.toLocaleString()} {t.currencySymbol}
                          </td>
                        </tr>
                      ))}

                      {/* Parts rows */}
                      {selectedEstimate.partsItems.map((p) => (
                        <tr key={p.id} className={isDark ? 'hover:bg-slate-950/40' : 'hover:bg-slate-50'}>
                          <td className="py-2.5 px-3">
                            <span className="text-[10px] font-bold text-amber-500 me-2 px-1.5 py-0.5 rounded bg-amber-500/10">قطعة غيار</span>
                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.partName}</span>
                            <span className="text-[11px] text-slate-500 font-mono ms-2">({p.partSku})</span>
                          </td>
                          <td className="py-2.5 px-3 text-center tabular-nums text-slate-400 font-mono">{p.quantity}</td>
                          <td className="py-2.5 px-3 text-end tabular-nums text-slate-400 font-mono">
                            {p.unitPrice.toLocaleString()}
                          </td>
                          <td className={`py-2.5 px-3 text-end font-bold tabular-nums font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {p.total.toLocaleString()} {t.currencySymbol}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Totals */}
                <div className="flex justify-start">
                  <div className={`w-80 p-4 rounded-xl border space-y-2 text-xs ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex justify-between text-slate-400">
                      <span>المجموع الفرعي:</span>
                      <span className={`font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedEstimate.subtotal.toLocaleString()} {t.currencySymbol}</span>
                    </div>
                    {selectedEstimate.discount > 0 && (
                      <div className="flex justify-between text-emerald-500 font-bold">
                        <span>الخصم التجاري:</span>
                        <span className="font-mono">-{selectedEstimate.discount.toLocaleString()} {t.currencySymbol}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400">
                      <span>ضريبة القيمة المضافة ({selectedEstimate.taxRate}%):</span>
                      <span className={`font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedEstimate.taxAmount.toLocaleString()} {t.currencySymbol}</span>
                    </div>
                    <div className={`flex justify-between font-bold text-sm pt-2 border-t ${
                      isDark ? 'border-slate-800 text-white' : 'border-slate-300 text-slate-900'
                    }`}>
                      <span>الإجمالي النهائي للمقايسة:</span>
                      <span className="font-mono font-bold text-purple-500 text-base">
                        {selectedEstimate.total.toLocaleString()} {t.currencySymbol}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-slate-500">
              اختر عرض سعر من القائمة لمشاهدة التفاصيل
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
