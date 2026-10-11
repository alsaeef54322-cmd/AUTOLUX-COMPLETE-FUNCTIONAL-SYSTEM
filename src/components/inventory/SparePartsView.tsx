import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SparePart } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  ArrowLeftRight,
  X,
  Edit2,
  FileSpreadsheet,
  Printer,
  Boxes,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'جميع الأقسام' },
  { id: 'brakes', label: 'الفرامل والطنابير' },
  { id: 'fluids', label: 'الزيوت والسوائل' },
  { id: 'filters', label: 'الفلاتر' },
  { id: 'suspension', label: 'العفشة والمساعدين' },
  { id: 'engine', label: 'المحرك والسيور' },
  { id: 'electrical', label: 'الكهرباء والبطاريات' },
  { id: 'transmission', label: 'ناقل الحركة' },
];

export const SparePartsView: React.FC = () => {
  const { state, createSparePart, updateSparePart, theme, t } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);

  // Form states
  const [sku, setSku] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [category, setCategory] = useState<any>('brakes');
  const [supplierId, setSupplierId] = useState(state.suppliers[0]?.id || '');
  const [costPrice, setCostPrice] = useState(1500);
  const [sellingPrice, setSellingPrice] = useState(2200);
  const [currentStock, setCurrentStock] = useState(10);
  const [minStock, setMinStock] = useState(4);
  const [binLocation, setBinLocation] = useState('رف A-01');
  const [compatibleVehicles, setCompatibleVehicles] = useState('بي إم دبليو، مرسيدس');

  const isDark = theme === 'dark';

  const filteredParts = state.spareParts.filter((part) => {
    if (selectedCategory !== 'all' && part.category !== selectedCategory) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      part.name.toLowerCase().includes(q) ||
      (part.nameAr && part.nameAr.toLowerCase().includes(q)) ||
      part.sku.toLowerCase().includes(q) ||
      part.partNumber.toLowerCase().includes(q) ||
      part.binLocation.toLowerCase().includes(q)
    );
  });

  const openCreateModal = () => {
    setEditingPart(null);
    setSku(`PART-${Date.now().toString().slice(-4)}`);
    setPartNumber('');
    setName('');
    setNameAr('');
    setCategory('brakes');
    setSupplierId(state.suppliers[0]?.id || '');
    setCostPrice(1500);
    setSellingPrice(2200);
    setCurrentStock(10);
    setMinStock(4);
    setBinLocation('رف A-01');
    setCompatibleVehicles('السيارات الألمانية والأوروبية');
    setIsModalOpen(true);
  };

  const openEditModal = (part: SparePart) => {
    setEditingPart(part);
    setSku(part.sku);
    setPartNumber(part.partNumber);
    setName(part.name);
    setNameAr(part.nameAr || part.name);
    setCategory(part.category);
    setSupplierId(part.supplierId);
    setCostPrice(part.costPrice);
    setSellingPrice(part.sellingPrice);
    setCurrentStock(part.currentStock);
    setMinStock(part.minStock);
    setBinLocation(part.binLocation);
    setCompatibleVehicles(part.compatibleVehicles);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name) return;

    const sup = state.suppliers.find((s) => s.id === supplierId) || state.suppliers[0];

    if (editingPart) {
      updateSparePart({
        ...editingPart,
        sku,
        partNumber,
        name,
        nameAr: nameAr || name,
        category,
        supplierId: sup.id,
        supplierName: sup.name,
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        currentStock: Number(currentStock),
        minStock: Number(minStock),
        binLocation,
        compatibleVehicles,
      });
      if (selectedPart?.id === editingPart.id) {
        setSelectedPart({
          ...editingPart,
          sku,
          partNumber,
          name,
          nameAr: nameAr || name,
          category,
          supplierId: sup.id,
          supplierName: sup.name,
          costPrice: Number(costPrice),
          sellingPrice: Number(sellingPrice),
          currentStock: Number(currentStock),
          minStock: Number(minStock),
          binLocation,
          compatibleVehicles,
        });
      }
    } else {
      createSparePart({
        sku,
        partNumber,
        name,
        nameAr: nameAr || name,
        category,
        supplierId: sup.id,
        supplierName: sup.name,
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        currentStock: Number(currentStock),
        minStock: Number(minStock),
        binLocation,
        compatibleVehicles,
        unit: 'قطعة',
      });
    }

    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    exportToCSV(
      filteredParts.map((p) => ({
        'كود الصنف': p.sku,
        'رقم القطعة الأصلي': p.partNumber,
        'اسم القطعة': p.nameAr || p.name,
        'القسم والتصنيف': p.category,
        'موقع الرف': p.binLocation,
        'المورد المعتمد': p.supplierName,
        'سعر التكلفة (ج.م)': p.costPrice,
        'سعر البيع للعميل (ج.م)': p.sellingPrice,
        'الرصيد الحالي': p.currentStock,
        'الحد الأدنى للطلب': p.minStock,
        'الموديلات المتوافقة': p.compatibleVehicles,
      })),
      `مخزون_قطع_الغيار_مركز_صيانة_التجمع_الخامس_${new Date().toISOString().substring(0, 10)}`
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Title */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Package className="w-6 h-6 text-amber-500" />
            <span>كتالوج ومستودع قطع الغيار</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            إدارة قطع الغيار الأصلية لمركز صيانة التجمع الخامس، أسعار التكلفة والبيع وتنبيهات نواقص المخزون
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
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة صنف جديد</span>
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم القطعة، الكود، رقم القطعة، أو مكان الرف..."
            className={`w-full ps-10 pe-4 py-2.5 rounded-xl border text-xs ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-amber-500'
                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 shadow-xs'
            }`}
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Parts Table */}
      <div className={`border rounded-2xl overflow-hidden shadow-lg ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'border-slate-800 bg-slate-950/70 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}>
                <th className="py-3.5 px-4 text-start">كود الصنف / الرقم الأصلي</th>
                <th className="py-3.5 px-4 text-start">اسم القطعة والموديلات</th>
                <th className="py-3.5 px-4 text-start">موقع الرف</th>
                <th className="py-3.5 px-4 text-start">المورد المعتمد</th>
                <th className="py-3.5 px-4 text-end">سعر التكلفة</th>
                <th className="py-3.5 px-4 text-end">سعر البيع للعميل</th>
                <th className="py-3.5 px-4 text-center">رصيد المخزن</th>
                <th className="py-3.5 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    لا توجد أصناف مطابقة للبحث أو التصفية
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => {
                  const isLow = part.currentStock <= part.minStock;
                  return (
                    <tr
                      key={part.id}
                      onClick={() => setSelectedPart(part)}
                      className={`cursor-pointer transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-amber-500 text-xs">{part.sku}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{part.partNumber}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{part.nameAr || part.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {part.compatibleVehicles}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{part.binLocation}</td>
                      <td className="py-3.5 px-4 text-slate-400">{part.supplierName}</td>
                      <td className="py-3.5 px-4 text-end tabular-nums text-slate-400 font-mono">
                        {part.costPrice.toLocaleString()} {t.currencySymbol}
                      </td>
                      <td className={`py-3.5 px-4 text-end tabular-nums font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {part.sellingPrice.toLocaleString()} {t.currencySymbol}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold tabular-nums ${
                            isLow
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3" />}
                          {part.currentStock} {part.unit}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(part)}
                            title="تعديل الصنف"
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                          </button>
                          <button
                            onClick={() => setSelectedPart(part)}
                            className="px-2.5 py-1 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg font-bold cursor-pointer"
                          >
                            عرض
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Part Detail Modal */}
      {selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto" dir="rtl">
          <div className={`relative w-full max-w-2xl border rounded-2xl shadow-2xl my-8 overflow-hidden flex flex-col ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedPart.nameAr || selectedPart.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    كود: {selectedPart.sku} · الأصلي: {selectedPart.partNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPart(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block text-[10px] font-bold">الرصيد الحالي بالمستودع</span>
                  <span className={`font-mono font-black text-lg mt-1 block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedPart.currentStock} {selectedPart.unit}
                  </span>
                </div>
                <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block text-[10px] font-bold">حد الأمان وإعادة الطلب</span>
                  <span className="font-mono font-black text-lg text-amber-500 mt-1 block">
                    {selectedPart.minStock} {selectedPart.unit}
                  </span>
                </div>
                <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block text-[10px] font-bold">سعر التكلفة من المورد</span>
                  <span className="font-mono font-bold text-slate-400 mt-1 block">
                    {selectedPart.costPrice.toLocaleString()} {t.currencySymbol}
                  </span>
                </div>
                <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block text-[10px] font-bold">سعر البيع المعتمد</span>
                  <span className="font-mono font-black text-emerald-500 mt-1 block">
                    {selectedPart.sellingPrice.toLocaleString()} {t.currencySymbol}
                  </span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border space-y-1.5 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">موقع الرف والتخزين:</span>
                  <span className="font-mono font-bold text-amber-500">{selectedPart.binLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">الموديلات المتوافقة:</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedPart.compatibleVehicles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">المورد المعتمد:</span>
                  <span className="text-blue-500 font-medium">{selectedPart.supplierName}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    openEditModal(selectedPart);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  تعديل بيانات الصنف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto" dir="rtl">
          <form
            onSubmit={handleFormSubmit}
            className={`w-full max-w-lg border rounded-2xl p-6 shadow-2xl space-y-4 text-xs my-8 ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {editingPart ? 'تعديل بيانات صنف قطع الغيار' : 'إضافة صنف جديد للمستودع'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-400 font-bold">كود الصنف الداخلي (SKU) *</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-400 font-bold">رقم القطعة الأصلي (OEM) *</label>
                <input
                  type="text"
                  value={partNumber}
                  onChange={(e) => setPartNumber(e.target.value)}
                  placeholder="مثال: 34-11-6-850-885"
                  className={`w-full p-2.5 rounded-xl border font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-400 font-bold">اسم القطعة بالعربية *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameAr(e.target.value);
                }}
                placeholder="مثال: تيل فرامل أمامي سيراميك أصلي"
                className={`w-full p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-400 font-bold">القسم / التصنيف *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-400 font-bold">موقع الرف بالمستودع *</label>
                <input
                  type="text"
                  required
                  value={binLocation}
                  onChange={(e) => setBinLocation(e.target.value)}
                  placeholder="مثال: رف B-04"
                  className={`w-full p-2.5 rounded-xl border font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-400 font-bold">سعر التكلفة ({t.currencySymbol}) *</label>
                <input
                  type="number"
                  required
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className={`w-full p-2.5 rounded-xl border font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-400 font-bold">سعر البيع للعميل ({t.currencySymbol}) *</label>
                <input
                  type="number"
                  required
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className={`w-full p-2.5 rounded-xl border font-mono font-bold text-emerald-500 ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-400 font-bold">الرصيد الفعلي حالياً *</label>
                <input
                  type="number"
                  required
                  value={currentStock}
                  onChange={(e) => setCurrentStock(Number(e.target.value))}
                  className={`w-full p-2.5 rounded-xl border font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-400 font-bold">الحد الأدنى للتنبيه *</label>
                <input
                  type="number"
                  required
                  value={minStock}
                  onChange={(e) => setMinStock(Number(e.target.value))}
                  className={`w-full p-2.5 rounded-xl border font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-400 font-bold">الموديلات المتوافقة</label>
              <input
                type="text"
                value={compatibleVehicles}
                onChange={(e) => setCompatibleVehicles(e.target.value)}
                placeholder="مثال: بي إم دبليو الفئة الخامسة، الفئة السابعة"
                className={`w-full p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className={`flex justify-end gap-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-amber-600/30"
              >
                {editingPart ? 'حفظ التعديلات' : 'إضافة الصنف'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
