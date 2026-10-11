import React from 'react';
import { useApp } from '../../context/AppContext';
import { RoleType } from '../../types';
import { Shield, Check, X, UserCheck } from 'lucide-react';

const ROLES: { id: RoleType; title: string; titleAr: string; desc: string; descAr: string }[] = [
  {
    id: 'owner',
    title: 'Owner / Super Admin',
    titleAr: 'المالك / المدير العام',
    desc: 'Full unrestricted access to financial metrics, audit logs, staff salaries and company settings.',
    descAr: 'صلاحيات كاملة غير مقيدة: القوائم المالية، الرواتب، سجل الرقابة والإعدادات العامة.',
  },
  {
    id: 'operations_manager',
    title: 'Operations Manager',
    titleAr: 'مدير العمليات والتشغيل',
    desc: 'Oversees workshop queue, approves major estimates, monitors technician productivity.',
    descAr: 'متابعة تدفق الورشة، اعتماد عروض الأسعار، وتوزيع العمل على الفنيين.',
  },
  {
    id: 'receptionist',
    title: 'Receptionist / Service Advisor',
    titleAr: 'موظف الاستقبال وخدمة العملاء',
    desc: 'Quick vehicle intake, customer creation, work order dispatch, gate pass printing.',
    descAr: 'تسجيل دخول السيارات الفوري، إصدار أوامر الشغل، واستلام العملاء وإذن الدخول.',
  },
  {
    id: 'workshop_manager',
    title: 'Workshop Chief Engineer',
    titleAr: 'مدير الورشة وكبير المهندسين',
    desc: 'Directs mechanical bays, assigns mechanics, inspects quality, approves diagnostics.',
    descAr: 'إدارة كبائن الصيانة، توزيع الفنيين، اعتماد الفحص وتجربة الجودة قبل التسليم.',
  },
  {
    id: 'technician',
    title: 'Master Technician',
    titleAr: 'فني صيانة ميكانيكا',
    desc: 'Views assigned job cards, executes labor operations, requests spare parts from warehouse.',
    descAr: 'الاطلاع على كروت الشغل المسندة، تنفيذ المصنعيات وطلب قطع الغيار من المخزن.',
  },
  {
    id: 'accountant',
    title: 'Senior Accountant',
    titleAr: 'المحاسب المالي',
    desc: 'Issues tax invoices, records cash and bank collections, logs operating expenses and cash drawers.',
    descAr: 'إصدار الفواتير الضريبية، تسجيل سندات القبض، المصروفات، وإدارة الخزينة والبنك.',
  },
  {
    id: 'inventory_officer',
    title: 'Storekeeper / Inventory Officer',
    titleAr: 'أمين المخزن وقطع الغيار',
    desc: 'Manages parts catalog, issues items to job cards, receives supplier purchase orders.',
    descAr: 'إدارة كتالوج القطع، صرف الأصناف لكروت الشغل، وتوريد طلبات الشراء إلى المخزن.',
  },
  {
    id: 'hr_officer',
    title: 'HR & Personnel Officer',
    titleAr: 'مسؤول الموارد البشرية وشؤون العاملين',
    desc: 'Tracks daily attendance, manages leave requests, reviews monthly payroll registers.',
    descAr: 'متابعة سجل الحضور والانصراف، مراجعة طلبات الإجازات، ومسيرات الرواتب الشهرية.',
  },
];

export const RoleSwitcherModal: React.FC = () => {
  const { isRoleSwitcherOpen, setIsRoleSwitcherOpen, state, switchUserRole, language } = useApp();

  if (!isRoleSwitcherOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {language === 'ar' ? 'تبديل دور المستخدم (محاكاة الصلاحيات)' : 'Switch User Role (RBAC Simulation)'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ar'
                  ? 'اختبر تجربة النظام من منظور الأدوار المختلفة في المركز'
                  : 'Test the application experience and access rules from any operational perspective'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRoleSwitcherOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-2.5">
          {ROLES.map((r) => {
            const isActive = state.currentUser.role === r.id;
            return (
              <button
                key={r.id}
                onClick={() => {
                  switchUserRole(r.id);
                  setIsRoleSwitcherOpen(false);
                }}
                className={`w-full text-start p-3.5 rounded-lg border transition-all flex items-start justify-between gap-4 ${
                  isActive
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 p-1.5 rounded-md ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-slate-900 dark:text-white">
                      {language === 'ar' ? r.titleAr : r.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {language === 'ar' ? r.descAr : r.desc}
                    </div>
                  </div>
                </div>
                {isActive && (
                  <span className="shrink-0 text-blue-600 dark:text-blue-400 mt-1">
                    <Check className="w-4 h-4" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={() => setIsRoleSwitcherOpen(false)}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
