import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wallet,
  Building2,
  Coins,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  User,
} from 'lucide-react';

export const CashManagementView: React.FC = () => {
  const { state, language, t } = useApp();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');

  const filteredMovements = state.cashMovements.filter((m) => {
    if (selectedAccountId !== 'all' && m.accountId !== selectedAccountId) return false;
    return true;
  });

  const totalLiquidity = state.cashAccounts.reduce((sum, a) => sum + a.currentBalance, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-blue-500" />
            {t.tabCashManagement}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {language === 'ar'
              ? 'إدارة الخزائن النقدية، الحساب البنكي التشغيلي، العهدة وحركة التدفقات النقدية'
              : 'Cash registers, bank operating accounts, petty cash drawers, and cash ledger audit trails.'}
          </p>
        </div>

        <div className="text-end">
          <span className="text-slate-400 text-xs block">Total Liquid Reserves:</span>
          <span className="text-xl font-extrabold text-emerald-400 tabular-nums">
            {totalLiquidity.toLocaleString()} {t.currencySymbol}
          </span>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {state.cashAccounts.map((acc) => (
          <div
            key={acc.id}
            onClick={() => setSelectedAccountId(selectedAccountId === acc.id ? 'all' : acc.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedAccountId === acc.id
                ? 'bg-blue-950/40 border-blue-600 shadow-md'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-white">
                {language === 'ar' ? acc.nameAr : acc.name}
              </span>
              {acc.accountType === 'bank_account' ? (
                <Building2 className="w-4 h-4 text-blue-400" />
              ) : acc.accountType === 'petty_cash' ? (
                <Coins className="w-4 h-4 text-amber-400" />
              ) : (
                <Wallet className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">
              {acc.currentBalance.toLocaleString()}{' '}
              <span className="text-xs text-slate-400">{acc.currency}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {acc.accountType === 'bank_account' ? 'Commercial International Bank (CIB)' : 'On-premise physical safe'}
            </div>
          </div>
        ))}
      </div>

      {/* Cash Movements Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Cash Movement Journal Ledger ({filteredMovements.length})
          </h3>
          {selectedAccountId !== 'all' && (
            <button
              onClick={() => setSelectedAccountId('all')}
              className="text-xs text-blue-400 hover:underline"
            >
              Clear filter (Show All)
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 text-start">Timestamp</th>
                <th className="py-3 px-4 text-start">Account / Safe</th>
                <th className="py-3 px-4 text-center">Flow Direction</th>
                <th className="py-3 px-4 text-end">Amount (EGP)</th>
                <th className="py-3 px-4 text-end">Balance After</th>
                <th className="py-3 px-4 text-start">Category & Description</th>
                <th className="py-3 px-4 text-start">Staff Member</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    {t.noData}
                  </td>
                </tr>
              ) : (
                filteredMovements.map((cm) => (
                  <tr key={cm.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">{cm.date}</td>
                    <td className="py-3 px-4 font-medium text-white">{cm.accountName}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          cm.type === 'inflow'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {cm.type === 'inflow' ? (
                          <>
                            <ArrowDownRight className="w-3 h-3" /> Inflow
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3 h-3" /> Outflow
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-end font-bold tabular-nums">
                      <span className={cm.type === 'inflow' ? 'text-emerald-400' : 'text-rose-400'}>
                        {cm.type === 'inflow' ? `+${cm.amount.toLocaleString()}` : `-${cm.amount.toLocaleString()}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-end font-mono text-slate-300 tabular-nums">
                      {cm.balanceAfter.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{cm.category}</div>
                      <div className="text-[11px] text-slate-400">{cm.description}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{cm.performedBy}</td>
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
