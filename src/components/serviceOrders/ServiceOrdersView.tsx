import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceOrder, ServiceOrderStatus, Priority } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';
import {
  FileText,
  Search,
  User,
  Car,
  Wrench,
  Clock,
  Plus,
  Package,
  Printer,
  X,
  FileSpreadsheet,
  Receipt,
  CheckCircle,
  AlertTriangle,
  Trash2,
} from 'lucide-react';

const STATUS_OPTIONS: { id: ServiceOrderStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'جميع كروت الشغل' },
  { id: 'received', label: 'تم الاستلام' },
  { id: 'awaiting_inspection', label: 'في انتظار الفحص' },
  { id: 'awaiting_approval', label: 'بانتظار موافقة العميل' },
  { id: 'approved', label: 'معتمد للعمل' },
  { id: 'in_progress', label: 'قيد التنفيذ على الرافعة' },
  { id: 'waiting_parts', label: 'في انتظار قطع الغيار' },
  { id: 'quality_inspection', label: 'اختبار الجودة والتجربة' },
  { id: 'ready_for_delivery', label: 'جاهز لتسليم العميل' },
  { id: 'completed', label: 'مكتمل ومسلم' },
];

export const ServiceOrdersView: React.FC = () => {
  const {
    state,
    updateServiceOrderStatus,
    assignTechnician,
    addLaborItem,
    issuePartToOrder,
    createInvoice,
    deleteServiceOrder,
    setActiveTab,
    printDocument,
    theme,
    t,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<ServiceOrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<ServiceOrder | null>(null);

  // Modal forms inside detail
  const [isAddingLabor, setIsAddingLabor] = useState(false);
  const [laborDesc, setLaborDesc] = useState('');
  const [laborHours, setLaborHours] = useState(2);
  const [laborRate, setLaborRate] = useState(850);
  const [laborTechName, setLaborTechName] = useState('م. طارق منصور');

  const [isIssuingPart, setIsIssuingPart] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQty, setPartQty] = useState(1);
  const [issueError, setIssueError] = useState('');

  // Status transition notes
  const [transitionNotes, setTransitionNotes] = useState('');

  const isDark = theme === 'dark';

  const filteredOrders = state.serviceOrders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const customer = state.customers.find((c) => c.id === order.customerId);
    const vehicle = state.vehicles.find((v) => v.id === order.vehicleId);
    return (
      order.orderNumber.toLowerCase().includes(q) ||
      order.customerComplaint.toLowerCase().includes(q) ||
      (customer && customer.name.toLowerCase().includes(q)) ||
      (customer && customer.nameAr && customer.nameAr.toLowerCase().includes(q)) ||
      (vehicle && vehicle.plateNumber.toLowerCase().includes(q)) ||
      (vehicle && vehicle.make.toLowerCase().includes(q))
    );
  });

  const handleAddLaborSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !laborDesc.trim()) return;
    addLaborItem(selectedOrder.id, {
      description: laborDesc.trim(),
      hours: Number(laborHours),
      hourlyRate: Number(laborRate),
      technicianName: laborTechName,
      status: 'pending',
    });
    const updated = state.serviceOrders.find((o) => o.id === selectedOrder.id);
    if (updated) setSelectedOrder(updated);
    setIsAddingLabor(false);
    setLaborDesc('');
  };

  const handleIssuePartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIssueError('');
    if (!selectedOrder || !selectedPartId) return;

    const res = issuePartToOrder(selectedOrder.id, selectedPartId, Number(partQty));
    if (res.success) {
      const updated = state.serviceOrders.find((o) => o.id === selectedOrder.id);
      if (updated) setSelectedOrder(updated);
      setIsIssuingPart(false);
      setSelectedPartId('');
    } else {
      setIssueError(res.error || 'فشل صرف قطعة الغيار من المخزن');
    }
  };

  const handleAdvanceStatus = (newStatus: ServiceOrderStatus) => {
    if (!selectedOrder) return;
    updateServiceOrderStatus(selectedOrder.id, newStatus, transitionNotes);
    const updated = state.serviceOrders.find((o) => o.id === selectedOrder.id);
    if (updated) setSelectedOrder({ ...updated, status: newStatus });
    setTransitionNotes('');
  };

  const handleGenerateInvoice = () => {
    if (!selectedOrder) return;
    const customer = state.customers.find((c) => c.id === selectedOrder.customerId);
    const vehicle = state.vehicles.find((v) => v.id === selectedOrder.vehicleId);

    const invoiceItems = [
      ...selectedOrder.laborItems.map((l) => ({
        id: `inv-item-${Date.now()}-${l.id}`,
        description: l.description,
        type: 'labor' as const,
        quantity: l.hours,
        unitPrice: l.hourlyRate,
        total: l.total,
      })),
      ...selectedOrder.partsItems.map((p) => ({
        id: `inv-item-${Date.now()}-${p.id}`,
        description: p.partName,
        type: 'part' as const,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        total: p.total,
      })),
    ];

    const subtotal = selectedOrder.actualTotal || selectedOrder.estimatedTotal || 5000;
    const taxRate = state.settings.taxRate;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    createInvoice({
      serviceOrderId: selectedOrder.id,
      customerId: selectedOrder.customerId,
      customerName: customer ? (customer.nameAr || customer.name) : 'عميل مميز',
      vehiclePlate: vehicle ? `${vehicle.plateNumber} (${vehicle.make} ${vehicle.model})` : undefined,
      issueDate: new Date().toISOString().substring(0, 10),
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
      items: invoiceItems,
      subtotal,
      discount: 0,
      taxRate,
      taxAmount,
      totalAmount,
      paidAmount: 0,
      balanceDue: totalAmount,
      status: 'unpaid',
      notes: `فاتورة صادرة عن كارت شغل رقم ${selectedOrder.orderNumber}`,
    });

    setActiveTab('invoices');
  };

  const handleExportCSV = () => {
    exportToCSV(
      filteredOrders.map((o) => {
        const customer = state.customers.find((c) => c.id === o.customerId);
        const vehicle = state.vehicles.find((v) => v.id === o.vehicleId);
        return {
          'رقم أمر الشغل': o.orderNumber,
          'اسم العميل': customer?.nameAr || customer?.name || '-',
          'رقم هاتف العميل': customer?.phone || '-',
          'السيارة': vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : '-',
          'رقم اللوحة': vehicle?.plateNumber || '-',
          'قراءة العداد': o.mileageIn,
          'المهندس المسؤول': o.assignedTechnicianName || 'غير مسند',
          'الحالة': t[`status_${o.status}` as keyof typeof t] || o.status,
          'الأولوية': o.priority === 'urgent' ? 'عاجلة' : o.priority === 'critical' ? 'حرجة' : 'عادية',
          'الإجمالي (ج.م)': o.actualTotal || o.estimatedTotal,
          'تاريخ الاستلام': o.createdAt,
        };
      }),
      `أوامر_شغل_مركز_صيانة_التجمع_الخامس_${new Date().toISOString().substring(0, 10)}`
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Title & Search Bar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <FileText className="w-6 h-6 text-blue-500" />
            <span>أوامر الصيانة وبطاقات العمل (Job Cards)</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            متابعة كروت الشغل، المصنعيات، صرف قطع الغيار ومراحل العمل بالورشة في التجمع الخامس
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
            onClick={() => setActiveTab('reception')}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>استقبال سيارة جديدة</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Strip */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث برقم أمر الشغل، العميل، السيارة أو الشكوى..."
            className={`w-full ps-10 pe-4 py-2.5 rounded-xl border text-xs ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500'
                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 shadow-xs'
            }`}
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setStatusFilter(opt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === opt.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className={`border rounded-2xl overflow-hidden shadow-lg ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'border-slate-800 bg-slate-950/70 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}>
                <th className="py-3.5 px-4 text-start">رقم أمر الشغل</th>
                <th className="py-3.5 px-4 text-start">السيارة واللوحة</th>
                <th className="py-3.5 px-4 text-start">اسم العميل</th>
                <th className="py-3.5 px-4 text-start">المهندس المسؤول</th>
                <th className="py-3.5 px-4 text-start">مرحلة العمل</th>
                <th className="py-3.5 px-4 text-start">الأولوية</th>
                <th className="py-3.5 px-4 text-end">التكلفة الإجمالية</th>
                <th className="py-3.5 px-4 text-center">التفاصيل والطباعة</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    لا توجد أوامر شغل مطابقة للبحث أو التصفية
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const customer = state.customers.find((c) => c.id === order.customerId);
                  const vehicle = state.vehicles.find((v) => v.id === order.vehicleId);
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`cursor-pointer transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-500 whitespace-nowrap">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {vehicle ? `${vehicle.make} ${vehicle.model}` : 'مركبة'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {vehicle?.plateNumber} · {order.mileageIn.toLocaleString()} كم
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {customer?.nameAr || customer?.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono" dir="ltr">
                          {customer?.phone}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {order.assignedTechnicianName || (
                          <span className="text-slate-500 italic">غير مسند</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          {t[`status_${order.status}` as keyof typeof t] || order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            order.priority === 'critical'
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                              : order.priority === 'urgent'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                              : 'bg-slate-500/10 text-slate-400'
                          }`}
                        >
                          {order.priority === 'critical' ? 'حرجة' : order.priority === 'urgent' ? 'عاجلة' : 'عادية'}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-end font-bold tabular-nums font-mono ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {(order.actualTotal > 0 ? order.actualTotal : order.estimatedTotal).toLocaleString()}{' '}
                        {t.currencySymbol}
                      </td>
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              printDocument('job_card', {
                                ...order,
                                customerName: customer?.nameAr || customer?.name,
                                vehiclePlate: vehicle ? `${vehicle.plateNumber} (${vehicle.make} ${vehicle.model})` : '',
                              });
                            }}
                            title="طباعة بطاقة العمل (Job Card)"
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <Printer className="w-3.5 h-3.5 text-blue-500" />
                          </button>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-2.5 py-1 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg font-bold cursor-pointer"
                          >
                            عرض
                          </button>
                          <button
                            onClick={() => setOrderToDelete(order)}
                            title="حذف بطاقة العمل"
                            className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
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

      {/* Detail Modal for Selected Work Order */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto" dir="rtl">
          <div className={`relative w-full max-w-4xl border rounded-2xl shadow-2xl my-8 overflow-hidden flex flex-col max-h-[90vh] ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-lg font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedOrder.orderNumber}</h3>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      {t[`status_${selectedOrder.status}` as keyof typeof t] || selectedOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    تاريخ الاستلام: {selectedOrder.createdAt} · مهندس الاستقبال: {selectedOrder.advisorName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setOrderToDelete(selectedOrder)}
                  title="حذف بطاقة العمل"
                  className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg cursor-pointer transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer card */}
                <div className={`p-4 rounded-xl border text-xs space-y-1 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="font-bold text-slate-400 text-[10px] uppercase">بيانات العميل</div>
                  <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {state.customers.find((c) => c.id === selectedOrder.customerId)?.nameAr ||
                     state.customers.find((c) => c.id === selectedOrder.customerId)?.name}
                  </div>
                  <div className="text-slate-400 font-mono" dir="ltr">
                    {state.customers.find((c) => c.id === selectedOrder.customerId)?.phone}
                  </div>
                </div>

                {/* Vehicle card */}
                <div className={`p-4 rounded-xl border text-xs space-y-1 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="font-bold text-slate-400 text-[10px] uppercase">بيانات المركبة</div>
                  <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {state.vehicles.find((v) => v.id === selectedOrder.vehicleId)?.make}{' '}
                    {state.vehicles.find((v) => v.id === selectedOrder.vehicleId)?.model} (
                    {state.vehicles.find((v) => v.id === selectedOrder.vehicleId)?.year})
                  </div>
                  <div className="text-slate-400 font-mono">
                    اللوحة: {state.vehicles.find((v) => v.id === selectedOrder.vehicleId)?.plateNumber} · العداد:{' '}
                    {selectedOrder.mileageIn.toLocaleString()} كم
                  </div>
                </div>
              </div>

              {/* Complaint & Diagnostic findings */}
              <div className={`p-4 rounded-xl border text-xs space-y-2 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="font-bold text-slate-400">شكوى العميل عند الدخول:</div>
                <p className={`leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{selectedOrder.customerComplaint}</p>
                {selectedOrder.diagnosisNotes && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="font-bold text-amber-500">نتيجة الفحص الفني والتشخيص: </span>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{selectedOrder.diagnosisNotes}</span>
                  </div>
                )}
              </div>

              {/* Technician Assignment */}
              <div className={`flex items-center justify-between p-3.5 rounded-xl border text-xs ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="font-bold text-slate-400">المهندس المسؤول:</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedOrder.assignedTechnicianName || 'غير مسند بعد'}
                  </span>
                </div>
                <select
                  value={selectedOrder.assignedTechnicianId || ''}
                  onChange={(e) => {
                    assignTechnician(selectedOrder.id, e.target.value);
                    const updated = state.serviceOrders.find((o) => o.id === selectedOrder.id);
                    if (updated) setSelectedOrder(updated);
                  }}
                  className={`p-2 rounded-lg border text-xs ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="">إعادة إسناد المهندس...</option>
                  {state.employees
                    .filter((e) => e.department === 'workshop')
                    .map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.nameAr || tech.name} ({tech.jobTitleAr || tech.jobTitle})
                      </option>
                    ))}
                </select>
              </div>

              {/* Labor Operations Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Wrench className="w-4 h-4 text-blue-500" />
                    <span>بنود المصنعيات وأجور الفنيين ({selectedOrder.laborItems.length})</span>
                  </h4>
                  <button
                    onClick={() => setIsAddingLabor(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة مصنعية</span>
                  </button>
                </div>

                {isAddingLabor && (
                  <form onSubmit={handleAddLaborSubmit} className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-slate-400 font-bold">بيان العملية الميكانيكية *</label>
                        <input
                          type="text"
                          required
                          value={laborDesc}
                          onChange={(e) => setLaborDesc(e.target.value)}
                          placeholder="مثال: فك وتركيب طنابير الفرامل وبرمجة الحساس"
                          className={`w-full p-2.5 rounded-xl border ${
                            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-slate-400 font-bold">ساعات العمل *</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          required
                          value={laborHours}
                          onChange={(e) => setLaborHours(Number(e.target.value))}
                          className={`w-full p-2.5 rounded-xl border font-mono ${
                            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingLabor(false)}
                        className="px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold cursor-pointer"
                      >
                        حفظ البند
                      </button>
                    </div>
                  </form>
                )}

                <div className={`border rounded-xl overflow-hidden ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <table className="w-full text-xs text-start">
                    <thead className={`border-b text-[11px] font-bold ${
                      isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      <tr>
                        <th className="py-2.5 px-3 text-start">العملية الميكانيكية</th>
                        <th className="py-2.5 px-3 text-center">الساعات</th>
                        <th className="py-2.5 px-3 text-end">سعر الساعة</th>
                        <th className="py-2.5 px-3 text-end">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                      {selectedOrder.laborItems.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-500">
                            لم يتم تسجيل مصنعيات بعد في أمر الشغل.
                          </td>
                        </tr>
                      ) : (
                        selectedOrder.laborItems.map((item) => (
                          <tr key={item.id}>
                            <td className={`py-2.5 px-3 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.description}</td>
                            <td className="py-2.5 px-3 text-center tabular-nums text-slate-400 font-mono">{item.hours} س</td>
                            <td className="py-2.5 px-3 text-end tabular-nums text-slate-400 font-mono">{item.hourlyRate} {t.currencySymbol}</td>
                            <td className={`py-2.5 px-3 text-end font-bold tabular-nums font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {item.total.toLocaleString()} {t.currencySymbol}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Spare Parts Issued Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Package className="w-4 h-4 text-amber-500" />
                    <span>قطع الغيار المنصرفة من المستودع ({selectedOrder.partsItems.length})</span>
                  </h4>
                  <button
                    onClick={() => setIsIssuingPart(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>صرف قطعة</span>
                  </button>
                </div>

                {issueError && (
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
                    {issueError}
                  </div>
                )}

                {isIssuingPart && (
                  <form onSubmit={handleIssuePartSubmit} className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-slate-400 font-bold">اختر صنف قطع الغيار *</label>
                        <select
                          required
                          value={selectedPartId}
                          onChange={(e) => setSelectedPartId(e.target.value)}
                          className={`w-full p-2.5 rounded-xl border ${
                            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        >
                          <option value="">اختر من كتالوج المستودع...</option>
                          {state.spareParts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nameAr || p.name} ({p.sku}) · المتاح: {p.currentStock} · {p.sellingPrice} {t.currencySymbol}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-slate-400 font-bold">الكمية المطلوبة *</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={partQty}
                          onChange={(e) => setPartQty(Number(e.target.value))}
                          className={`w-full p-2.5 rounded-xl border font-mono ${
                            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsIssuingPart(false)}
                        className="px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold cursor-pointer"
                      >
                        تأكيد وصرف
                      </button>
                    </div>
                  </form>
                )}

                <div className={`border rounded-xl overflow-hidden ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <table className="w-full text-xs text-start">
                    <thead className={`border-b text-[11px] font-bold ${
                      isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      <tr>
                        <th className="py-2.5 px-3 text-start">اسم القطعة والكود</th>
                        <th className="py-2.5 px-3 text-center">الكمية</th>
                        <th className="py-2.5 px-3 text-end">سعر الوحدة</th>
                        <th className="py-2.5 px-3 text-end">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                      {selectedOrder.partsItems.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-500">
                            لم يتم صرف قطع غيار لكارت الشغل بعد.
                          </td>
                        </tr>
                      ) : (
                        selectedOrder.partsItems.map((part) => (
                          <tr key={part.id}>
                            <td className="py-2.5 px-3">
                              <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{part.partName}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{part.partSku}</div>
                            </td>
                            <td className="py-2.5 px-3 text-center tabular-nums text-slate-400 font-mono">{part.quantity}</td>
                            <td className="py-2.5 px-3 text-end tabular-nums text-slate-400 font-mono">
                              {part.unitPrice.toLocaleString()} {t.currencySymbol}
                            </td>
                            <td className={`py-2.5 px-3 text-end font-bold tabular-nums font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {part.total.toLocaleString()} {t.currencySymbol}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status Transition & Next Step */}
              <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="font-bold text-xs text-slate-400">
                  ترقية مرحلة العمل (دورة حياة أمر الشغل):
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.status === 'received' && (
                    <button
                      onClick={() => handleAdvanceStatus('awaiting_inspection')}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      بدء مرحلة الفحص الميكانيكي
                    </button>
                  )}
                  {selectedOrder.status === 'awaiting_inspection' && (
                    <button
                      onClick={() => handleAdvanceStatus('awaiting_approval')}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      إرسال المقايسة لموافقة العميل
                    </button>
                  )}
                  {selectedOrder.status === 'awaiting_approval' && (
                    <button
                      onClick={() => handleAdvanceStatus('approved')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      تم اعتماد العميل للمقايسة
                    </button>
                  )}
                  {selectedOrder.status === 'approved' && (
                    <button
                      onClick={() => handleAdvanceStatus('in_progress')}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      إدخال السيارة للرافعة وبدء التنفيذ
                    </button>
                  )}
                  {selectedOrder.status === 'in_progress' && (
                    <>
                      <button
                        onClick={() => handleAdvanceStatus('waiting_parts')}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        تعليق: بانتظار توريد قطع غيار
                      </button>
                      <button
                        onClick={() => handleAdvanceStatus('quality_inspection')}
                        className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        انتهاء الشغل · طلب تجربة الجودة QC
                      </button>
                    </>
                  )}
                  {selectedOrder.status === 'waiting_parts' && (
                    <button
                      onClick={() => handleAdvanceStatus('in_progress')}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      استئناف العمل (وصلت القطع)
                    </button>
                  )}
                  {selectedOrder.status === 'quality_inspection' && (
                    <button
                      onClick={() => handleAdvanceStatus('ready_for_delivery')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      اجتازت الجودة · جاهزة للتسليم للعميل
                    </button>
                  )}
                  {selectedOrder.status === 'ready_for_delivery' && (
                    <button
                      onClick={() => handleAdvanceStatus('completed')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      تم تسليم السيارة للعميل بالكامل
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className={`p-4 border-t flex flex-wrap items-center justify-between gap-3 ${
              isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const vehicle = state.vehicles.find((v) => v.id === selectedOrder.vehicleId);
                    const customer = state.customers.find((c) => c.id === selectedOrder.customerId);
                    printDocument('job_card', {
                      ...selectedOrder,
                      customerName: customer?.nameAr || customer?.name,
                      vehiclePlate: vehicle ? `${vehicle.plateNumber} (${vehicle.make} ${vehicle.model})` : '',
                    });
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة بطاقة العمل (Job Card)</span>
                </button>
                <button
                  onClick={handleGenerateInvoice}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  <Receipt className="w-4 h-4" />
                  <span>إصدار فاتورة ضريبية</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4" dir="rtl">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base">تأكيد حذف أمر الشغل</h3>
              <p className="text-xs text-slate-400">
                هل أنت متأكد من حذف بطاقة العمل رقم{' '}
                <span className="font-bold text-white font-mono">
                  "{orderToDelete.orderNumber}"
                </span>؟
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteServiceOrder(orderToDelete.id);
                  if (selectedOrder?.id === orderToDelete.id) {
                    setSelectedOrder(null);
                  }
                  setOrderToDelete(null);
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
