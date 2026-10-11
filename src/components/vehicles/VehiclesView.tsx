import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';
import {
  Car,
  Search,
  Plus,
  Wrench,
  User,
  Clock,
  X,
  Edit2,
  Trash2,
  Printer,
  FileSpreadsheet,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export const VehiclesView: React.FC = () => {
  const { state, createVehicle, updateVehicle, deleteVehicle, printDocument, setActiveTab, theme } = useApp();

  const [search, setSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  // Form states
  const [formCustomerId, setFormCustomerId] = useState(state.customers[0]?.id || '');
  const [formPlate, setFormPlate] = useState('');
  const [formPlateAr, setFormPlateAr] = useState('');
  const [formVin, setFormVin] = useState('');
  const [formMake, setFormMake] = useState('BMW');
  const [formModel, setFormModel] = useState('530i');
  const [formYear, setFormYear] = useState(2022);
  const [formColor, setFormColor] = useState('أسود ميتاليك');
  const [formMileage, setFormMileage] = useState(45000);

  const isDark = theme === 'dark';

  const filteredVehicles = state.vehicles.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const customer = state.customers.find((c) => c.id === v.customerId);
    return (
      v.plateNumber.toLowerCase().includes(q) ||
      (v.plateNumberArabic && v.plateNumberArabic.includes(q)) ||
      v.vin.toLowerCase().includes(q) ||
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      (customer && customer.name.toLowerCase().includes(q)) ||
      (customer && customer.nameAr && customer.nameAr.toLowerCase().includes(q))
    );
  });

  const openCreateModal = () => {
    setEditingVehicle(null);
    setFormCustomerId(state.customers[0]?.id || '');
    setFormPlate('');
    setFormPlateAr('');
    setFormVin('');
    setFormMake('BMW');
    setFormModel('530i');
    setFormYear(2022);
    setFormColor('أسود ميتاليك');
    setFormMileage(45000);
    setIsModalOpen(true);
  };

  const openEditModal = (veh: Vehicle) => {
    setEditingVehicle(veh);
    setFormCustomerId(veh.customerId);
    setFormPlate(veh.plateNumber);
    setFormPlateAr(veh.plateNumberArabic || veh.plateNumber);
    setFormVin(veh.vin);
    setFormMake(veh.make);
    setFormModel(veh.model);
    setFormYear(veh.year);
    setFormColor(veh.color);
    setFormMileage(veh.currentMileage);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPlate.trim() || !formMake.trim() || !formModel.trim()) return;

    if (editingVehicle) {
      const updated: Vehicle = {
        ...editingVehicle,
        customerId: formCustomerId,
        plateNumber: formPlate.toUpperCase().trim(),
        plateNumberArabic: formPlateAr.trim() || formPlate.trim(),
        vin: formVin.toUpperCase().trim(),
        make: formMake.trim(),
        model: formModel.trim(),
        year: Number(formYear),
        color: formColor.trim(),
        currentMileage: Number(formMileage),
      };
      updateVehicle(updated);
      setSelectedVehicle(updated);
    } else {
      const created = createVehicle({
        customerId: formCustomerId,
        plateNumber: formPlate.toUpperCase().trim(),
        plateNumberArabic: formPlateAr.trim() || formPlate.trim(),
        vin: formVin.toUpperCase().trim() || `VIN-${Date.now().toString().slice(-8)}`,
        make: formMake.trim(),
        model: formModel.trim(),
        year: Number(formYear),
        color: formColor.trim(),
        fuelType: 'petrol',
        currentMileage: Number(formMileage),
        status: 'with_customer',
      });
      setSelectedVehicle(created);
    }

    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;
    const res = await deleteVehicle(vehicleToDelete.id);
    if (!res.success) {
      alert(res.error || 'فشل حذف المركبة');
    } else {
      if (selectedVehicle?.id === vehicleToDelete.id) {
        setSelectedVehicle(null);
      }
    }
    setVehicleToDelete(null);
  };

  const handleExportExcel = () => {
    exportToCSV(
      'سيارات_مركز_صيانة_التجمع_الخامس',
      [
        { header: 'الماركة والموديل', key: (v) => `${v.make} ${v.model} (${v.year})` },
        { header: 'رقم اللوحة', key: (v) => v.plateNumberArabic || v.plateNumber },
        { header: 'رقم الشاسيه (VIN)', key: (v) => v.vin },
        { header: 'اسم العميل / المالك', key: (v) => state.customers.find((c) => c.id === v.customerId)?.name || '-' },
        { header: 'قراءة العداد (كم)', key: (v) => v.currentMileage },
        { header: 'اللون', key: (v) => v.color },
        {
          header: 'حالة التواجد',
          key: (v) => (v.status === 'in_workshop' ? 'داخل المركز' : v.status === 'awaiting_pickup' ? 'جاهزة للاستلام' : 'مع العميل'),
        },
      ],
      filteredVehicles
    );
  };

  const handlePrintVehicleSheet = (veh: Vehicle) => {
    const cust = state.customers.find((c) => c.id === veh.customerId);
    printDocument('job_card', {
      orderNumber: `VEH-${veh.plateNumber}`,
      issueDate: new Date().toISOString().substring(0, 10),
      customerName: cust?.nameAr || cust?.name || 'غير محدد',
      customerPhone: cust?.phone || '-',
      vehicleMake: veh.make,
      vehicleModel: veh.model,
      plateNumber: veh.plateNumberArabic || veh.plateNumber,
      mileageIn: veh.currentMileage,
      complaint: `كارت بيانات وفحص فني للمركبة ${veh.make} ${veh.model} - شاسيه: ${veh.vin}`,
      priority: 'normal',
      status: veh.status === 'in_workshop' ? 'قيد العمل بالورشة' : 'خارج الورشة',
      advisorName: 'م. أحمد السيد',
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Toolbar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Car className="w-6 h-6 text-emerald-500" />
            <span>سجل المركبات والأجهزة المسجلة</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            مركز صيانة التجمع الخامس · تسجيل المركبات، أرقام الشاسيه (VIN)، قراءات العداد والربط مع الملاك
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-emerald-400 hover:text-emerald-300'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-emerald-700 shadow-xs'
            }`}
            title="تصدير إلى إكسيل"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>تصدير إكسيل</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل مركبة جديدة</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث باللوحة المعدنية، الموديل، الشاسيه، أو اسم المالك..."
          className={`w-full ps-9 pe-3 py-2.5 rounded-xl text-xs border focus:outline-hidden transition-colors ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-emerald-500'
              : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 shadow-xs'
          }`}
        />
      </div>

      {/* Table */}
      <div className={`rounded-xl border overflow-hidden shadow-lg ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-semibold ${isDark ? 'border-slate-800 bg-slate-950/60 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                <th className="py-3 px-4 text-start">السيارة / الموديل</th>
                <th className="py-3 px-3 text-start">رقم اللوحة المعدنية</th>
                <th className="py-3 px-3 text-start">المالك / العميل</th>
                <th className="py-3 px-3 text-start">رقم الشاسيه (VIN)</th>
                <th className="py-3 px-3 text-start">قراءة العداد</th>
                <th className="py-3 px-3 text-center">الحالة</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    لا توجد مركبات مطابقة لمعايير البحث.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((veh) => {
                  const customer = state.customers.find((c) => c.id === veh.customerId);

                  return (
                    <tr
                      key={veh.id}
                      onClick={() => setSelectedVehicle(veh)}
                      className={`cursor-pointer transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                            <Car className="w-4 h-4" />
                          </div>
                          <div>
                            <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {veh.make} {veh.model} ({veh.year})
                            </div>
                            <span className="text-[10px] text-slate-400">{veh.color}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-xs bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded">
                          {veh.plateNumberArabic || veh.plateNumber}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-300">
                        {customer ? (customer.nameAr || customer.name) : '-'}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                        {veh.vin}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-300">
                        {veh.currentMileage?.toLocaleString()} كم
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            veh.status === 'in_workshop'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : veh.status === 'awaiting_pickup'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                          }`}
                        >
                          {veh.status === 'in_workshop'
                            ? 'داخل الورشة'
                            : veh.status === 'awaiting_pickup'
                            ? 'جاهزة للاستلام'
                            : 'مع العميل'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handlePrintVehicleSheet(veh)}
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-blue-400 hover:bg-slate-800' : 'text-blue-600 hover:bg-blue-50'}`}
                            title="طباعة بطاقة المركبة"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openEditModal(veh)}
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                            title="تعديل بيانات المركبة"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setVehicleToDelete(veh)}
                            className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="حذف المركبة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className={`relative w-full max-w-lg rounded-2xl border p-6 my-8 shadow-2xl overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className={`flex items-center justify-between pb-4 border-b mb-5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className="font-bold text-base">
                {editingVehicle ? 'تعديل بيانات المركبة' : 'تسجيل مركبة جديدة'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold block text-slate-300">المالك / العميل *</label>
                <select
                  value={formCustomerId}
                  onChange={(e) => setFormCustomerId(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
                  }`}
                >
                  {state.customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameAr || c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold block text-slate-300">رقم اللوحة بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={formPlateAr}
                    onChange={(e) => setFormPlateAr(e.target.value)}
                    placeholder="مثال: س ر ق ٥ ٤ ٢ ١"
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold block text-slate-300">كود اللوحة (بالإنجليزية) *</label>
                  <input
                    type="text"
                    required
                    value={formPlate}
                    onChange={(e) => setFormPlate(e.target.value)}
                    placeholder="SRQ 5421"
                    className={`w-full px-3 py-2 text-xs rounded-xl border font-mono focus:outline-hidden ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold block text-slate-300">الماركة *</label>
                  <input
                    type="text"
                    required
                    value={formMake}
                    onChange={(e) => setFormMake(e.target.value)}
                    placeholder="BMW أو Mercedes"
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold block text-slate-300">الموديل *</label>
                  <input
                    type="text"
                    required
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    placeholder="530i أو C200"
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold block text-slate-300">سنة الصنع *</label>
                  <input
                    type="number"
                    required
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border font-mono focus:outline-hidden ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold block text-slate-300">رقم الشاسيه (VIN)</label>
                  <input
                    type="text"
                    value={formVin}
                    onChange={(e) => setFormVin(e.target.value)}
                    placeholder="WBAJB31090XXXXXXX"
                    className={`w-full px-3 py-2 text-xs rounded-xl border font-mono focus:outline-hidden ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold block text-slate-300">العداد الحالي (كم)</label>
                  <input
                    type="number"
                    value={formMileage}
                    onChange={(e) => setFormMileage(Number(e.target.value))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border font-mono focus:outline-hidden ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer"
                >
                  {editingVehicle ? 'حفظ التعديلات' : 'تسجيل المركبة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base">تأكيد حذف المركبة</h3>
              <p className="text-xs text-slate-400">
                هل أنت متأكد من حذف المركبة{' '}
                <span className="font-bold text-white">
                  "{vehicleToDelete.make} {vehicleToDelete.model}"
                </span>{' '}
                لوحة ({vehicleToDelete.plateNumberArabic || vehicleToDelete.plateNumber})؟
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVehicleToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                onClick={confirmDelete}
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
