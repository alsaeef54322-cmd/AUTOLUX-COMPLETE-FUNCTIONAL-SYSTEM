import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeftRight, Search, Filter } from 'lucide-react';

export const StockMovementsView: React.FC = () => {
  const { state, language, t } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'receipt' | 'issue' | 'adjustment'>('all');

  const filteredMovements = state.stockMovements.filter((m) => {
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.partName.toLowerCase().includes(q) ||
      m.partSku.toLowerCase().includes(q) ||
      m.referenceId.toLowerCase().includes(q) ||
      m.notes.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-blue-500" />
            {t.tabStockMovements}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {language === 'ar'
              ? 'سجل حركة الأرصدة والمخزون: التوريدات، الصرف لكروت الشغل والتسويات الجردية'
              : 'Complete immutable inventory audit trail of purchase receipts, job card issuances & physical adjustments.'}
          </p>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          {(['all', 'receipt', 'issue', 'adjustment'] as const).map((tp) => (
            <button
              key={tp}
              onClick={() => setTypeFilter(tp)}
              className={`px-3 py-1 rounded-md font-medium transition-colors uppercase ${
                typeFilter === tp ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tp}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by part, SKU or reference #..."
          className="w-full ps-9 pe-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-hidden"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 text-start">Date & Time</th>
                <th className="py-3 px-4 text-start">Part SKU & Name</th>
                <th className="py-3 px-4 text-center">Movement Type</th>
                <th className="py-3 px-4 text-end">Previous</th>
                <th className="py-3 px-4 text-center">Quantity Delta</th>
                <th className="py-3 px-4 text-end">New Balance</th>
                <th className="py-3 px-4 text-start">Reference & Notes</th>
                <th className="py-3 px-4 text-start">Logged By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    {t.noData}
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">{m.createdAt}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{m.partName}</div>
                      <div className="text-[11px] text-amber-400 font-mono">{m.partSku}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          m.type === 'receipt'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : m.type === 'issue'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : 'bg-purple-950 text-purple-300 border border-purple-800'
                        }`}
                      >
                        {m.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-end font-mono text-slate-400 tabular-nums">
                      {m.previousStock}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold tabular-nums">
                      <span className={m.quantity > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-end font-mono font-bold text-white tabular-nums">
                      {m.newStock}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{m.referenceId}</div>
                      <div className="text-[11px] text-slate-400">{m.notes}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{m.createdBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
