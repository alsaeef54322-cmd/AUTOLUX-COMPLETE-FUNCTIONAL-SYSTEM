import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee, AttendanceRecord, PayrollRecord } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';
import {
  UserCheck,
  CalendarCheck,
  Coins,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Calendar,
  X,
  Phone,
  Mail,
  Shield,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  AlertTriangle,
  Briefcase,
  DollarSign,
  User,
} from 'lucide-react';

const DEPARTMENTS = [
  { id: 'workshop', label: 'الورشة والصيانة الميكانيكية' },
  { id: 'reception', label: 'الاستقبال وخدمة العملاء' },
  { id: 'parts', label: 'مخزن وقطع الغيار' },
  { id: 'accounting', label: 'الحسابات والمالية' },
  { id: 'management', label: 'الإدارة والتشغيل' },
  { id: 'hr', label: 'الموارد البشرية' },
];

const JOB_TITLES_PRESETS = [
  'مهندس صيانة أول / مدير الورشة',
  'مهندس ميكانيكا محركات وتشخيص',
  'فني كهرباء سيارات وبرمجة كنترول',
  'فني عفشة وميزان وهيدروليك',
  'فني تكييف وتبريد محركات',
  'فني فحص جودة واختبار قيادة',
  'مهندس استقبال واستشاري خدمة',
  'أمين مخزن قطع غيار ومستلزمات',
  'محاسب مالي وخزينة',
];

export const EmployeesView: React.FC = () => {
  const {
    state,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    toggleCheckIn,
    approveLeaveRequest,
    printDocument,
    theme,
  } = useApp();

  const [subTab, setSubTab] = useState<'roster' | 'attendance' | 'payroll'>('roster');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formJobTitle, setFormJobTitle] = useState(JOB_TITLES_PRESETS[1]);
  const [formDepartment, setFormDepartment] = useState<'workshop' | 'reception' | 'management' | 'accounting' | 'parts' | 'hr'>('workshop');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSalary, setFormSalary] = useState(12000);
  const [formHireDate, setFormHireDate] = useState(new Date().toISOString().substring(0, 10));
  const [formStatus, setFormStatus] = useState<'active' | 'on_leave' | 'terminated'>('active');
  const [formError, setFormError] = useState('');

  const today = new Date().toISOString().substring(0, 10);
  const isDark = theme === 'dark';

  const filteredEmployees = state.employees.filter((emp) => {
    if (deptFilter !== 'all' && emp.department !== deptFilter) return false;
    if (statusFilter !== 'all' && emp.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      emp.name.toLowerCase().includes(q) ||
      (emp.nameAr && emp.nameAr.toLowerCase().includes(q)) ||
      (emp.jobTitleAr && emp.jobTitleAr.toLowerCase().includes(q)) ||
      emp.jobTitle.toLowerCase().includes(q) ||
      emp.phone.includes(q) ||
      emp.employeeNumber.toLowerCase().includes(q)
    );
  });

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormName('');
    setFormJobTitle(JOB_TITLES_PRESETS[1]);
    setFormDepartment('workshop');
    setFormPhone('');
    setFormEmail('');
    setFormSalary(12000);
    setFormHireDate(new Date().toISOString().substring(0, 10));
    setFormStatus('active');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormName(emp.nameAr || emp.name);
    setFormJobTitle(emp.jobTitleAr || emp.jobTitle);
    setFormDepartment(emp.department);
    setFormPhone(emp.phone);
    setFormEmail(emp.email);
    setFormSalary(emp.monthlySalary);
    setFormHireDate(emp.hireDate);
    setFormStatus(emp.status);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim() || !formPhone.trim() || !formJobTitle.trim()) {
      setFormError('يرجى ملء جميع الحقول المطلوبة (الاسم، الوظيفة، ورقم الهاتف).');
      return;
    }

    if (editingEmployee) {
      updateEmployee({
        ...editingEmployee,
        name: formName.trim(),
        nameAr: formName.trim(),
        jobTitle: formJobTitle.trim(),
        jobTitleAr: formJobTitle.trim(),
        department: formDepartment,
        phone: formPhone.trim(),
        email: formEmail.trim() || `${formPhone.trim()}@tagamoa-care.eg`,
        monthlySalary: Number(formSalary) || 0,
        hireDate: formHireDate,
        status: formStatus,
      });
    } else {
      createEmployee({
        name: formName.trim(),
        nameAr: formName.trim(),
        role: formDepartment === 'workshop' ? 'technician' : 'receptionist',
        jobTitle: formJobTitle.trim(),
        jobTitleAr: formJobTitle.trim(),
        department: formDepartment,
        phone: formPhone.trim(),
        email: formEmail.trim() || `${formPhone.trim()}@tagamoa-care.eg`,
        monthlySalary: Number(formSalary) || 0,
        hireDate: formHireDate,
        status: formStatus,
      });
    }

    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (!employeeToDelete) return;
    const res = deleteEmployee(employeeToDelete.id);
    if (!res.success) {
      alert(res.error);
    }
    setEmployeeToDelete(null);
  };

  const handleExportExcel = () => {
    exportToCSV(
      'موظفو_وفنيو_مركز_صيانة_التجمع_الخامس',
      [
        { header: 'كود الموظف', key: (e) => e.employeeNumber },
        { header: 'الاسم الكامل', key: (e) => e.nameAr || e.name },
        { header: 'المسمى الوظيفي / التخصص', key: (e) => e.jobTitleAr || e.jobTitle },
        { header: 'القسم', key: (e) => DEPARTMENTS.find((d) => d.id === e.department)?.label || e.department },
        { header: 'رقم الهاتف', key: (e) => e.phone },
        { header: 'الراتب الشهري (ج.م)', key: (e) => e.monthlySalary },
        { header: 'تاريخ الانضمام', key: (e) => e.hireDate },
        {
          header: 'حالة العمل',
          key: (e) => (e.status === 'active' ? 'على رأس العمل' : e.status === 'on_leave' ? 'إجازة' : 'متوقف'),
        },
      ],
      filteredEmployees
    );
  };

  const handlePrintEmployees = () => {
    printDocument('employees_report', {
      title: 'كشف فريق العمل والمهندسين والفنيين',
      employees: filteredEmployees,
      totalCount: filteredEmployees.length,
      printDate: new Date().toLocaleDateString('ar-EG'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Toolbar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <UserCheck className="w-6 h-6 text-blue-500" />
            <span>إدارة الموظفين وفريق العمل</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            مركز صيانة التجمع الخامس · سجل المهندسين والفنيين، بيانات الرواتب، وسجل الحضور اليومي
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-tabs */}
          <div className={`flex items-center p-1 rounded-xl border text-xs font-semibold ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
            <button
              onClick={() => setSubTab('roster')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                subTab === 'roster' ? 'bg-blue-600 text-white shadow-xs' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              دليل الموظفين ({state.employees.length})
            </button>
            <button
              onClick={() => setSubTab('attendance')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                subTab === 'attendance' ? 'bg-blue-600 text-white shadow-xs' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الحضور والانصراف
            </button>
            <button
              onClick={() => setSubTab('payroll')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                subTab === 'payroll' ? 'bg-blue-600 text-white shadow-xs' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مسيرات الرواتب
            </button>
          </div>

          {subTab === 'roster' && (
            <>
              <button
                onClick={handlePrintEmployees}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
                }`}
                title="طباعة كشف الموظفين"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span>طباعة</span>
              </button>

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
                <span>إضافة موظف جديد</span>
              </button>
            </>
          )}
        </div>
      </div>

      {subTab === 'roster' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث باسم الموظف، المسمى الوظيفي، أو رقم الهاتف..."
                className={`w-full ps-9 pe-3 py-2.5 rounded-xl text-xs border focus:outline-hidden transition-colors ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500'
                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 shadow-xs'
                }`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className={`text-xs rounded-xl px-3 py-2 border focus:outline-hidden ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                }`}
              >
                <option value="all">كافة الأقسام</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`text-xs rounded-xl px-3 py-2 border focus:outline-hidden ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                }`}
              >
                <option value="all">كافة الحالات</option>
                <option value="active">على رأس العمل</option>
                <option value="on_leave">في إجازة</option>
                <option value="terminated">متوقف</option>
              </select>
            </div>
          </div>

          {/* Employees Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => {
              const todayAtt = state.attendance.find((a) => a.employeeId === emp.id && a.date === today);
              const deptLabel = DEPARTMENTS.find((d) => d.id === emp.department)?.label || emp.department;

              return (
                <div
                  key={emp.id}
                  className={`rounded-2xl border p-5 shadow-lg relative flex flex-col justify-between transition-all hover:scale-[1.01] ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header: Photo, Name, Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {emp.avatarUrl ? (
                          <img
                            src={emp.avatarUrl}
                            alt={emp.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                            {emp.name.charAt(0)}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm leading-snug">
                              {emp.nameAr || emp.name}
                            </h3>
                          </div>
                          <p className="text-xs text-blue-500 font-medium mt-0.5">
                            {emp.jobTitleAr || emp.jobTitle}
                          </p>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {emp.employeeNumber} · {deptLabel}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                          emp.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : emp.status === 'on_leave'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {emp.status === 'active' ? 'على رأس العمل' : emp.status === 'on_leave' ? 'إجازة' : 'متوقف'}
                      </span>
                    </div>

                    {/* Details Box */}
                    <div className={`p-3 rounded-xl space-y-2 text-xs border ${isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>رقم الهاتف:</span>
                        </span>
                        <span className="font-mono text-slate-300 font-medium" dir="ltr">
                          {emp.phone}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                          <span>الراتب الشهري:</span>
                        </span>
                        <span className="font-bold text-emerald-400 font-mono">
                          {emp.monthlySalary?.toLocaleString()} ج.م
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>تاريخ الانضمام:</span>
                        </span>
                        <span className="font-mono text-slate-300">
                          {emp.hireDate}
                        </span>
                      </div>
                    </div>

                    {/* Today Attendance Status Indicator */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[11px] text-slate-400">تسجيل اليوم:</span>
                      {todayAtt ? (
                        <div className="flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>حاضر ({todayAtt.checkIn})</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>لم يسجل حضوراً</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className={`mt-4 pt-3 border-t flex items-center justify-between gap-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <button
                      onClick={() => toggleCheckIn(emp.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                        todayAtt
                          ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                          : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {todayAtt ? (todayAtt.checkOut ? `انصرف ${todayAtt.checkOut}` : 'تسجيل انصراف') : 'تسجيل حضور الآن'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(emp)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        title="تعديل بيانات الموظف"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setEmployeeToDelete(emp)}
                        className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="حذف الموظف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subTab === 'attendance' && (
        /* Attendance History View */
        <div className={`rounded-xl border overflow-hidden shadow-lg ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              سجل الحضور والانصراف اليومي لفريق العمل
            </h3>
            <span className="text-xs text-blue-400 font-mono">اليوم: {today}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className={`border-b text-[11px] font-semibold ${isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                  <th className="py-3 px-4 text-start">الموظف</th>
                  <th className="py-3 px-3 text-start">التاريخ</th>
                  <th className="py-3 px-3 text-start">وقت الحضور</th>
                  <th className="py-3 px-3 text-start">وقت الانصراف</th>
                  <th className="py-3 px-3 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                {state.attendance.map((rec) => (
                  <tr key={rec.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                    <td className={`py-3 px-4 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {rec.employeeName}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">{rec.date}</td>
                    <td className="py-3 px-3 font-mono text-emerald-400">{rec.checkIn || '-'}</td>
                    <td className="py-3 px-3 font-mono text-blue-400">{rec.checkOut || '-'}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        حاضر
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'payroll' && (
        /* Payroll Table View */
        <div className={`rounded-xl border overflow-hidden shadow-lg ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              مسيرات الرواتب الشهرية والبدلات
            </h3>
            <span className="text-xs text-emerald-400 font-semibold">
              إجمالي الرواتب: {state.employees.reduce((sum, e) => sum + e.monthlySalary, 0).toLocaleString()} ج.م
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className={`border-b text-[11px] font-semibold ${isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                  <th className="py-3 px-4 text-start">الموظف</th>
                  <th className="py-3 px-3 text-start">الوظيفة / التخصص</th>
                  <th className="py-3 px-3 text-start">الراتب الأساسي</th>
                  <th className="py-3 px-3 text-start">الحوافز والبدلات</th>
                  <th className="py-3 px-3 text-start">الاستقطاعات</th>
                  <th className="py-3 px-3 text-start">صافي الراتب</th>
                  <th className="py-3 px-3 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                {state.employees.map((emp) => (
                  <tr key={emp.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                    <td className={`py-3 px-4 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {emp.nameAr || emp.name}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{emp.jobTitleAr || emp.jobTitle}</td>
                    <td className="py-3 px-3 font-mono font-medium">{emp.monthlySalary.toLocaleString()} ج.م</td>
                    <td className="py-3 px-3 font-mono text-emerald-400">+1,500 ج.م</td>
                    <td className="py-3 px-3 font-mono text-rose-400">-0 ج.م</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      {(emp.monthlySalary + 1500).toLocaleString()} ج.م
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        معتمد للصرف
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border p-6 my-8 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base">
                  {editingEmployee ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد إلى المركز'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold block text-slate-300">
                  الاسم الكامل للموظف أو المهندس *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: م. أحمد السعيد"
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                  }`}
                />
              </div>

              {/* Job Title & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold block text-slate-300">
                    المسمى الوظيفي / التخصص *
                  </label>
                  <input
                    type="text"
                    required
                    value={formJobTitle}
                    onChange={(e) => setFormJobTitle(e.target.value)}
                    placeholder="مثال: مهندس تشخيص أعطال"
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold block text-slate-300">
                    القسم
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value as any)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold block text-slate-300">
                    رقم الهاتف *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold block text-slate-300">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="emp@tagamoa-care.eg"
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  />
                </div>
              </div>

              {/* Salary & Hire Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold block text-slate-300">
                    الراتب الشهري (ج.م) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formSalary}
                    onChange={(e) => setFormSalary(Number(e.target.value))}
                    min={0}
                    step={500}
                    className={`w-full px-3 py-2 text-xs rounded-xl border font-mono focus:outline-hidden ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold block text-slate-300">
                    تاريخ الانضمام *
                  </label>
                  <input
                    type="date"
                    required
                    value={formHireDate}
                    onChange={(e) => setFormHireDate(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border font-mono focus:outline-hidden ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-semibold block text-slate-300">
                  حالة العمل
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                  }`}
                >
                  <option value="active">على رأس العمل (نشط)</option>
                  <option value="on_leave">في إجازة رسمية</option>
                  <option value="terminated">موقوف / منهي الخدمة</option>
                </select>
              </div>

              {/* Buttons */}
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
                  {editingEmployee ? 'حفظ التعديلات' : 'إضافة الموظف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base">تأكيد حذف الموظف</h3>
              <p className="text-xs text-slate-400">
                هل أنت متأكد من حذف بيانات الموظف{' '}
                <span className="font-bold text-white">
                  "{employeeToDelete.nameAr || employeeToDelete.name}"
                </span>{' '}
                ({employeeToDelete.employeeNumber})؟
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEmployeeToDelete(null)}
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
