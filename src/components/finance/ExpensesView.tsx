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
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { state, recordExpense, language, t } = useApp();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [category, setCategory] = useState<any>('workshop_consumables');
  const [amount, setAmount] = useState<number>(3500);
  const [description, setDescription] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [accountId, setAccountId] = useState(state.cashAccounts[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

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

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-rose-500" />
            {t.expensesTitle}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {language === 'ar'
              ? 'المصروفات التشغيلية للمركز: الإيجار، الكهرباء الصناعية، أدوات الورشة والمستهلكات'
              : 'Workshop operational overhead, equipment maintenance, facility utilities and supplier expenses.'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-end hidden sm:block">
            <span className="text-slate-400 text-xs block">Total Disbursed:</span>
            <span className="text-xl font-extrabold text-rose-400 tabular-nums">
              {totalExpenses.toLocaleString()} {t.currencySymbol}
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addExpense}</span>
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
          placeholder="Search by expense #, description, or payee..."
          className="w-full ps-9 pe-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-rose-500"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 text-start">Expense #</th>
                <th className="py-3 px-4 text-start">Date</th>
                <th className="py-3 px-4 text-start">Category</th>
                <th className="py-3 px-4 text-start">Description</th>
                <th className="py-3 px-4 text-start">Paid To</th>
                <th className="py-3 px-4 text-start">Charged Account</th>
                <th className="py-3 px-4 text-end">Amount (EGP)</th>
                <th className="py-3 px-4 text-start">Authorized By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    {t.noData}
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-rose-400">{exp.expenseNumber}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{exp.date}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-800 text-slate-300">
                        {exp.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-white">{exp.description}</td>
                    <td className="py-3 px-4 text-slate-300">{exp.paidTo}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {state.cashAccounts.find((a) => a.id === exp.accountId)?.name}
                    </td>
                    <td className="py-3 px-4 text-end font-bold text-rose-400 tabular-nums">
                      {exp.amount.toLocaleString()} EGP
                    </td>
                    <td className="py-3 px-4 text-slate-400">{exp.createdBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Record Operational Expense</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Expense Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
              >
                <option value="rent">Facility Rent</option>
                <option value="utilities">Industrial Utilities & Electricity</option>
                <option value="tools_equipment">Diagnostic Tools & Software Subscriptions</option>
                <option value="workshop_consumables">Workshop Consumables (Grease, Solvents, Gloves)</option>
                <option value="salaries">Payroll & Bonuses</option>
                <option value="maintenance">Hydraulic Lift & Compressor Maintenance</option>
                <option value="other">General Operational Overhead</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Amount (EGP) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Paid From Account *</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
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
              <label className="block text-slate-400 mb-1">Paid To / Vendor Name *</label>
              <input
                type="text"
                required
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                placeholder="e.g. Snap-on Tools Middle East / Wurth Egypt"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Expense Description *</label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specific operational purpose..."
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold"
              >
                Record & Deduct Cash
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
