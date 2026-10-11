import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Payment } from '../../types';
import {
  CreditCard,
  Search,
  Printer,
  Calendar,
  User,
  Receipt,
} from 'lucide-react';

export const PaymentsView: React.FC = () => {
  const { state, printDocument, language, t } = useApp();
  const [search, setSearch] = useState('');

  const filteredPayments = state.payments.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.paymentNumber.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      p.invoiceNumber.toLowerCase().includes(q) ||
      p.receiptNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-500" />
            {t.tabPayments}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {language === 'ar'
              ? 'سندات القبض والتحصيل المسجلة، قنوات الدفع (كاش، فيزا، انستاباي، تحويل بنكي)'
              : 'Payment receipts register, collection methods, and cash vouchers.'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by receipt #, customer, or invoice #..."
          className="w-full ps-9 pe-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 text-start">Receipt #</th>
                <th className="py-3 px-4 text-start">Date & Time</th>
                <th className="py-3 px-4 text-start">Customer Name</th>
                <th className="py-3 px-4 text-start">Invoice #</th>
                <th className="py-3 px-4 text-start">Channel / Method</th>
                <th className="py-3 px-4 text-end">Amount Paid</th>
                <th className="py-3 px-4 text-start">Cashier / Staff</th>
                <th className="py-3 px-4 text-center">Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    {t.noData}
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">{pay.paymentNumber}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">{pay.date}</td>
                    <td className="py-3 px-4 font-semibold text-white">{pay.customerName}</td>
                    <td className="py-3 px-4 font-mono text-blue-400">{pay.invoiceNumber}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-800 text-slate-300">
                        {pay.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-end font-bold text-emerald-400 tabular-nums">
                      {pay.amount.toLocaleString()} EGP
                    </td>
                    <td className="py-3 px-4 text-slate-400">{pay.receivedBy}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() =>
                          printDocument('invoice', {
                            invoiceNumber: pay.paymentNumber,
                            customerName: pay.customerName,
                            issueDate: pay.date,
                            totalAmount: pay.amount,
                            paidAmount: pay.amount,
                            balanceDue: 0,
                            items: [
                              {
                                description: `Receipt Voucher for ${pay.invoiceNumber}`,
                                type: 'Payment',
                                quantity: 1,
                                unitPrice: pay.amount,
                                total: pay.amount,
                              },
                            ],
                          })
                        }
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
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
