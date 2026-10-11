import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceOrderStatus } from '../../types';
import {
  Kanban,
  Car,
  User,
  Wrench,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

const COLUMNS: { id: ServiceOrderStatus; title: string; color: string }[] = [
  { id: 'received', title: 'تم الاستلام', color: 'border-blue-500' },
  { id: 'awaiting_inspection', title: 'الفحص الميكانيكي', color: 'border-indigo-500' },
  { id: 'awaiting_approval', title: 'بانتظار موافقة العميل', color: 'border-purple-500' },
  { id: 'approved', title: 'معتمد للعمل', color: 'border-sky-500' },
  { id: 'in_progress', title: 'قيد التنفيذ على الرافعة', color: 'border-blue-400' },
  { id: 'waiting_parts', title: 'في انتظار القطع', color: 'border-amber-500' },
  { id: 'quality_inspection', title: 'اختبار الجودة QC', color: 'border-teal-500' },
  { id: 'ready_for_delivery', title: 'جاهز لتسليم العميل', color: 'border-emerald-500' },
];

export const WorkshopBoardView: React.FC = () => {
  const { state, updateServiceOrderStatus, theme, t } = useApp();
  const [selectedTechFilter, setSelectedTechFilter] = useState<string>('all');
  const isDark = theme === 'dark';

  const filteredOrders = state.serviceOrders.filter((order) => {
    if (selectedTechFilter !== 'all' && order.assignedTechnicianId !== selectedTechFilter) {
      return false;
    }
    return order.status !== 'completed' && order.status !== 'cancelled';
  });

  const getNextStatus = (current: ServiceOrderStatus): ServiceOrderStatus | null => {
    switch (current) {
      case 'received':
        return 'awaiting_inspection';
      case 'awaiting_inspection':
        return 'awaiting_approval';
      case 'awaiting_approval':
        return 'approved';
      case 'approved':
        return 'in_progress';
      case 'in_progress':
        return 'quality_inspection';
      case 'waiting_parts':
        return 'in_progress';
      case 'quality_inspection':
        return 'ready_for_delivery';
      case 'ready_for_delivery':
        return 'completed';
      default:
        return null;
    }
  };

  const getPrevStatus = (current: ServiceOrderStatus): ServiceOrderStatus | null => {
    switch (current) {
      case 'awaiting_inspection':
        return 'received';
      case 'awaiting_approval':
        return 'awaiting_inspection';
      case 'approved':
        return 'awaiting_approval';
      case 'in_progress':
        return 'approved';
      case 'quality_inspection':
        return 'in_progress';
      case 'ready_for_delivery':
        return 'quality_inspection';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header & Filter Controls */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Kanban className="w-6 h-6 text-blue-500" />
            <span>لوحة الورشة الفنية (Workshop Kanban)</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            متابعة بصرية فورية لمسار السيارات عبر مراحل ورشة التجمع الخامس من الدخول حتى التسليم
          </p>
        </div>

        {/* Technician Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold whitespace-nowrap">تصفية حسب المهندس المسؤول:</span>
          <select
            value={selectedTechFilter}
            onChange={(e) => setSelectedTechFilter(e.target.value)}
            className={`p-2 rounded-xl border text-xs ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
            }`}
          >
            <option value="all">كافة المهندسين والفنيين ({state.employees.filter((e) => e.department === 'workshop').length})</option>
            {state.employees
              .filter((e) => e.department === 'workshop')
              .map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.nameAr || tech.name} ({tech.jobTitleAr || tech.jobTitle})
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Horizontal Scrollable Kanban Columns */}
      <div className="flex items-start gap-4 overflow-x-auto pb-6 min-h-[600px]">
        {COLUMNS.map((col) => {
          const colOrders = filteredOrders.filter((o) => o.status === col.id);
          return (
            <div
              key={col.id}
              className={`w-72 shrink-0 border rounded-2xl flex flex-col max-h-[780px] ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              {/* Column Header */}
              <div className={`p-3.5 border-b flex items-center justify-between border-t-4 rounded-t-2xl ${col.color} ${
                isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
              }`}>
                <div>
                  <h3 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {col.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {colOrders.length} سيارات
                  </span>
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {colOrders.length === 0 ? (
                  <div className="py-10 text-center text-[11px] text-slate-500 border border-dashed border-slate-700/60 rounded-xl">
                    لا توجد سيارات في هذه المرحلة
                  </div>
                ) : (
                  colOrders.map((order) => {
                    const vehicle = state.vehicles.find((v) => v.id === order.vehicleId);
                    const customer = state.customers.find((c) => c.id === order.customerId);
                    const nextSt = getNextStatus(order.status);
                    const prevSt = getPrevStatus(order.status);

                    return (
                      <div
                        key={order.id}
                        className={`p-3.5 rounded-xl border text-xs space-y-2.5 transition-all shadow-xs ${
                          isDark ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Top: WO# and Priority */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-blue-500 text-xs">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              order.priority === 'critical'
                                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                                : order.priority === 'urgent'
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                                : 'bg-slate-500/10 text-slate-400'
                            }`}
                          >
                            {order.priority === 'critical' ? 'حرجة' : order.priority === 'urgent' ? 'عاجلة' : 'عادية'}
                          </span>
                        </div>

                        {/* Vehicle & Plate */}
                        <div>
                          <div className={`font-bold text-xs truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {vehicle ? `${vehicle.make} ${vehicle.model}` : 'مركبة'}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {vehicle?.plateNumber} · {order.mileageIn.toLocaleString()} كم
                          </div>
                        </div>

                        {/* Customer */}
                        <div className="text-[11px] text-slate-400 truncate">
                          العميل: <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{customer?.nameAr || customer?.name}</span>
                        </div>

                        {/* Complaint summary */}
                        <p className={`text-[11px] line-clamp-2 leading-relaxed p-2 rounded-lg ${
                          isDark ? 'bg-slate-900 text-slate-300' : 'bg-white border border-slate-200 text-slate-700'
                        }`}>
                          {order.customerComplaint}
                        </p>

                        {/* Lead Tech */}
                        <div className={`flex items-center justify-between text-[11px] pt-2 border-t ${
                          isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
                        }`}>
                          <span className="flex items-center gap-1 truncate max-w-[140px]">
                            <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate">{order.assignedTechnicianName || 'غير مسند'}</span>
                          </span>
                          <span className={`font-bold font-mono tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {(order.actualTotal > 0 ? order.actualTotal : order.estimatedTotal).toLocaleString()}{' '}
                            {t.currencySymbol}
                          </span>
                        </div>

                        {/* Status Advancement Controls */}
                        <div className="flex items-center justify-between pt-1 gap-1">
                          {prevSt ? (
                            <button
                              onClick={() => updateServiceOrderStatus(order.id, prevSt)}
                              title="إرجاع للمرحلة السابقة"
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                              }`}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          ) : (
                            <div className="w-5" />
                          )}

                          {nextSt && (
                            <button
                              onClick={() => updateServiceOrderStatus(order.id, nextSt)}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer shadow-xs"
                            >
                              <span>ترقية المرحلة</span>
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
