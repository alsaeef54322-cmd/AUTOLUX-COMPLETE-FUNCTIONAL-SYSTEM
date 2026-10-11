import React, { useState, useMemo, useEffect } from 'react';
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
  Check,
  Clock3,
  XCircle,
  FileText,
  UserMinus,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Percent,
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
  'أخصائي موارد بشرية وشؤون عاملين',
];

export const EmployeesView: React.FC = () => {
  const {
    state,
    activeTab,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    toggleCheckIn,
    setAttendanceStatus,
    savePayrollRecord,
    approveLeaveRequest,
    printDocument,
    theme,
  } = useApp();

  const [subTab, setSubTab] = useState<'roster' | 'attendance' | 'payroll'>(() => {
    if (activeTab === 'payroll') return 'payroll';
    if (activeTab === 'employees') return 'roster';
    return 'attendance';
  });

  useEffect(() => {
    if (activeTab === 'payroll') {
      setSubTab('payroll');
    } else if (activeTab === 'attendance') {
      setSubTab('attendance');
    } else if (activeTab === 'employees') {
      setSubTab('roster');
    }
  }, [activeTab]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Attendance states
  const todayStr = new Date().toISOString().substring(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [editingAttendanceRecord, setEditingAttendanceRecord] = useState<{
    employeeId: string;
    employeeName: string;
    checkIn: string;
    checkOut: string;
    overtimeHours: number;
    delayMinutes: number;
    status: 'present' | 'absent' | 'late' | 'leave';
    notes: string;
  } | null>(null);

  // Payroll states
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM
  const [selectedPayrollMonth, setSelectedPayrollMonth] = useState<string>(currentMonthStr);
  const [standardWorkingDays, setStandardWorkingDays] = useState<number>(26);
  const [editingPayrollRecord, setEditingPayrollRecord] = useState<{
    employeeId: string;
    employeeName: string;
    jobTitle: string;
    basicSalary: number;
    attendedDays: number;
    allowances: number;
    overtimeHours: number;
    overtimePay: number;
    deductions: number;
    status: 'draft' | 'approved' | 'paid';
    notes: string;
  } | null>(null);

  // Employee Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Employee Form Fields
  const [formName, setFormName] = useState('');
  const [formJobTitle, setFormJobTitle] = useState(JOB_TITLES_PRESETS[1]);
  const [formDepartment, setFormDepartment] = useState<'workshop' | 'reception' | 'management' | 'accounting' | 'parts' | 'hr'>('workshop');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSalary, setFormSalary] = useState(15000);
  const [formHireDate, setFormHireDate] = useState(todayStr);
  const [formStatus, setFormStatus] = useState<'active' | 'on_leave' | 'terminated'>('active');
  const [formError, setFormError] = useState('');

  const isDark = theme === 'dark';

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return state.employees.filter((emp) => {
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
  }, [state.employees, deptFilter, statusFilter, search]);

  // Map of attendance for the selected date
  const dateAttendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    state.attendance.forEach((rec) => {
      if (rec.date === selectedDate) {
        map.set(rec.employeeId, rec);
      }
    });
    return map;
  }, [state.attendance, selectedDate]);

  // Calculate attended days count per employee for the active month
  const monthlyAttendedDaysMap = useMemo(() => {
    const map = new Map<string, number>();
    state.attendance.forEach((rec) => {
      if (rec.date.startsWith(selectedPayrollMonth)) {
        if (rec.status === 'present' || rec.status === 'late') {
          map.set(rec.employeeId, (map.get(rec.employeeId) || 0) + 1);
        }
      }
    });
    return map;
  }, [state.attendance, selectedPayrollMonth]);

  // Calculate monthly overtime hours per employee
  const monthlyOvertimeHoursMap = useMemo(() => {
    const map = new Map<string, number>();
    state.attendance.forEach((rec) => {
      if (rec.date.startsWith(selectedPayrollMonth) && rec.overtimeHours) {
        map.set(rec.employeeId, (map.get(rec.employeeId) || 0) + rec.overtimeHours);
      }
    });
    return map;
  }, [state.attendance, selectedPayrollMonth]);

  // Daily attendance statistics
  const dailyAttendanceStats = useMemo(() => {
    let present = 0;
    let late = 0;
    let absent = 0;
    let leave = 0;

    state.employees.forEach((emp) => {
      const rec = dateAttendanceMap.get(emp.id);
      if (!rec) {
        // default when not logged
        absent += 1;
      } else if (rec.status === 'present') {
        present += 1;
      } else if (rec.status === 'late') {
        late += 1;
      } else if (rec.status === 'leave') {
        leave += 1;
      } else {
        absent += 1;
      }
    });

    const total = state.employees.length || 1;
    const attended = present + late;
    const rate = Math.round((attended / total) * 100);

    return { total, present, late, absent, leave, rate };
  }, [state.employees, dateAttendanceMap]);

  // Formatted calculated Payroll Records for all employees
  const calculatedPayrollRecords = useMemo(() => {
    return state.employees.map((emp) => {
      // Check existing custom/stored record in state.payrollRecords
      const existing = state.payrollRecords.find(
        (p) => p.employeeId === emp.id && p.payrollMonth === selectedPayrollMonth
      );

      // Auto-calculated attended days (defaults to 26 if no logs or full presence)
      const recordedAttendedDays = monthlyAttendedDaysMap.get(emp.id);
      const attendedDays = recordedAttendedDays !== undefined ? recordedAttendedDays : 26;

      const basicSalary = emp.monthlySalary || 15000;
      const dailyRate = Math.round(basicSalary / standardWorkingDays);
      const hourlyRate = Math.round(dailyRate / 8);

      // Overtime
      const overtimeHours = monthlyOvertimeHoursMap.get(emp.id) || existing?.overtimeHours || 0;
      const calculatedOvertimePay = Math.round(overtimeHours * hourlyRate * 1.5);
      const overtimePay = existing?.overtimePay !== undefined ? existing.overtimePay : calculatedOvertimePay;

      // Allowances
      const allowances = existing?.allowances !== undefined ? existing.allowances : 1500;

      // Absence penalty if attended < standardWorkingDays
      const absenceDeduction = attendedDays < standardWorkingDays ? (standardWorkingDays - attendedDays) * dailyRate : 0;
      const customDeductions = existing?.deductions !== undefined ? existing.deductions : 0;
      const deductions = customDeductions + absenceDeduction;

      // Net Salary
      const netSalary = Math.max(0, basicSalary + allowances + overtimePay - deductions);

      return {
        id: existing?.id || `calc-${emp.id}-${selectedPayrollMonth}`,
        payrollMonth: selectedPayrollMonth,
        employeeId: emp.id,
        employeeNumber: emp.employeeNumber,
        employeeName: emp.nameAr || emp.name,
        jobTitle: emp.jobTitleAr || emp.jobTitle,
        department: emp.department,
        basicSalary,
        attendedDays,
        totalWorkingDays: standardWorkingDays,
        allowances,
        overtimeHours,
        overtimePay,
        deductions,
        netSalary,
        status: existing?.status || 'draft',
        paidDate: existing?.paidDate,
        paymentMethod: existing?.paymentMethod || 'تحويل بنكي (CIB)',
      };
    });
  }, [state.employees, state.payrollRecords, selectedPayrollMonth, monthlyAttendedDaysMap, monthlyOvertimeHoursMap, standardWorkingDays]);

  // Payroll summary totals
  const payrollTotals = useMemo(() => {
    const totalBasic = calculatedPayrollRecords.reduce((s, r) => s + r.basicSalary, 0);
    const totalAllowances = calculatedPayrollRecords.reduce((s, r) => s + r.allowances + (r.overtimePay || 0), 0);
    const totalDeductions = calculatedPayrollRecords.reduce((s, r) => s + r.deductions, 0);
    const totalNet = calculatedPayrollRecords.reduce((s, r) => s + r.netSalary, 0);

    return { totalBasic, totalAllowances, totalDeductions, totalNet };
  }, [calculatedPayrollRecords]);

  // Attendance status quick click handler
  const handleSetQuickStatus = (empId: string, status: 'present' | 'absent' | 'late' | 'leave') => {
    setAttendanceStatus({
      employeeId: empId,
      date: selectedDate,
      status,
      checkIn: status === 'present' ? '08:30' : status === 'late' ? '09:20' : undefined,
      checkOut: status === 'present' ? '17:30' : status === 'late' ? '17:30' : undefined,
      delayMinutes: status === 'late' ? 30 : 0,
      overtimeHours: 0,
    });
  };

  // Mark all active employees as present today
  const handleMarkAllPresent = () => {
    state.employees.forEach((emp) => {
      setAttendanceStatus({
        employeeId: emp.id,
        date: selectedDate,
        status: 'present',
        checkIn: '08:30',
        checkOut: '17:30',
      });
    });
  };

  // Open detailed attendance editor
  const handleOpenEditAttendance = (emp: Employee) => {
    const rec = dateAttendanceMap.get(emp.id);
    setEditingAttendanceRecord({
      employeeId: emp.id,
      employeeName: emp.nameAr || emp.name,
      checkIn: rec?.checkIn || '08:30',
      checkOut: rec?.checkOut || '17:30',
      overtimeHours: rec?.overtimeHours || 0,
      delayMinutes: rec?.delayMinutes || 0,
      status: rec?.status || 'present',
      notes: rec?.notes || '',
    });
  };

  const handleSaveAttendanceRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttendanceRecord) return;

    setAttendanceStatus({
      employeeId: editingAttendanceRecord.employeeId,
      date: selectedDate,
      status: editingAttendanceRecord.status,
      checkIn: editingAttendanceRecord.checkIn,
      checkOut: editingAttendanceRecord.checkOut,
      overtimeHours: Number(editingAttendanceRecord.overtimeHours) || 0,
      delayMinutes: Number(editingAttendanceRecord.delayMinutes) || 0,
      notes: editingAttendanceRecord.notes,
    });

    setEditingAttendanceRecord(null);
  };

  // Open detailed payroll editor
  const handleOpenEditPayroll = (rec: any) => {
    setEditingPayrollRecord({
      employeeId: rec.employeeId,
      employeeName: rec.employeeName,
      jobTitle: rec.jobTitle,
      basicSalary: rec.basicSalary,
      attendedDays: rec.attendedDays,
      allowances: rec.allowances,
      overtimeHours: rec.overtimeHours,
      overtimePay: rec.overtimePay,
      deductions: rec.deductions,
      status: rec.status,
      notes: '',
    });
  };

  const handleSavePayrollModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayrollRecord) return;

    const netSalary = Math.max(
      0,
      Number(editingPayrollRecord.basicSalary) +
        Number(editingPayrollRecord.allowances) +
        Number(editingPayrollRecord.overtimePay) -
        Number(editingPayrollRecord.deductions)
    );

    savePayrollRecord({
      id: `pr-${editingPayrollRecord.employeeId}-${selectedPayrollMonth}`,
      payrollMonth: selectedPayrollMonth,
      employeeId: editingPayrollRecord.employeeId,
      employeeName: editingPayrollRecord.employeeName,
      jobTitle: editingPayrollRecord.jobTitle,
      basicSalary: Number(editingPayrollRecord.basicSalary),
      attendedDays: Number(editingPayrollRecord.attendedDays),
      totalWorkingDays: standardWorkingDays,
      allowances: Number(editingPayrollRecord.allowances),
      overtimeHours: Number(editingPayrollRecord.overtimeHours),
      overtimePay: Number(editingPayrollRecord.overtimePay),
      deductions: Number(editingPayrollRecord.deductions),
      netSalary,
      status: editingPayrollRecord.status,
      paidDate: editingPayrollRecord.status === 'paid' ? todayStr : undefined,
      paymentMethod: 'تحويل بنكي / خزينة',
    });

    setEditingPayrollRecord(null);
  };

  // Export Attendance Excel / CSV
  const handleExportAttendanceExcel = () => {
    const dataToExport = state.employees.map((emp) => {
      const rec = dateAttendanceMap.get(emp.id);
      const attendedMonthCount = monthlyAttendedDaysMap.get(emp.id) || 0;
      return {
        'كود الموظف': emp.employeeNumber,
        'اسم الموظف': emp.nameAr || emp.name,
        'الوظيفة': emp.jobTitleAr || emp.jobTitle,
        'القسم': DEPARTMENTS.find((d) => d.id === emp.department)?.label || emp.department,
        'تاريخ السجل': selectedDate,
        'حالة اليوم': rec?.status === 'present' ? 'حاضر' : rec?.status === 'late' ? 'متأخر' : rec?.status === 'leave' ? 'إذن/إجازة' : 'غائب',
        'وقت الحضور': rec?.checkIn || '-',
        'وقت الانصراف': rec?.checkOut || '-',
        'ساعات إضافية': rec?.overtimeHours || 0,
        'دقائق التأخير': rec?.delayMinutes || 0,
        'إجمالي حضور الشهر الحالي (أيام)': attendedMonthCount,
        'ملاحظات': rec?.notes || '',
      };
    });

    exportToCSV(dataToExport, `تقرير_الحضور_والانصراف_${selectedDate}`);
  };

  // Print Attendance Report
  const handlePrintAttendanceReport = () => {
    printDocument('attendance_report', {
      date: selectedDate,
      records: state.employees.map((emp) => {
        const rec = dateAttendanceMap.get(emp.id);
        return {
          employeeNumber: emp.employeeNumber,
          employeeName: emp.nameAr || emp.name,
          department: DEPARTMENTS.find((d) => d.id === emp.department)?.label || emp.department,
          checkIn: rec?.checkIn,
          checkOut: rec?.checkOut,
          status: rec?.status || 'absent',
          overtimeHours: rec?.overtimeHours,
          notes: rec?.notes,
        };
      }),
      presentCount: dailyAttendanceStats.present,
      lateCount: dailyAttendanceStats.late,
      absentCount: dailyAttendanceStats.absent,
      leaveCount: dailyAttendanceStats.leave,
    });
  };

  // Export Payroll Excel / CSV
  const handleExportPayrollExcel = () => {
    const dataToExport = calculatedPayrollRecords.map((rec) => ({
      'كود الموظف': rec.employeeNumber,
      'اسم الموظف': rec.employeeName,
      'المسمى الوظيفي': rec.jobTitle,
      'شهر المسير': rec.payrollMonth,
      'الراتب الأساسي (ج.م)': rec.basicSalary,
      'أيام الحضور الفعلي': rec.attendedDays,
      'أيام العمل الرسمية': rec.totalWorkingDays,
      'البدلات والحوافز (ج.م)': rec.allowances,
      'ساعات الإضافي': rec.overtimeHours,
      'أجر الساعات الإضافية (ج.م)': rec.overtimePay,
      'الاستقطاعات والغياب (ج.م)': rec.deductions,
      'صافي المستحق النهائي (ج.م)': rec.netSalary,
      'حالة الصرف': rec.status === 'paid' ? 'تم الصرف' : 'معتمد',
      'طريقة التحويل': rec.paymentMethod,
    }));

    exportToCSV(dataToExport, `مسير_الرواتب_المعتمد_${selectedPayrollMonth}`);
  };

  // Print Payroll Sheet
  const handlePrintPayrollSheet = () => {
    printDocument('payroll_sheet', {
      payrollMonth: selectedPayrollMonth,
      records: calculatedPayrollRecords,
      totalBasic: payrollTotals.totalBasic,
      totalAllowances: payrollTotals.totalAllowances,
      totalDeductions: payrollTotals.totalDeductions,
      totalNet: payrollTotals.totalNet,
    });
  };

  // Print Individual Payslip
  const handlePrintPayslip = (rec: any) => {
    printDocument('payslip', rec);
  };

  // Modal Handlers for Employee Roster
  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormName('');
    setFormJobTitle(JOB_TITLES_PRESETS[1]);
    setFormDepartment('workshop');
    setFormPhone('');
    setFormEmail('');
    setFormSalary(15000);
    setFormHireDate(todayStr);
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
    deleteEmployee(employeeToDelete.id);
    setEmployeeToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            الموارد البشرية والحضور والرواتب (HR & Payroll)
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            متابعة الحضور والانصراف، حساب أيام العمل الفعلية شهرياً، ومسيرات الرواتب وصافي المستحق
          </p>
        </div>

        {/* Subtabs Navigation */}
        <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
          <button
            onClick={() => setSubTab('attendance')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'attendance'
                ? isDark
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-blue-700 shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>الحضور والانصراف</span>
          </button>

          <button
            onClick={() => setSubTab('payroll')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'payroll'
                ? isDark
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-blue-700 shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>المرتبات وصافي المستحق</span>
          </button>

          <button
            onClick={() => setSubTab('roster')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'roster'
                ? isDark
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-blue-700 shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>سجل الموظفين والفنيين</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. ATTENDANCE & ABSENCE TAB (الحضور والانصراف) */}
      {/* ========================================================= */}
      {subTab === 'attendance' && (
        <div className="space-y-6">
          {/* Attendance KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
              <div className="text-[11px] font-bold text-slate-500 uppercase">إجمالي الفريق</div>
              <div className="text-xl font-extrabold mt-1 font-mono text-slate-900 dark:text-white">{dailyAttendanceStats.total}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">موظف وفني معتمد</div>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
              <div className="text-[11px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                <Check className="w-3 h-3" /> حاضرون
              </div>
              <div className="text-xl font-extrabold mt-1 font-mono text-emerald-500">{dailyAttendanceStats.present}</div>
              <div className="text-[10px] text-emerald-400/80 mt-0.5">في موقع العمل</div>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
              <div className="text-[11px] font-bold text-amber-500 uppercase flex items-center gap-1">
                <Clock3 className="w-3 h-3" /> متأخرون
              </div>
              <div className="text-xl font-extrabold mt-1 font-mono text-amber-500">{dailyAttendanceStats.late}</div>
              <div className="text-[10px] text-amber-400/80 mt-0.5">مع تسجيل تأخير</div>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
              <div className="text-[11px] font-bold text-rose-500 uppercase flex items-center gap-1">
                <XCircle className="w-3 h-3" /> غائبون
              </div>
              <div className="text-xl font-extrabold mt-1 font-mono text-rose-500">{dailyAttendanceStats.absent}</div>
              <div className="text-[10px] text-rose-400/80 mt-0.5">بدون تسجيل حضور</div>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
              <div className="text-[11px] font-bold text-blue-500 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3" /> إذن / إجازة
              </div>
              <div className="text-xl font-extrabold mt-1 font-mono text-blue-500">{dailyAttendanceStats.leave}</div>
              <div className="text-[10px] text-blue-400/80 mt-0.5">مصرح رسمياً</div>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
              <div className="text-[11px] font-bold text-indigo-500 uppercase flex items-center gap-1">
                <Percent className="w-3 h-3" /> الانضباط
              </div>
              <div className="text-xl font-extrabold mt-1 font-mono text-indigo-500">{dailyAttendanceStats.rate}%</div>
              <div className="text-[10px] text-indigo-400/80 mt-0.5">نسبة الحضور اليومي</div>
            </div>
          </div>

          {/* Controls Bar: Interactive Date Picker & Fast Actions */}
          <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
            {/* Date Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>تاريخ الحضور:</span>
              </span>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
              />

              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  selectedDate === todayStr
                    ? 'bg-blue-600 text-white border-blue-600'
                    : isDark
                    ? 'border-slate-800 text-slate-400 hover:text-white'
                    : 'border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                اليوم
              </button>

              <button
                type="button"
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(d.toISOString().substring(0, 10));
                }}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDark ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title="اليوم السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(d.toISOString().substring(0, 10));
                }}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDark ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title="اليوم التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-xs"
                title="تسجيل حضور جميع الموظفين بنقرة واحدة"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>حضور الكل اليوم</span>
              </button>

              <button
                type="button"
                onClick={handleExportAttendanceExcel}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  isDark
                    ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-emerald-400'
                    : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-emerald-700'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>تصدير Excel</span>
              </button>

              <button
                type="button"
                onClick={handlePrintAttendanceReport}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  isDark
                    ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-blue-400'
                    : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-blue-700'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة الكشف</span>
              </button>
            </div>
          </div>

          {/* Interactive Attendance Table */}
          <div className={`rounded-xl border overflow-hidden shadow-lg ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className={`border-b text-[11px] font-bold ${isDark ? 'border-slate-800 bg-slate-950/60 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                    <th className="py-3 px-3 text-start">كود</th>
                    <th className="py-3 px-4 text-start">الموظف / الفني</th>
                    <th className="py-3 px-3 text-start">القسم</th>
                    <th className="py-3 px-3 text-center">أيام الحضور (شهر {selectedPayrollMonth.substring(5)})</th>
                    <th className="py-3 px-3 text-center">أوقات العمل اليوم</th>
                    <th className="py-3 px-3 text-center">تسجيل الحالة الفورية</th>
                    <th className="py-3 px-3 text-center">إضافي</th>
                    <th className="py-3 px-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                  {filteredEmployees.map((emp) => {
                    const rec = dateAttendanceMap.get(emp.id);
                    const currentStatus = rec?.status || 'absent';
                    const attendedMonthCount = monthlyAttendedDaysMap.get(emp.id) || 0;

                    return (
                      <tr key={emp.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                        <td className="py-3 px-3 font-mono text-slate-500 font-semibold">{emp.employeeNumber}</td>
                        <td className="py-3 px-4">
                          <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{emp.nameAr || emp.name}</div>
                          <div className="text-[11px] text-slate-400">{emp.jobTitleAr || emp.jobTitle}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[11px] text-slate-400">
                            {DEPARTMENTS.find((d) => d.id === emp.department)?.label || emp.department}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            <span>{attendedMonthCount}</span>
                            <span className="text-[10px] text-slate-400">/ {standardWorkingDays} يوم</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {rec?.checkIn ? (
                            <div className="space-y-0.5 text-[11px]">
                              <span className="text-emerald-500 font-semibold">دخول: {rec.checkIn}</span>
                              {rec.checkOut && <span className="text-blue-500 block">خروج: {rec.checkOut}</span>}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">لم يسجل</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {/* 4 Quick Toggle Buttons */}
                          <div className="inline-flex items-center p-0.5 rounded-lg border gap-1 border-slate-700/50 dark:border-slate-800 bg-slate-950/40">
                            <button
                              type="button"
                              onClick={() => handleSetQuickStatus(emp.id, 'present')}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                currentStatus === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-400 hover:text-emerald-400'
                              }`}
                              title="حاضر في الموعد"
                            >
                              حاضر
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetQuickStatus(emp.id, 'late')}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                currentStatus === 'late'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'text-slate-400 hover:text-amber-400'
                              }`}
                              title="متأخر عن الموعد"
                            >
                              متأخر
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetQuickStatus(emp.id, 'leave')}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                currentStatus === 'leave'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'text-slate-400 hover:text-blue-400'
                              }`}
                              title="إذن أو إجازة معتمدة"
                            >
                              إذن
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetQuickStatus(emp.id, 'absent')}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                currentStatus === 'absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-400 hover:text-rose-400'
                              }`}
                              title="غائب"
                            >
                              غائب
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {rec?.overtimeHours ? (
                            <span className="text-emerald-500 font-bold">+{rec.overtimeHours} س</span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenEditAttendance(emp)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isDark
                                ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                                : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                            title="تعديل تفاصيل الحضور وساعات الإضافي"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. PAYROLL & SALARIES TAB (المرتبات والأجور وصافي المستحق) */}
      {/* ========================================================= */}
      {subTab === 'payroll' && (
        <div className="space-y-6">
          {/* Payroll KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} shadow-md`}>
              <div className="text-xs font-bold text-slate-500 uppercase">إجمالي الرواتب الأساسية</div>
              <div className="text-2xl font-extrabold font-mono mt-1 text-slate-900 dark:text-white">
                {payrollTotals.totalBasic.toLocaleString()} <span className="text-sm font-sans">ج.م</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">الرواتب التعاقدية لجميع العاملين</div>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} shadow-md`}>
              <div className="text-xs font-bold text-emerald-500 uppercase flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>إجمالي البدلات والإضافي</span>
              </div>
              <div className="text-2xl font-extrabold font-mono mt-1 text-emerald-500">
                +{payrollTotals.totalAllowances.toLocaleString()} <span className="text-sm font-sans">ج.م</span>
              </div>
              <div className="text-xs text-emerald-400/80 mt-1">بدل انتقال + حوافز + ساعات إضافية</div>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} shadow-md`}>
              <div className="text-xs font-bold text-rose-500 uppercase flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>إجمالي الاستقطاعات والغياب</span>
              </div>
              <div className="text-2xl font-extrabold font-mono mt-1 text-rose-500">
                -{payrollTotals.totalDeductions.toLocaleString()} <span className="text-sm font-sans">ج.م</span>
              </div>
              <div className="text-xs text-rose-400/80 mt-1">خصومات تأخير وغياب وجزاءات</div>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/90 border-blue-500/40 bg-gradient-to-br from-blue-900/20 to-slate-900' : 'bg-blue-50/70 border-blue-200'} shadow-md`}>
              <div className="text-xs font-bold text-blue-500 uppercase flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span>صافي المستحق النهائي للصرف</span>
              </div>
              <div className="text-2xl font-black font-mono mt-1 text-blue-600 dark:text-blue-400">
                {payrollTotals.totalNet.toLocaleString()} <span className="text-sm font-sans">ج.م</span>
              </div>
              <div className="text-xs text-blue-500/80 mt-1">صافي الرواتب المستحقة للشهر</div>
            </div>
          </div>

          {/* Month & Working Days Settings Bar */}
          <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>مسير شهر:</span>
              </span>

              <input
                type="month"
                value={selectedPayrollMonth}
                onChange={(e) => setSelectedPayrollMonth(e.target.value)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
              />

              <div className="flex items-center gap-1.5 text-xs text-slate-500 me-2">
                <span>أيام العمل القياسية:</span>
                <input
                  type="number"
                  min="20"
                  max="31"
                  value={standardWorkingDays}
                  onChange={(e) => setStandardWorkingDays(Math.max(1, Number(e.target.value)))}
                  className={`w-14 px-2 py-1 rounded border text-xs font-mono text-center ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <span>يوم</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportPayrollExcel}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  isDark
                    ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-emerald-400'
                    : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-emerald-700'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>تصدير مسير الرواتب Excel</span>
              </button>

              <button
                type="button"
                onClick={handlePrintPayrollSheet}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة الكشف المعتمد</span>
              </button>
            </div>
          </div>

          {/* Payroll Table */}
          <div className={`rounded-xl border overflow-hidden shadow-lg ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className={`border-b text-[11px] font-bold ${isDark ? 'border-slate-800 bg-slate-950/60 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                    <th className="py-3 px-3 text-start">كود</th>
                    <th className="py-3 px-4 text-start">اسم الموظف</th>
                    <th className="py-3 px-3 text-start">الوظيفة</th>
                    <th className="py-3 px-2 text-center">أيام الحضور</th>
                    <th className="py-3 px-3 text-end">الأساسي</th>
                    <th className="py-3 px-3 text-end">البدلات</th>
                    <th className="py-3 px-3 text-end">الإضافي</th>
                    <th className="py-3 px-3 text-end">الاستقطاعات</th>
                    <th className="py-3 px-4 text-end font-extrabold text-blue-500">صافي المستحق</th>
                    <th className="py-3 px-3 text-center">الحالة</th>
                    <th className="py-3 px-3 text-center">خيارات</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                  {calculatedPayrollRecords.map((rec) => (
                    <tr key={rec.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                      <td className="py-3 px-3 font-mono text-slate-500 font-semibold">{rec.employeeNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{rec.employeeName}</td>
                      <td className="py-3 px-3 text-slate-400">{rec.jobTitle}</td>
                      <td className="py-3 px-2 text-center font-mono font-semibold text-blue-500">
                        {rec.attendedDays} / {rec.totalWorkingDays}
                      </td>
                      <td className="py-3 px-3 text-end font-mono font-medium">{rec.basicSalary.toLocaleString()} ج.م</td>
                      <td className="py-3 px-3 text-end font-mono text-emerald-500">+{rec.allowances.toLocaleString()} ج.م</td>
                      <td className="py-3 px-3 text-end font-mono text-emerald-500">
                        {rec.overtimePay > 0 ? `+${rec.overtimePay.toLocaleString()} ج.م` : '-'}
                      </td>
                      <td className="py-3 px-3 text-end font-mono text-rose-500">
                        {rec.deductions > 0 ? `-${rec.deductions.toLocaleString()} ج.م` : '0 ج.م'}
                      </td>
                      <td className="py-3 px-4 text-end font-mono font-black text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                        {rec.netSalary.toLocaleString()} ج.م
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            rec.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {rec.status === 'paid' ? 'تم الصرف' : 'معتمد'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handlePrintPayslip(rec)}
                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                            title="طباعة مفردات الراتب (Payslip)"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditPayroll(rec)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="تعديل بنود الراتب والبدلات"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. EMPLOYEES ROSTER TAB (دليل الموظفين والكادر الفني) */}
      {/* ========================================================= */}
      {subTab === 'roster' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
                <input
                  type="text"
                  placeholder="بحث باسم الموظف، التخصص، أو الهاتف..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full ps-9 pe-3 py-1.5 rounded-lg border text-xs ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="all">كل الأقسام</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={openCreateModal}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة موظف جديد</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className={`p-5 rounded-2xl border transition-all shadow-md ${
                  isDark ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white">{emp.nameAr || emp.name}</div>
                      <div className="text-xs text-blue-500 font-medium">{emp.jobTitleAr || emp.jobTitle}</div>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 bg-slate-500/10 px-2 py-0.5 rounded">
                    {emp.employeeNumber}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs border-t pt-3 border-slate-800/40 text-slate-400">
                  <div className="flex justify-between">
                    <span>الهاتف:</span>
                    <span className="font-mono text-slate-200" dir="ltr">{emp.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الراتب التعاقدي:</span>
                    <span className="font-mono font-bold text-emerald-500">{emp.monthlySalary.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span>القسم:</span>
                    <span className="text-slate-300">{DEPARTMENTS.find((d) => d.id === emp.department)?.label}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between border-slate-800/40">
                  <button
                    onClick={() => toggleCheckIn(emp.id)}
                    className="text-xs px-2.5 py-1 rounded-lg border font-bold border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
                  >
                    تسجيل الحضور الآن
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(emp)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="تعديل"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEmployeeToDelete(emp)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg transition-colors cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: Edit Attendance Details Modal */}
      {/* ========================================================= */}
      {editingAttendanceRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/50 mb-4">
              <div className="font-bold text-sm">
                تعديل حضور: {editingAttendanceRecord.employeeName}
              </div>
              <button onClick={() => setEditingAttendanceRecord(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAttendanceRecord} className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1">الحالة</label>
                <select
                  value={editingAttendanceRecord.status}
                  onChange={(e: any) => setEditingAttendanceRecord({ ...editingAttendanceRecord, status: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                >
                  <option value="present">حاضر (Present)</option>
                  <option value="late">متأخر (Late)</option>
                  <option value="leave">إذن / إجازة (Leave)</option>
                  <option value="absent">غائب (Absent)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">وقت الحضور</label>
                  <input
                    type="time"
                    value={editingAttendanceRecord.checkIn}
                    onChange={(e) => setEditingAttendanceRecord({ ...editingAttendanceRecord, checkIn: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">وقت الانصراف</label>
                  <input
                    type="time"
                    value={editingAttendanceRecord.checkOut}
                    onChange={(e) => setEditingAttendanceRecord({ ...editingAttendanceRecord, checkOut: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">ساعات عمل إضافية</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={editingAttendanceRecord.overtimeHours}
                    onChange={(e) => setEditingAttendanceRecord({ ...editingAttendanceRecord, overtimeHours: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">دقائق التأخير</label>
                  <input
                    type="number"
                    min="0"
                    value={editingAttendanceRecord.delayMinutes}
                    onChange={(e) => setEditingAttendanceRecord({ ...editingAttendanceRecord, delayMinutes: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">ملاحظات الحضور</label>
                <input
                  type="text"
                  placeholder="سبب التأخير، إذن مأمورية خارجية..."
                  value={editingAttendanceRecord.notes}
                  onChange={(e) => setEditingAttendanceRecord({ ...editingAttendanceRecord, notes: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAttendanceRecord(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: Edit Payroll Details Modal */}
      {/* ========================================================= */}
      {editingPayrollRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className={`relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/50 mb-4">
              <div>
                <div className="font-bold text-sm">تعديل بنود راتب: {editingPayrollRecord.employeeName}</div>
                <div className="text-[11px] text-slate-400">مسير شهر: {selectedPayrollMonth}</div>
              </div>
              <button onClick={() => setEditingPayrollRecord(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePayrollModal} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">الراتب الأساسي (ج.م)</label>
                  <input
                    type="number"
                    value={editingPayrollRecord.basicSalary}
                    onChange={(e) => setEditingPayrollRecord({ ...editingPayrollRecord, basicSalary: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">أيام الحضور الفعلية</label>
                  <input
                    type="number"
                    min="0"
                    max="31"
                    value={editingPayrollRecord.attendedDays}
                    onChange={(e) => setEditingPayrollRecord({ ...editingPayrollRecord, attendedDays: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">البدلات والمكافآت (ج.م)</label>
                  <input
                    type="number"
                    value={editingPayrollRecord.allowances}
                    onChange={(e) => setEditingPayrollRecord({ ...editingPayrollRecord, allowances: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono text-emerald-500 font-bold ${isDark ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">أجر الساعات الإضافية (ج.م)</label>
                  <input
                    type="number"
                    value={editingPayrollRecord.overtimePay}
                    onChange={(e) => setEditingPayrollRecord({ ...editingPayrollRecord, overtimePay: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono text-emerald-500 font-bold ${isDark ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">الاستقطاعات والخصومات (ج.م)</label>
                  <input
                    type="number"
                    value={editingPayrollRecord.deductions}
                    onChange={(e) => setEditingPayrollRecord({ ...editingPayrollRecord, deductions: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono text-rose-500 font-bold ${isDark ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">حالة الصرف</label>
                  <select
                    value={editingPayrollRecord.status}
                    onChange={(e: any) => setEditingPayrollRecord({ ...editingPayrollRecord, status: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                  >
                    <option value="draft">مسودة (Draft)</option>
                    <option value="approved">معتمد للصرف (Approved)</option>
                    <option value="paid">تم الصرف والتحويل (Paid)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Net Salary Preview */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">صافي المستحق المحسوب:</span>
                <span className="text-lg font-black font-mono text-emerald-500">
                  {Math.max(
                    0,
                    Number(editingPayrollRecord.basicSalary) +
                      Number(editingPayrollRecord.allowances) +
                      Number(editingPayrollRecord.overtimePay) -
                      Number(editingPayrollRecord.deductions)
                  ).toLocaleString()}{' '}
                  ج.م
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPayrollRecord(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white"
                >
                  حفظ واعتماد الراتب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: Create / Edit Employee Modal */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className={`relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/50 mb-4">
              <div className="font-bold text-sm">
                {editingEmployee ? 'تعديل بيانات الموظف' : 'إضافة موظف / فني جديد'}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="م. أحمد السيد"
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">القسم</label>
                  <select
                    value={formDepartment}
                    onChange={(e: any) => setFormDepartment(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">المسمى الوظيفي</label>
                  <input
                    type="text"
                    required
                    value={formJobTitle}
                    onChange={(e) => setFormJobTitle(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="01012345678"
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">الراتب التعاقدي (ج.م)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={formSalary}
                    onChange={(e) => setFormSalary(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="email@autocarepro.eg"
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">تاريخ التعيين</label>
                  <input
                    type="date"
                    value={formHireDate}
                    onChange={(e) => setFormHireDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className={`p-6 rounded-2xl border max-w-sm w-full ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <h4 className="font-bold text-sm mb-2">تأكيد حذف الموظف</h4>
            <p className="text-xs text-slate-400 mb-4">
              هل أنت متأكد من حذف الموظف "{employeeToDelete.nameAr || employeeToDelete.name}"؟
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEmployeeToDelete(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 text-slate-300"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-500"
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
