import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';
import {
  Receipt,
  Search,
  Printer,
  CreditCard,
  FileSpreadsheet,
  X,
  CheckCircle2,
} from 'lucide-react';

export const InvoicesView: React.FC = () => {
  const { state, recordPayment, printDocument, theme, t } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'partially_paid' | 'paid'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Payment modal state
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'cash' | 'credit_card' | 'bank_transfer' | 'instapay_vodafone'>('cash');
  const [payNotes, setPayNotes] = useState('');

  const isDark = theme === 'dark';

  const filteredInvoices = state.invoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.customerName.toLowerCase().includes(q) ||
      (inv.vehiclePlate && inv.vehiclePlate.toLowerCase().includes(q))
    );
  });

  const openPaymentModal = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPayAmount(inv.balanceDue);
    setPayMethod('cash');
    setPayNotes(`سداد دفعة للفاتورة ${inv.invoiceNumber}`);
    setIsPayModalOpen(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || payAmount <= 0) return;

    recordPayment(selectedInvoice.id, Number(payAmount), payMethod, payNotes);
    setIsPayModalOpen(false);
  };

  const handleExportCSV = () => {
    exportToCSV(
      filteredInvoices.map((inv) => ({
        'رقم الفاتورة': inv.invoiceNumber,
        'اسم العميل': inv.customerName,
        'بيانات المركبة': inv.vehicleInfo || inv.vehiclePlate || '-',
        'تاريخ الإصدار': inv.issueDate,
        'إجمالي الفاتورة (ج.م)': inv.totalAmount,
        'المحصل (ج.م)': inv.paidAmount,
        'المتبقي المستحق (ج.م)': inv.balanceDue,
        'حالة السداد':
          inv.status === 'paid'
            ? 'مسددة بالكامل'
            : inv.status === 'partially_paid'
            ? 'مسددة جزئياً'
            : 'غير مسددة',
      })),
      `فواتير_مركز_صيانة_التجمع_الخامس_${new Date().toISOString().substring(0, 10)}`
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Title */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Receipt className="w-6 h-6 text-emerald-500" />
            <span>الفواتير الضريبية وحسابات العملاء</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            إدارة الفواتير المعتمدة لمركز صيانة التجمع الخامس، ضريبة القيمة المضافة 14%، وسندات التحصيل
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export to Excel */}
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

          {/* Filter tabs */}
          <div className={`flex items-center gap-1 p-1 rounded-xl border text-xs ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            {[
              { id: 'all', label: 'الكل' },
              { id: 'unpaid', label: 'غير مسددة' },
              { id: 'partially_paid', label: 'سداد جزئي' },
              { id: 'paid', label: 'مسددة' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-emerald-600 text-white shadow-xs'
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

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث برقم الفاتورة، اسم العميل، أو رقم اللوحة..."
          className={`w-full ps-10 pe-4 py-2.5 rounded-xl border text-xs ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-emerald-500'
              : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 shadow-xs'
          }`}
        />
      </div>

      {/* Invoices Table */}
      <div className={`border rounded-2xl overflow-hidden shadow-lg ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'border-slate-800 bg-slate-950/70 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}>
                <th className="py-3.5 px-4 text-start">رقم الفاتورة</th>
                <th className="py-3.5 px-4 text-start">العميل والسيارة</th>
                <th className="py-3.5 px-4 text-start">تاريخ التحرير</th>
                <th className="py-3.5 px-4 text-end">إجمالي الفاتورة</th>
                <th className="py-3.5 px-4 text-end">المحصل الفعلي</th>
                <th className="py-3.5 px-4 text-end">المتبقي المطلوب</th>
                <th className="py-3.5 px-4 text-center">حالة السداد</th>
                <th className="py-3.5 px-4 text-center">الإجراءات والطباعة</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    لا توجد فواتير مطابقة للبحث أو التصفية
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-500">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{inv.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{inv.vehiclePlate || 'مركبة معتمدة'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">{inv.issueDate}</td>
                    <td className={`py-3.5 px-4 text-end font-bold tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {inv.totalAmount.toLocaleString()} {t.currencySymbol}
                    </td>
                    <td className="py-3.5 px-4 text-end text-emerald-500 tabular-nums font-bold">
                      {inv.paidAmount.toLocaleString()} {t.currencySymbol}
                    </td>
                    <td className="py-3.5 px-4 text-end tabular-nums">
                      {inv.balanceDue > 0 ? (
                        <span className="font-bold text-rose-500">{inv.balanceDue.toLocaleString()} {t.currencySymbol}</span>
                      ) : (
                        <span className="text-emerald-500 font-semibold">0 {t.currencySymbol}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          inv.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                            : inv.status === 'partially_paid'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                        }`}
                      >
                        {inv.status === 'paid'
                          ? 'مسددة بالكامل'
                          : inv.status === 'partially_paid'
                          ? 'مسددة جزئياً'
                          : 'غير مسددة'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => printDocument('invoice', inv)}
                          title="طباعة الفاتورة الضريبية"
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <Printer className="w-4 h-4 text-blue-500" />
                        </button>

                        {inv.balanceDue > 0 && (
                          <button
                            onClick={() => openPaymentModal(inv)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>تحصيل</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isPayModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4" dir="rtl">
          <form
            onSubmit={handlePaymentSubmit}
            className={`w-full max-w-md border rounded-2xl p-6 shadow-2xl space-y-4 text-xs ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" />
                <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  تسجيل وسداد دفعة فاتورة
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`p-3.5 rounded-xl border space-y-1.5 ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between">
                <span className="text-slate-400">رقم الفاتورة:</span>
                <span className="font-mono text-emerald-500 font-bold">{selectedInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">العميل:</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedInvoice.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">المبلغ المتبقي:</span>
                <span className="text-rose-500 font-mono font-bold">
                  {selectedInvoice.balanceDue.toLocaleString()} {t.currencySymbol}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-400 font-bold">مبلغ الدفعة المحصلة ({t.currencySymbol}) *</label>
              <input
                type="number"
                required
                min={1}
                max={selectedInvoice.balanceDue}
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className={`w-full p-2.5 rounded-xl border font-mono font-bold text-base tabular-nums ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-400 font-bold">طريقة وقناة التحصيل *</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as any)}
                className={`w-full p-2.5 rounded-xl border text-xs ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="cash">خزينة الاستقبال النقدية (كاش)</option>
                <option value="credit_card">ماكينة الدفع الإلكتروني (فيزا / ماستركارد)</option>
                <option value="bank_transfer">تحويل بنكي مباشر (حساب المركز)</option>
                <option value="instapay_vodafone">انستاباي / محفظة إلكترونية (InstaPay)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-400 font-bold">ملاحظات التحصيل أو الرقم المرجعي</label>
              <input
                type="text"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="مثال: رقم مرجع تحويل انستاباي #90281"
                className={`w-full p-2.5 rounded-xl border text-xs ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className={`flex justify-end gap-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-600/30"
              >
                تأكيد التحصيل وإصدار الإيصال
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
