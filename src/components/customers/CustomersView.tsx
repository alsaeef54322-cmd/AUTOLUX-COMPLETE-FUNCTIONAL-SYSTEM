import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Car,
  Receipt,
  FileText,
  X,
  Edit2,
  Trash2,
  Printer,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { state, createCustomer, updateCustomer, deleteCustomer, printDocument, setActiveTab, theme } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('التجمع الخامس، القاهرة الجديدة');
  const [formNotes, setFormNotes] = useState('');
  const [formType, setFormType] = useState<'individual' | 'corporate'>('individual');

  const isDark = theme === 'dark';

  const filteredCustomers = state.customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.nameAr && c.nameAr.toLowerCase().includes(q)) ||
      c.phone.includes(q) ||
      c.customerNumber.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('التجمع الخامس، القاهرة الجديدة');
    setFormNotes('');
    setFormType('individual');
    setIsModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormName(cust.nameAr || cust.name);
    setFormPhone(cust.phone);
    setFormEmail(cust.email);
    setFormAddress(cust.address);
    setFormNotes(cust.notes || '');
    setFormType(cust.customerType);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    if (editingCustomer) {
      const updated: Customer = {
        ...editingCustomer,
        name: formName.trim(),
        nameAr: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim() || `${formPhone.trim()}@tagamoa-care.eg`,
        address: formAddress.trim(),
        notes: formNotes.trim(),
        customerType: formType,
      };
      updateCustomer(updated);
      setSelectedCustomer(updated);
    } else {
      const created = createCustomer({
        name: formName.trim(),
        nameAr: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim() || `${formPhone.trim()}@tagamoa-care.eg`,
        address: formAddress.trim(),
        notes: formNotes.trim(),
        customerType: formType,
      });
      setSelectedCustomer(created);
    }

    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;
    const res = await deleteCustomer(customerToDelete.id);
    if (!res.success) {
      alert(res.error || 'فشل حذف العميل');
    } else {
      if (selectedCustomer?.id === customerToDelete.id) {
        setSelectedCustomer(null);
      }
    }
    setCustomerToDelete(null);
  };

  const handleExportExcel = () => {
    exportToCSV(
      'عملاء_مركز_صيانة_التجمع_الخامس',
      [
        { header: 'كود العميل', key: (c) => c.customerNumber },
        { header: 'الاسم الكامل', key: (c) => c.nameAr || c.name },
        { header: 'رقم الهاتف', key: (c) => c.phone },
        { header: 'البريد الإلكتروني', key: (c) => c.email },
        { header: 'العنوان / المنطقة', key: (c) => c.address },
        { header: 'نوع الحساب', key: (c) => (c.customerType === 'individual' ? 'فردي' : 'شركات ومؤسسات') },
        { header: 'الرصيد المستحق (ج.م)', key: (c) => c.balance },
        { header: 'تاريخ التسجيل', key: (c) => c.createdAt },
      ],
      filteredCustomers
    );
  };

  const handlePrintStatement = (customer: Customer) => {
    printDocument('invoice', {
      invoiceNumber: `STMT-${customer.customerNumber}`,
      issueDate: new Date().toISOString().substring(0, 10),
      customerName: customer.nameAr || customer.name,
      customerAddress: customer.address,
      customerPhone: customer.phone,
      totalAmount: customer.balance,
      paidAmount: 0,
      balanceDue: customer.balance,
      lineItems: [
        {
          description: `كشف حساب ومستحقات العميل: ${customer.nameAr || customer.name}`,
          quantity: 1,
          unitPrice: customer.balance,
          total: customer.balance,
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Toolbar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Users className="w-6 h-6 text-blue-500" />
            <span>دليل وحسابات العملاء</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            مركز صيانة التجمع الخامس · إدارة بيانات العملاء، المركبات المرتبطة، والأرصدة المستحقة
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
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عميل جديد</span>
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
          placeholder="بحث بالاسم، رقم الهاتف، أو كود العميل..."
          className={`w-full ps-9 pe-3 py-2.5 rounded-xl text-xs border focus:outline-hidden transition-colors ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500'
              : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 shadow-xs'
          }`}
        />
      </div>

      {/* Table */}
      <div className={`rounded-xl border overflow-hidden shadow-lg ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-semibold ${isDark ? 'border-slate-800 bg-slate-950/60 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                <th className="py-3 px-4 text-start">العميل</th>
                <th className="py-3 px-3 text-start">رقم الهاتف</th>
                <th className="py-3 px-3 text-start">المنطقة / العنوان</th>
                <th className="py-3 px-3 text-start">نوع الحساب</th>
                <th className="py-3 px-3 text-start">المركبات المرتبطة</th>
                <th className="py-3 px-3 text-end">الرصيد المستحق</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    لا يوجد عملاء مطابقون لمعايير البحث.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const vehicles = state.vehicles.filter((v) => v.customerId === cust.id);

                  return (
                    <tr
                      key={cust.id}
                      onClick={() => setSelectedCustomer(cust)}
                      className={`cursor-pointer transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {cust.name.charAt(0)}
                          </div>
                          <div>
                            <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {cust.nameAr || cust.name}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{cust.customerNumber}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-300" dir="ltr">
                        {cust.phone}
                      </td>

                      <td className="py-3 px-3 text-slate-400 truncate max-w-[150px]">
                        {cust.address}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          cust.customerType === 'corporate'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        }`}>
                          {cust.customerType === 'corporate' ? 'شركات' : 'فردي'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-slate-300 font-medium">
                          {vehicles.length} مركبة
                        </span>
                      </td>

                      <td className="py-3 px-3 text-end font-mono">
                        <span className={`font-bold ${cust.balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {cust.balance.toLocaleString()} ج.م
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handlePrintStatement(cust)}
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-blue-400 hover:bg-slate-800' : 'text-blue-600 hover:bg-blue-50'}`}
                            title="طباعة كشف الحساب"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openEditModal(cust)}
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                            title="تعديل العميل"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setCustomerToDelete(cust)}
                            className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="حذف العميل"
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

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className={`relative w-full max-w-2xl rounded-2xl border p-6 my-8 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-base">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base">{selectedCustomer.nameAr || selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedCustomer.customerNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintStatement(selectedCustomer)}
                  className="p-1.5 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 transition-colors"
                  title="طباعة كشف حساب"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEditModal(selectedCustomer)}
                  className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                  title="تعديل"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCustomerToDelete(selectedCustomer)}
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                  title="حذف العميل"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="py-4 overflow-y-auto space-y-5">
              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block text-[10px]">رقم الهاتف</span>
                  <span className="font-mono font-semibold mt-1 block" dir="ltr">{selectedCustomer.phone}</span>
                </div>
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block text-[10px]">البريد</span>
                  <span className="font-medium mt-1 block truncate">{selectedCustomer.email || '-'}</span>
                </div>
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block text-[10px]">الرصيد المستحق</span>
                  <span className={`font-mono font-bold mt-1 block ${selectedCustomer.balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {selectedCustomer.balance.toLocaleString()} ج.م
                  </span>
                </div>
              </div>

              {/* Linked Vehicles */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs flex items-center gap-1.5 text-slate-300">
                  <Car className="w-4 h-4 text-emerald-400" />
                  <span>المركبات المسجلة ({state.vehicles.filter((v) => v.customerId === selectedCustomer.id).length})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {state.vehicles
                    .filter((v) => v.customerId === selectedCustomer.id)
                    .map((veh) => (
                      <div
                        key={veh.id}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="font-bold">{veh.make} {veh.model} ({veh.year})</div>
                          <span className="font-mono text-[11px] text-blue-400">{veh.plateNumberArabic || veh.plateNumber}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{veh.currentMileage?.toLocaleString()} كم</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className={`relative w-full max-w-lg rounded-2xl border p-6 my-8 shadow-2xl overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className={`flex items-center justify-between pb-4 border-b mb-5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className="font-bold text-base">
                {editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
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
                <label className="text-xs font-semibold block text-slate-300">اسم العميل *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: د. حازم عبد الرحمن"
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold block text-slate-300">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold block text-slate-300">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="client@gmail.com"
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold block text-slate-300">العنوان / المنطقة</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="التجمع الخامس، القاهرة الجديدة"
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold block text-slate-300">نوع الحساب</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                  }`}
                >
                  <option value="individual">عميل فردي</option>
                  <option value="corporate">شركات وأساطيل</option>
                </select>
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
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all cursor-pointer"
                >
                  {editingCustomer ? 'حفظ التعديلات' : 'إضافة العميل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base">تأكيد حذف العميل</h3>
              <p className="text-xs text-slate-400">
                هل أنت متأكد من حذف حساب العميل{' '}
                <span className="font-bold text-white">
                  "{customerToDelete.nameAr || customerToDelete.name}"
                </span>؟
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
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
