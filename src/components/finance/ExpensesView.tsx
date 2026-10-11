import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense } from '../../types';
import {
  TrendingDown,
  Search,
  Plus,
  Calendar,
  DollarSign,
  X,
  CreditCard,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { state, recordExpense, deleteExpense, theme, t } = useApp();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // Form states
  const [category, setCategory] = useState<any>('workshop_consumables');
  const [amount, setAmount] = useState<number>(3500);
  const [description, setDescription] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [accountId, setAccountId] = useState(state.cashAccounts[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const isDark = theme === 'dark';

  const filteredExpenses = state.expenses.filter((exp) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      exp.expenseNumber.toLowerCase().includes(q) ||
      exp.description.toLowerCase().includes(q) ||
      exp.paidTo.toLowerCase().includes(q) ||
      exp.category.toLowerCase().includes(q)
    );
  });

  const totalExpenses = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0 || !paidTo) return;

    recordExpense({
      category,
      amount: Number(amount),
      date: new Date().toISOString().substring(0, 10),
      paymentMethod,
      accountId,
      description,
      paidTo,
      createdBy: state.currentUser.name,
    });

    setIsModalOpen(false);
    setDescription('');
    setPaidTo('');
  };

  const CATEGORY_NAMES_AR: Record<string, string> = {
    rent: 'إيجار المقر والمنشأة',
    utilities: 'الكهرباء الصناعية والمرافق',
    tools_equipment: 'أجهزة فحص وصيانة معدات',
    workshop_consumables: 'مستهلكات الورشة (زيوت، شحوم، مذيبات)',
    salaries: 'رواتب ومكافآت',
    maintenance: 'صيانة الروافع والكمبروسر',
    other: 'مصروفات تشغيلية عامة',
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Title */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <TrendingDown className="w-6 h-6 text-rose-500" />
            <span>المصروفات وأذونات الصرف</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            المصروفات التشغيلية للمركز: الإيجار، الكهرباء الصناعية، أدوات الورشة والمستهلكات
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-end hidden sm:block">
            <span className="text-slate-400 text-xs block">إجمالي المصروفات المنصرفة:</span>
            <span className="text-xl font-extrabold text-rose-500 tabular-nums font-mono">
              {totalExpenses.toLocaleString()} {t.currencySymbol}
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل إذن صرف جديد</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث برقم الإذن، البيان، أو الجهة المصروف لها..."
          className={`w-full ps-9 pe-3 py-2.5 rounded-xl border text-xs ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-rose-500'
              : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-rose-500 shadow-xs'
          }`}
        />
      </div>

      {/* Table */}
      <div className={`border rounded-2xl overflow-hidden shadow-lg ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'border-slate-800 bg-slate-950/70 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}>
                <th className="py-3 px-4 text-start">رقم الإذن</th>
                <th className="py-3 px-4 text-start">التاريخ</th>
                <th className="py-3 px-4 text-start">التصنيف</th>
                <th className="py-3 px-4 text-start">البيان / الوصف</th>
                <th className="py-3 px-4 text-start">صرف إلى</th>
                <th className="py-3 px-4 text-start">الخزينة المخصوم منها</th>
                <th className="py-3 px-4 text-end">المبلغ المنصرف</th>
                <th className="py-3 px-4 text-start">المعتمد</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    لا توجد مصروفات مسجلة مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                    <td className="py-3 px-4 font-mono font-bold text-rose-500">{exp.expenseNumber}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{exp.date}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {CATEGORY_NAMES_AR[exp.category] || exp.category}
                      </span>
                    </td>
                    <td className={`py-3 px-4 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{exp.description}</td>
                    <td className="py-3 px-4 text-slate-300 font-semibold">{exp.paidTo}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {state.cashAccounts.find((a) => a.id === exp.accountId)?.name || 'الخزينة الرئيسية'}
                    </td>
                    <td className="py-3 px-4 text-end font-bold text-rose-500 font-mono tabular-nums">
                      {exp.amount.toLocaleString()} {t.currencySymbol}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{exp.createdBy}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setExpenseToDelete(exp)}
                        title="حذف إذن الصرف"
                        className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4" dir="rtl">
          <form
            onSubmit={handleSubmit}
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 text-xs ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className="font-bold text-base">تسجيل إذن صرف تشغيلي</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">بند المصروف *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className={`w-full p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="rent">إيجار المقر والمنشأة</option>
                <option value="utilities">الكهرباء الصناعية والمرافق</option>
                <option value="tools_equipment">أجهزة فحص وصيانة معدات</option>
                <option value="workshop_consumables">مستهلكات الورشة (زيوت، شحوم، مذيبات)</option>
                <option value="salaries">رواتب ومكافآت</option>
                <option value="maintenance">صيانة الروافع والكمبروسر</option>
                <option value="other">مصروفات تشغيلية عامة</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">المبلغ ({t.currencySymbol}) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className={`w-full p-2.5 rounded-xl border font-mono font-bold ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الخصم من خزينة *</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  {state.cashAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currentBalance.toLocaleString()} {a.currency})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">الجهة المصروف لها / اسم المستفيد *</label>
              <input
                type="text"
                required
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                placeholder="مثال: شركة الكهرباء / شركة سناب أون للمعدات"
                className={`w-full p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">بيان المصروف والسبب *</label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="الغرض التشغيلي التفصيلي للإذن..."
                className={`w-full p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div className={`flex justify-end gap-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold shadow-md cursor-pointer"
              >
                اعتماد وصرف المبلغ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4" dir="rtl">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base">تأكيد حذف إذن الصرف</h3>
              <p className="text-xs text-slate-400">
                هل أنت متأكد من حذف إذن الصرف رقم{' '}
                <span className="font-bold text-white font-mono">
                  "{expenseToDelete.expenseNumber}"
                </span>{' '}
                بمبلغ ({expenseToDelete.amount.toLocaleString()} {t.currencySymbol})؟
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteExpense(expenseToDelete.id);
                  setExpenseToDelete(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all cursor-pointer"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
