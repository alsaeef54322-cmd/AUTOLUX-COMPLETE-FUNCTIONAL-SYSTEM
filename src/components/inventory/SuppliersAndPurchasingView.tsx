import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Supplier, PurchaseOrder } from '../../types';
import {
  Truck,
  ShoppingBag,
  Plus,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  X,
  PackageCheck,
} from 'lucide-react';

export const SuppliersAndPurchasingView: React.FC = () => {
  const { state, receivePurchaseOrder, createPurchaseOrder, language, t } = useApp();

  const [activeTabSub, setActiveTabSub] = useState<'orders' | 'suppliers'>('orders');
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);

  // New PO form state
  const [selectedSupplierId, setSelectedSupplierId] = useState(state.suppliers[0]?.id || '');
  const [poItems, setPoItems] = useState<{ partId: string; quantity: number }[]>([
    { partId: state.spareParts[0]?.id || '', quantity: 5 },
  ]);

  const handleReceiveStock = (poId: string) => {
    receivePurchaseOrder(poId);
  };

  const handleAddPoItem = () => {
    setPoItems([...poItems, { partId: state.spareParts[0]?.id || '', quantity: 5 }]);
  };

  const handleRemovePoItem = (index: number) => {
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const handlePoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = state.suppliers.find((s) => s.id === selectedSupplierId) || state.suppliers[0];

    const formattedItems = poItems.map((item) => {
      const part = state.spareParts.find((p) => p.id === item.partId) || state.spareParts[0];
      return {
        partId: part.id,
        partName: part.name,
        partSku: part.sku,
        quantity: Number(item.quantity),
        unitCost: part.costPrice,
        total: Number(item.quantity) * part.costPrice,
      };
    });

    const subtotal = formattedItems.reduce((sum, i) => sum + i.total, 0);
    const tax = (subtotal * state.settings.taxRate) / 100;
    const total = subtotal + tax;

    createPurchaseOrder({
      supplierId: sup.id,
      supplierName: sup.name,
      status: 'ordered',
      items: formattedItems,
      subtotal,
      tax,
      total,
      orderDate: new Date().toISOString().substring(0, 10),
      expectedDate: new Date(Date.now() + 5 * 86400000).toISOString().substring(0, 10),
      notes: 'Generated via AutoCare Pro procurement system',
    });

    setIsPoModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-500" />
            {language === 'ar' ? 'الموردون والمشتريات' : 'Suppliers & Procurement'}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {language === 'ar'
              ? 'أوامر التوريد والشراء، استلام البضائع وزيادة رصيد المخزن التلقائي وأرصدة الموردين'
              : 'Purchase orders, delivery receiving into stock, vendor balances & supplier terms.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub tab switcher */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTabSub('orders')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTabSub === 'orders' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Purchase Orders ({state.purchaseOrders.length})
            </button>
            <button
              onClick={() => setActiveTabSub('suppliers')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTabSub === 'suppliers' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Suppliers Directory ({state.suppliers.length})
            </button>
          </div>

          <button
            onClick={() => setIsPoModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Purchase Order</span>
          </button>
        </div>
      </div>

      {activeTabSub === 'orders' ? (
        /* Purchase Orders Table */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 text-start">PO Number</th>
                  <th className="py-3 px-4 text-start">Supplier Name</th>
                  <th className="py-3 px-4 text-start">Order Date</th>
                  <th className="py-3 px-4 text-center">Items Count</th>
                  <th className="py-3 px-4 text-end">Total Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {state.purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">{po.poNumber}</td>
                    <td className="py-3 px-4 font-medium text-white">{po.supplierName}</td>
                    <td className="py-3 px-4 text-slate-400">{po.orderDate}</td>
                    <td className="py-3 px-4 text-center tabular-nums text-slate-300">
                      {po.items.length} line(s)
                    </td>
                    <td className="py-3 px-4 text-end font-bold text-white tabular-nums">
                      {po.total.toLocaleString()} EGP
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          po.status === 'received'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {po.status === 'ordered' ? (
                        <button
                          onClick={() => handleReceiveStock(po.id)}
                          className="flex items-center gap-1 mx-auto px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Receive Stock</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Received on {po.receivedDate}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Suppliers Directory */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {state.suppliers.map((sup) => (
            <div
              key={sup.id}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-bold text-white text-sm">{sup.name}</h3>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                  {sup.paymentTerms}
                </span>
              </div>
              <div className="space-y-1.5 text-slate-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="font-mono text-slate-300">{sup.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{sup.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{sup.address}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Payable Balance:</span>
                <span className="font-bold text-amber-400 tabular-nums">
                  {sup.balance.toLocaleString()} EGP
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create PO Modal */}
      {isPoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handlePoSubmit}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Create Purchase Order</h3>
              <button
                type="button"
                onClick={() => setIsPoModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Select Supplier *</label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
              >
                {state.suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.paymentTerms})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-400 font-semibold uppercase text-[10px]">Order Items</label>
                <button
                  type="button"
                  onClick={handleAddPoItem}
                  className="text-blue-400 hover:underline text-xs"
                >
                  + Add Line
                </button>
              </div>

              {poItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <select
                    value={item.partId}
                    onChange={(e) => {
                      const updated = [...poItems];
                      updated[idx].partId = e.target.value;
                      setPoItems(updated);
                    }}
                    className="flex-1 p-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs"
                  >
                    {state.spareParts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) · Cost: {p.costPrice} EGP
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const updated = [...poItems];
                      updated[idx].quantity = Number(e.target.value);
                      setPoItems(updated);
                    }}
                    className="w-20 p-1.5 bg-slate-900 border border-slate-700 rounded text-white font-mono text-center text-xs"
                  />

                  {poItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePoItem(idx)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsPoModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
              >
                Issue Purchase Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
