import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, RoleType } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';
import {
  Shield,
  Check,
  X,
  UserCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Printer,
  FileSpreadsheet,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';

const MODULES_AR = [
  'الاستقبال السريع وتسجيل السيارات',
  'أوامر الصيانة وبطاقات العمل (Job Cards)',
  'الفحص والتشخيص الفني الميكانيكي',
  'عروض الأسعار والموافقات',
  'كتالوج قطع الغيار والأرصدة',
  'أوامر التوريد واستلام الشحنات',
  'الفواتير الضريبية وحسابات العملاء',
  'الخزينة النقدية وسندات القبض',
  'المصروفات التشغيلية والنثريات',
  'حضور وانصراف الفنيين وفريق العمل',
  'مسيرات الرواتب الشهرية والبدلات',
  'التقارير المالية والأرباح والخسائر',
  'إدارة المستخدمين وسجل الرقابة والأمان',
];

const ROLE_PERMISSIONS_MATRIX: Record<RoleType, string[]> = {
  owner: MODULES_AR,
  operations_manager: [
    'الاستقبال السريع وتسجيل السيارات',
    'أوامر الصيانة وبطاقات العمل (Job Cards)',
    'الفحص والتشخيص الفني الميكانيكي',
    'عروض الأسعار والموافقات',
    'كتالوج قطع الغيار والأرصدة',
    'أوامر التوريد واستلام الشحنات',
    'الفواتير الضريبية وحسابات العملاء',
    'التقارير المالية والأرباح والخسائر',
    'حضور وانصراف الفنيين وفريق العمل',
  ],
  receptionist: [
    'الاستقبال السريع وتسجيل السيارات',
    'أوامر الصيانة وبطاقات العمل (Job Cards)',
    'الفواتير الضريبية وحسابات العملاء',
  ],
  workshop_manager: [
    'أوامر الصيانة وبطاقات العمل (Job Cards)',
    'الفحص والتشخيص الفني الميكانيكي',
    'عروض الأسعار والموافقات',
    'كتالوج قطع الغيار والأرصدة',
    'حضور وانصراف الفنيين وفريق العمل',
  ],
  technician: [
    'أوامر الصيانة وبطاقات العمل (Job Cards)',
    'الفحص والتشخيص الفني الميكانيكي',
  ],
  accountant: [
    'الفواتير الضريبية وحسابات العملاء',
    'الخزينة النقدية وسندات القبض',
    'المصروفات التشغيلية والنثريات',
    'أوامر التوريد واستلام الشحنات',
    'التقارير المالية والأرباح والخسائر',
    'مسيرات الرواتب الشهرية والبدلات',
  ],
  inventory_officer: [
    'كتالوج قطع الغيار والأرصدة',
    'أوامر التوريد واستلام الشحنات',
  ],
  hr_officer: [
    'حضور وانصراف الفنيين وفريق العمل',
    'مسيرات الرواتب الشهرية والبدلات',
  ],
};

const ROLES_LIST: { id: RoleType; label: string; desc: string }[] = [
  { id: 'owner', label: 'مدير النظام والمركز', desc: 'صلاحيات كاملة شاملة كافة الإعدادات والماليات والرقابة' },
  { id: 'operations_manager', label: 'مدير التشغيل والخدمة', desc: 'إشراف على دورة الصيانة، العملاء، والتقارير' },
  { id: 'workshop_manager', label: 'مهندس صيانة أول / مدير الورشة', desc: 'إدارة أوامر العمل، تشخيص الأعطال، وتوزيع الفنيين' },
  { id: 'technician', label: 'مهندس صيانة / فني ميكانيكا', desc: 'تنفيذ أوامر الشغل، كشف الأعطال وتسجيل الفحص' },
  { id: 'receptionist', label: 'موظف استقبال وخدمة عملاء', desc: 'استقبال المركبات، فتح كروت الشغل، والفوترة' },
  { id: 'accountant', label: 'محاسب مالي', desc: 'الخزينة، الفواتير، المصروفات، والتقارير المالية' },
  { id: 'inventory_officer', label: 'أمين مخزن قطع الغيار', desc: 'إدارة المخزون، صرف القطع، وأوامر الشراء' },
  { id: 'hr_officer', label: 'مسؤول الموارد البشرية', desc: 'إدارة الموظفين، الحضور والانصراف، والرواتب' },
];

export const UsersPermissionsView: React.FC = () => {
  const { state, createUser, updateUser, deleteUser, printDocument, theme } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'matrix'>('users');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleType | 'all'>('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<RoleType>('receptionist');
  const [formActive, setFormActive] = useState(true);
  const [formError, setFormError] = useState('');

  const isDark = theme === 'dark';

  const filteredUsers = state.users.filter((user) => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      (user.nameAr && user.nameAr.toLowerCase().includes(q)) ||
      (user.username && user.username.toLowerCase().includes(q)) ||
      user.email.toLowerCase().includes(q) ||
      (user.phone && user.phone.includes(q))
    );
  });

  const openCreateModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormUsername('');
    setFormPassword('123456');
    setFormEmail('');
    setFormPhone('');
    setFormRole('receptionist');
    setFormActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormName(user.nameAr || user.name);
    setFormUsername(user.username || '');
    setFormPassword(user.password || '');
    setFormEmail(user.email);
    setFormPhone(user.phone || '');
    setFormRole(user.role);
    setFormActive(user.isActive !== false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim() || !formUsername.trim()) {
      setFormError('يرجى ملء جميع الحقول الإلزامية.');
      return;
    }

    // Check duplicate username
    const exists = state.users.some(
      (u) =>
        u.id !== editingUser?.id &&
        u.username?.toLowerCase() === formUsername.trim().toLowerCase()
    );
    if (exists) {
      setFormError('اسم المستخدم موجود بالفعل، يرجى اختيار اسم مستخدم آخر.');
      return;
    }

    if (editingUser) {
      updateUser({
        ...editingUser,
        name: formName.trim(),
        nameAr: formName.trim(),
        username: formUsername.trim(),
        password: formPassword.trim() || editingUser.password || '123456',
        email: formEmail.trim() || `${formUsername.trim()}@tagamoa-care.eg`,
        phone: formPhone.trim(),
        role: formRole,
        isActive: formActive,
      });
    } else {
      createUser({
        name: formName.trim(),
        nameAr: formName.trim(),
        username: formUsername.trim(),
        password: formPassword.trim() || '123456',
        email: formEmail.trim() || `${formUsername.trim()}@tagamoa-care.eg`,
        phone: formPhone.trim(),
        role: formRole,
        permissions: formRole === 'owner' ? ['*'] : [formRole],
        isActive: formActive,
      });
    }

    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    const res = deleteUser(userToDelete.id);
    if (!res.success) {
      alert(res.error);
    }
    setUserToDelete(null);
  };

  const handleExportExcel = () => {
    exportToCSV(
      'مستخدمو_مركز_صيانة_التجمع_الخامس',
      [
        { header: 'الاسم الكامل', key: (u) => u.nameAr || u.name },
        { header: 'اسم المستخدم', key: (u) => u.username || '-' },
        { header: 'الدور والصلاحية', key: (u) => ROLES_LIST.find((r) => r.id === u.role)?.label || u.role },
        { header: 'رقم الهاتف', key: (u) => u.phone || '-' },
        { header: 'البريد الإلكتروني', key: (u) => u.email },
        { header: 'الحالة', key: (u) => (u.isActive !== false ? 'نشط' : 'موقوف') },
        { header: 'تاريخ الإنشاء', key: (u) => u.createdAt || '-' },
      ],
      filteredUsers
    );
  };

  const handlePrintUsers = () => {
    printDocument('users_report', {
      title: 'كشف حسابات المستخدمين والصلاحيات',
      users: filteredUsers,
      totalCount: filteredUsers.length,
      printDate: new Date().toLocaleDateString('ar-EG'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Toolbar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Shield className="w-6 h-6 text-blue-500" />
            <span>إدارة المستخدمين والصلاحيات</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            مركز صيانة التجمع الخامس · إدارة حسابات الدخول، كلمات المرور، وتعيين الأدوار الوظيفية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-tab Switcher */}
          <div className={`flex items-center p-1 rounded-xl border text-xs font-semibold ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
            <button
              onClick={() => setActiveSubTab('users')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeSubTab === 'users' ? 'bg-blue-600 text-white shadow-xs' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              حسابات المستخدمين ({state.users.length})
            </button>
            <button
              onClick={() => setActiveSubTab('matrix')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeSubTab === 'matrix' ? 'bg-blue-600 text-white shadow-xs' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مصفوفة الصلاحيات
            </button>
          </div>

          {activeSubTab === 'users' && (
            <>
              <button
                onClick={handlePrintUsers}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
                }`}
                title="طباعة تقرير المستخدمين"
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
                <span>إضافة مستخدم جديد</span>
              </button>
            </>
          )}
        </div>
      </div>

      {activeSubTab === 'users' ? (
        /* Users List Management */
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث بالاسم، اسم المستخدم، رقم الهاتف، أو البريد..."
                className={`w-full ps-9 pe-3 py-2.5 rounded-xl text-xs border focus:outline-hidden transition-colors ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500'
                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 shadow-xs'
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 shrink-0">تصفية بالدور:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className={`text-xs rounded-xl px-3 py-2 border focus:outline-hidden ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                }`}
              >
                <option value="all">كافة الأدوار ({state.users.length})</option>
                {ROLES_LIST.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className={`rounded-xl border overflow-hidden shadow-lg ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className={`border-b text-[11px] font-semibold ${isDark ? 'border-slate-800 bg-slate-950/60 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                    <th className="py-3 px-4 text-start">المستخدم</th>
                    <th className="py-3 px-3 text-start">اسم الدخول (Username)</th>
                    <th className="py-3 px-3 text-start">الدور الوظيفي</th>
                    <th className="py-3 px-3 text-start">رقم الهاتف</th>
                    <th className="py-3 px-3 text-start">البريد الإلكتروني</th>
                    <th className="py-3 px-3 text-center">الحالة</th>
                    <th className="py-3 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        لا يوجد مستخدمون مطابقون لمعايير البحث.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const roleInfo = ROLES_LIST.find((r) => r.id === user.role);
                      const isCurrentUser = state.currentUser.id === user.id;

                      return (
                        <tr
                          key={user.id}
                          className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'} ${
                            isCurrentUser ? (isDark ? 'bg-blue-950/20' : 'bg-blue-50/40') : ''
                          }`}
                        >
                          {/* Name + Avatar */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.name}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                                  {user.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  {user.nameAr || user.name}
                                </div>
                                {isCurrentUser && (
                                  <span className="text-[10px] text-blue-400 font-medium">
                                    (الحساب المسجل به حالياً)
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Username */}
                          <td className="py-3 px-3">
                            <span className="font-mono font-medium text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800/40 text-[11px]">
                              {user.username || '-'}
                            </span>
                          </td>

                          {/* Role */}
                          <td className="py-3 px-3">
                            <div className="font-medium text-xs text-slate-300">
                              {roleInfo?.label || user.role}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[160px]">
                              {roleInfo?.desc}
                            </div>
                          </td>

                          {/* Phone */}
                          <td className="py-3 px-3 font-mono text-slate-400 text-xs" dir="ltr">
                            {user.phone || '-'}
                          </td>

                          {/* Email */}
                          <td className="py-3 px-3 text-slate-400 truncate max-w-[180px]">
                            {user.email}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                user.isActive !== false
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {user.isActive !== false ? 'نشط' : 'موقوف'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openEditModal(user)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  isDark
                                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                                title="تعديل بيانات المستخدم وكلمة المرور"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {!isCurrentUser && (
                                <button
                                  onClick={() => setUserToDelete(user)}
                                  className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                  title="حذف الحساب"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
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
        </div>
      ) : (
        /* Role Permissions Matrix */
        <div className={`rounded-xl border overflow-hidden shadow-lg ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className={`p-4 border-b ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              مصفوفة التحكم في الوصول والصلاحيات (RBAC Matrix)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              تحديد الصلاحيات الدقيقة لكل دور داخل نظام مركز صيانة التجمع الخامس
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className={`border-b text-[11px] font-semibold ${isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                  <th className="py-3 px-4 text-start font-semibold">الوحدة / القسم البرمجي</th>
                  {ROLES_LIST.map((r) => (
                    <th key={r.id} className="py-3 px-2 text-center whitespace-nowrap">
                      {r.label.split('/')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                {MODULES_AR.map((mod, i) => (
                  <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                    <td className={`py-3 px-4 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{mod}</td>
                    {ROLES_LIST.map((role) => {
                      const hasAccess = ROLE_PERMISSIONS_MATRIX[role.id].includes(mod);
                      return (
                        <td key={role.id} className="py-3 px-2 text-center">
                          {hasAccess ? (
                            <div className="w-5 h-5 mx-auto rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 mx-auto rounded-full bg-slate-950/50 text-slate-600 border border-slate-800 flex items-center justify-center">
                              <X className="w-3 h-3" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border p-6 my-8 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <UserIcon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base">
                  {editingUser ? 'تعديل بيانات المستخدم' : 'إضافة حساب مستخدم جديد'}
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
                  الاسم الكامل (ثنائي أو ثلاثي) *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: م. مصطفى إبراهيم"
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                  }`}
                />
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold block text-slate-300">
                    اسم المستخدم (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="مثال: mostafa"
                    className={`w-full px-3 py-2 text-xs rounded-xl border font-mono focus:outline-hidden ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold block text-slate-300">
                    كلمة المرور *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full px-3 py-2 text-xs rounded-xl border ps-8 font-mono focus:outline-hidden ${
                        isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute start-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Select */}
              <div className="space-y-1">
                <label className="text-xs font-semibold block text-slate-300">
                  الدور والصلاحيات في النظام *
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as RoleType)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                  }`}
                >
                  {ROLES_LIST.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label} — {r.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold block text-slate-300">
                    رقم الهاتف
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
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
                    placeholder="user@tagamoa-care.eg"
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  />
                </div>
              </div>

              {/* Account Status */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="userActiveCheck"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="userActiveCheck" className="text-xs font-medium cursor-pointer text-slate-300">
                  الحساب نشط ويُسمح له بتسجيل الدخول
                </label>
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
                  {editingUser ? 'حفظ التعديلات' : 'إنشاء المستخدم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base">تأكيد حذف المستخدم</h3>
              <p className="text-xs text-slate-400">
                هل أنت متأكد من رغبتك في حذف حساب{' '}
                <span className="font-bold text-white">
                  "{userToDelete.nameAr || userToDelete.name}"
                </span>{' '}
                ({userToDelete.username})؟ لن يتمكن من تسجيل الدخول مرة أخرى.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all cursor-pointer"
              >
                تأكيد الحذف النهائي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
