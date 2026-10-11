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
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export const SuppliersAndPurchasingView: React.FC = () => {
  const {
    state,
    receivePurchaseOrder,
    createPurchaseOrder,
    deletePurchaseOrder,
    deleteSupplier,
    theme,
    t,
  } = useApp();

  const [activeTabSub, setActiveTabSub] = useState<'orders' | 'suppliers'>('orders');
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [poToDelete, setPoToDelete] = useState<PurchaseOrder | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  // New PO form state
  const [selectedSupplierId, setSelectedSupplierId] = useState(state.suppliers[0]?.id || '');
  const [poItems, setPoItems] = useState<{ partId: string; quantity: number }[]>([
    { partId: state.spareParts[0]?.id || '', quantity: 5 },
  ]);

  const isDark = theme === 'dark';

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
        partName: part.nameAr || part.name,
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
      orderDate: new Date().toISOString().substring(0, 10),
      status: 'ordered',
      items: formattedItems,
      subtotal,
      tax,
      total,
      notes: `أمر توريد لقطع غيار من ${sup.name}`,
    });

    setIsPoModalOpen(false);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Title */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Truck className="w-6 h-6 text-blue-500" />
            <span>الموردون والمشتريات وأوامر التوريد</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            إدارة شبكة موردي قطع الغيار الأصلية وأوامر الشراء واستلام البضائع بالمستودع
          </p>
        </div>

        <button
          onClick={() => setIsPoModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء أمر شراء (PO) جديد</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className={`flex border-b text-xs ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <button
          onClick={() => setActiveTabSub('orders')}
          className={`flex items-center gap-2 py-3 px-4 font-bold border-b-2 transition-colors cursor-pointer ${
            activeTabSub === 'orders'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>أوامر الشراء ({state.purchaseOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTabSub('suppliers')}
          className={`flex items-center gap-2 py-3 px-4 font-bold border-b-2 transition-colors cursor-pointer ${
            activeTabSub === 'suppliers'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>دليل الموردين المعتمدين ({state.suppliers.length})</span>
        </button>
      </div>

      {activeTabSub === 'orders' ? (
        /* Purchase Orders Table */
        <div className={`border rounded-2xl overflow-hidden shadow-lg ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  isDark ? 'border-slate-800 bg-slate-950/70 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}>
                  <th className="py-3 px-4 text-start">رقم أمر الشراء</th>
                  <th className="py-3 px-4 text-start">اسم المورد</th>
                  <th className="py-3 px-4 text-start">تاريخ الطلب</th>
                  <th className="py-3 px-4 text-center">عدد الأصناف</th>
                  <th className="py-3 px-4 text-end">إجمالي القيمة</th>
                  <th className="py-3 px-4 text-center">حالة الأمر</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                {state.purchaseOrders.map((po) => (
                  <tr key={po.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                    <td className="py-3 px-4 font-mono font-bold text-blue-500">{po.poNumber}</td>
                    <td className={`py-3 px-4 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{po.supplierName}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{po.orderDate}</td>
                    <td className="py-3 px-4 text-center tabular-nums text-slate-400 font-mono">
                      {po.items.length} صنف
                    </td>
                    <td className={`py-3 px-4 text-end font-bold font-mono tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {po.total.toLocaleString()} {t.currencySymbol}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          po.status === 'received'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                        }`}
                      >
                        {po.status === 'received' ? 'تم استلام المخزون' : 'بانتظار التوريد'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {po.status === 'ordered' ? (
                          <button
                            onClick={() => handleReceiveStock(po.id)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>استلام بالمخزن</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">مستلم في {po.receivedDate}</span>
                        )}

                        <button
                          onClick={() => setPoToDelete(po)}
                          title="حذف أمر الشراء"
                          className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Suppliers Directory */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {state.suppliers.map((sup) => (
            <div
              key={sup.id}
              className={`p-4 rounded-2xl border text-xs space-y-3 ${
                isDark ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
              }`}
            >
              <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{sup.name}</h3>
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                    {sup.paymentTerms}
                  </span>
                  <button
                    onClick={() => setSupplierToDelete(sup)}
                    title="حذف المورد"
                    className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 text-slate-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="font-mono" dir="ltr">{sup.phone}</span>
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
              <div className={`pt-2 border-t flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <span className="text-slate-400 text-[11px]">الرصيد المستحق للمورد:</span>
                <span className="font-bold text-amber-500 font-mono tabular-nums">
                  {sup.balance.toLocaleString()} {t.currencySymbol}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create PO Modal */}
      {isPoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto" dir="rtl">
          <form
            onSubmit={handlePoSubmit}
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-4 text-xs ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className="font-bold text-base">إنشاء أمر شراء وتوريد بضائع</h3>
              <button
                type="button"
                onClick={() => setIsPoModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">اختر المورد المعتمد *</label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className={`w-full p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
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
                <label className="text-slate-400 font-semibold text-[11px]">أصناف الطلبية والكميات المطلوبة</label>
                <button
                  type="button"
                  onClick={handleAddPoItem}
                  className="text-blue-500 hover:underline text-xs font-bold"
                >
                  + إضافة بند آخر
                </button>
              </div>

              {poItems.map((item, idx) => (
                <div key={idx} className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <select
                    value={item.partId}
                    onChange={(e) => {
                      const updated = [...poItems];
                      updated[idx].partId = e.target.value;
                      setPoItems(updated);
                    }}
                    className={`flex-1 p-2 rounded-lg border text-xs ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    {state.spareParts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nameAr || p.name} ({p.sku}) · التكلفة: {p.costPrice} {t.currencySymbol}
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
                    className={`w-20 p-2 rounded-lg border font-mono text-center text-xs ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
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

            <div className={`flex justify-end gap-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setIsPoModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md cursor-pointer"
              >
                إصدار أمر الشراء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PO Delete Confirmation Modal */}
      {poToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4" dir="rtl">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base">تأكيد حذف أمر الشراء</h3>
              <p className="text-xs text-slate-400">
                هل أنت متأكد من حذف أمر الشراء رقم{' '}
                <span className="font-bold text-white font-mono">
                  "{poToDelete.poNumber}"
                </span>{' '}
                للمورد ({poToDelete.supplierName})؟
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPoToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                onClick={() => {
                  deletePurchaseOrder(poToDelete.id);
                  setPoToDelete(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all cursor-pointer"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Delete Confirmation Modal */}
      {supplierToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4" dir="rtl">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base">تأكيد حذف المورد</h3>
              <p className="text-xs text-slate-400">
                هل أنت متأكد من حذف المورد{' '}
                <span className="font-bold text-white">
                  "{supplierToDelete.name}"
                </span>؟
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSupplierToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSupplier(supplierToDelete.id);
                  setSupplierToDelete(null);
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
