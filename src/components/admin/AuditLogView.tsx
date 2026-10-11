import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCSV } from '../../utils/exportUtils';
import {
  History,
  Search,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { state, printDocument, theme } = useApp();
  const [search, setSearch] = useState('');
  const isDark = theme === 'dark';

  const filteredLogs = state.auditLogs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.entity.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    exportToCSV(
      filteredLogs.map((log) => ({
        'التوقيت': log.timestamp,
        'المستخدم القائم بالعملية': log.userName,
        'الدور والصلاحية': log.userRole,
        'نوع العملية': log.action,
        'القسم / الكيان': log.entity,
        'رقم المرجع': log.entityId,
        'تفاصيل الإجراء': log.details,
      })),
      `سجل_الرقابة_مركز_صيانة_التجمع_الخامس_${new Date().toISOString().substring(0, 10)}`
    );
  };

  const handlePrint = () => {
    printDocument('audit_report', {
      logs: filteredLogs,
      title: 'سجل الرقابة والتتبع الأمني',
      date: new Date().toISOString().substring(0, 10),
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Title */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <History className="w-6 h-6 text-blue-500" />
            <span>سجل الرقابة وتتبع العمليات</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            سجل التتبع والتدقيق الأمني: توثيق دقيق لكافة عمليات الصيانة، الفواتير، وحركات المخزن مع اسم المستخدم والتوقيت
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md shadow-blue-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة السجل</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث باسم المستخدم، نوع العملية، الكيان أو التفاصيل..."
          className={`w-full ps-10 pe-4 py-2.5 rounded-xl border text-xs ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500'
              : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 shadow-xs'
          }`}
        />
      </div>

      {/* Table */}
      <div className={`border rounded-2xl overflow-hidden shadow-lg ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'border-slate-800 bg-slate-950/70 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}>
                <th className="py-3.5 px-4 text-start">التوقيت والتاريخ</th>
                <th className="py-3.5 px-4 text-start">المستخدم المسؤول</th>
                <th className="py-3.5 px-4 text-start">نوع الإجراء</th>
                <th className="py-3.5 px-4 text-start">القسم / الكيان</th>
                <th className="py-3.5 px-4 text-start">رقم المرجع</th>
                <th className="py-3.5 px-4 text-start">تفاصيل التعديل</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    لا توجد سجلات مطابقة لعملية البحث
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                    <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3.5 px-4">
                      <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{log.userName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{log.userRole}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">{log.entity}</td>
                    <td className={`py-3.5 px-4 font-mono font-bold text-[11px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {log.entityId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 leading-relaxed max-w-lg">
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{log.details}</span>
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
