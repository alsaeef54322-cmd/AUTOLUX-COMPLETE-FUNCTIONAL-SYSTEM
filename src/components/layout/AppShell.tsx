import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  ClipboardCheck,
  Calculator,
  Kanban,
  Users,
  Car,
  Package,
  ArrowLeftRight,
  Truck,
  ShoppingBag,
  Receipt,
  CreditCard,
  Wallet,
  TrendingDown,
  BarChart3,
  UserCheck,
  CalendarCheck,
  Coins,
  Shield,
  History,
  Settings,
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Wrench,
  ChevronRight,
  ChevronDown,
  BadgeDollarSign,
  BadgePercent,
  Key,
  LogOut,
} from 'lucide-react';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    state,
    t,
    theme,
    setTheme,
    activeTab,
    setActiveTab,
    setIsSearchModalOpen,
    setIsNotificationsOpen,
    setIsRoleSwitcherOpen,
    logout,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const unreadNotificationsCount = state.notifications.filter((n) => !n.read).length;

  const navigationGroups: NavGroup[] = [
    {
      title: t.overview,
      items: [
        { id: 'dashboard', label: t.tabDashboard, icon: LayoutDashboard },
      ],
    },
    {
      title: t.workshopOps,
      items: [
        { id: 'reception', label: t.tabReception, icon: PlusCircle },
        {
          id: 'service_orders',
          label: t.tabServiceOrders,
          icon: FileText,
          badge: state.serviceOrders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length,
        },
        { id: 'inspections', label: t.tabInspections, icon: ClipboardCheck },
        { id: 'estimates', label: t.tabEstimates, icon: Calculator },
        { id: 'workshop_board', label: t.tabWorkshopBoard, icon: Kanban },
      ],
    },
    {
      title: t.customersVehicles,
      items: [
        { id: 'customers', label: t.tabCustomers, icon: Users },
        { id: 'vehicles', label: t.tabVehicles, icon: Car },
      ],
    },
    {
      title: t.dealershipShowroom,
      items: [
        { id: 'sales', label: t.tabSales, icon: BadgePercent },
        { id: 'purchases', label: t.tabPurchases, icon: BadgeDollarSign },
        { id: 'rentals', label: t.tabRentals, icon: Key },
      ],
    },
    {
      title: t.inventoryProcurement,
      items: [
        {
          id: 'spare_parts',
          label: t.tabSpareParts,
          icon: Package,
          badge: state.spareParts.filter((p) => p.currentStock <= p.minStock).length,
        },
        { id: 'stock_movements', label: t.tabStockMovements, icon: ArrowLeftRight },
        { id: 'suppliers', label: t.tabSuppliers, icon: Truck },
        { id: 'purchase_orders', label: t.tabPurchaseOrders, icon: ShoppingBag },
      ],
    },
    {
      title: t.finance,
      items: [
        {
          id: 'invoices',
          label: t.tabInvoices,
          icon: Receipt,
          badge: state.invoices.filter((i) => i.status === 'unpaid').length,
        },
        { id: 'payments', label: t.tabPayments, icon: CreditCard },
        { id: 'cash_management', label: t.tabCashManagement, icon: Wallet },
        { id: 'expenses', label: t.tabExpenses, icon: TrendingDown },
        { id: 'financial_reports', label: t.tabFinancialReports, icon: BarChart3 },
      ],
    },
    {
      title: t.peopleHR,
      items: [
        { id: 'employees', label: t.tabEmployees, icon: UserCheck },
        { id: 'attendance', label: t.tabAttendance, icon: CalendarCheck },
        { id: 'payroll', label: t.tabPayroll, icon: Coins },
      ],
    },
    {
      title: t.administration,
      items: [
        { id: 'users_permissions', label: t.tabUsersPermissions, icon: Shield },
        { id: 'audit_log', label: t.tabAuditLog, icon: History },
        { id: 'settings', label: t.tabSettings, icon: Settings },
      ],
    },
  ];

  const userRole = state.currentUser.role;
  const allowedTabsByRole: Record<string, ActiveTab[]> = {
    owner: [
      'dashboard', 'reception', 'service_orders', 'inspections', 'estimates', 'workshop_board',
      'customers', 'vehicles', 'sales', 'purchases', 'rentals',
      'spare_parts', 'stock_movements', 'suppliers', 'purchase_orders',
      'invoices', 'payments', 'cash_management', 'expenses', 'financial_reports',
      'employees', 'attendance', 'payroll',
      'users_permissions', 'audit_log', 'settings',
    ],
    operations_manager: [
      'dashboard', 'reception', 'service_orders', 'inspections', 'estimates', 'workshop_board',
      'customers', 'vehicles', 'spare_parts', 'invoices', 'financial_reports',
      'employees', 'settings',
    ],
    workshop_manager: [
      'dashboard', 'service_orders', 'inspections', 'estimates', 'workshop_board',
      'vehicles', 'spare_parts', 'stock_movements', 'suppliers', 'purchase_orders',
    ],
    technician: [
      'workshop_board', 'service_orders', 'inspections', 'vehicles',
    ],
    receptionist: [
      'dashboard', 'reception', 'service_orders', 'customers', 'vehicles', 'invoices', 'payments',
    ],
    accountant: [
      'dashboard', 'invoices', 'payments', 'cash_management', 'expenses', 'financial_reports', 'suppliers', 'purchase_orders', 'payroll', 'attendance',
    ],
    inventory_officer: [
      'dashboard', 'spare_parts', 'stock_movements', 'suppliers', 'purchase_orders',
    ],
    hr_officer: [
      'dashboard', 'employees', 'attendance', 'payroll',
    ],
  };

  const allowedTabs = allowedTabsByRole[userRole] || allowedTabsByRole.owner;
  const filteredNavGroups = navigationGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => allowedTabs.includes(item.id)),
    }))
    .filter((g) => g.items.length > 0);

  const handleNavClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row antialiased transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Sidebar for Desktop */}
      <aside
        className={`hidden md:flex flex-col border-e transition-all duration-200 z-30 shrink-0 ${
          isDark
            ? 'bg-slate-900/95 border-slate-800/80 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800 shadow-sm'
        } ${isCollapsed ? 'w-20' : 'w-72'} h-screen sticky top-0`}
      >
        {/* Brand Header */}
        <div className={`h-16 px-4 flex items-center justify-between border-b ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-900/30">
              <Wrench className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className={`font-bold text-sm tracking-tight block truncate leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t.appName}
                </span>
                <span className="text-[11px] text-slate-400 block truncate mt-1">
                  {t.workshopLocation}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 rounded-md transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
            title="طي القائمة الجانبية"
          >
            <ChevronRight className={`w-4 h-4 transform transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Quick Reception Action Button */}
        {!isCollapsed && (allowedTabs.includes('reception')) && (
          <div className={`p-3 border-b ${isDark ? 'border-slate-800/60' : 'border-slate-100'}`}>
            <button
              onClick={() => handleNavClick('reception')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">{t.quickReception}</span>
            </button>
          </div>
        )}

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5">
          {filteredNavGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed && (
                <div className={`px-3 text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? isDark
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                          : 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold shadow-xs'
                        : isDark
                        ? 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                    } ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? (isDark ? 'text-blue-400' : 'text-blue-600') : 'text-slate-400'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full tabular-nums ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Card & Role Switcher + Logout */}
        <div className={`p-3 border-t ${isDark ? 'border-slate-800/80 bg-slate-900/60' : 'border-slate-200 bg-slate-50'}`}>
          <button
            onClick={() => setIsRoleSwitcherOpen(true)}
            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-start cursor-pointer ${
              isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-200/70'
            }`}
          >
            {state.currentUser.avatarUrl ? (
              <img
                src={state.currentUser.avatarUrl}
                alt={state.currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-700/80 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {state.currentUser.name.charAt(0)}
              </div>
            )}
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className={`text-xs font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {state.currentUser.nameAr || state.currentUser.name}
                </div>
                <div className="text-[10px] text-blue-500 font-medium truncate flex items-center gap-1">
                  <span>{t[`role_${state.currentUser.role}` as keyof typeof t] || state.currentUser.role}</span>
                </div>
              </div>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className={`w-full flex items-center justify-center gap-2 mt-2 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isDark
                ? 'text-rose-400 hover:text-rose-200 hover:bg-rose-950/50 border border-rose-900/40'
                : 'text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
            title="تسجيل الخروج من النظام"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header
          className={`h-16 px-4 md:px-6 backdrop-blur-md border-b sticky top-0 z-20 flex items-center justify-between gap-4 ${
            isDark ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white/90 border-slate-200 shadow-xs'
          }`}
        >
          {/* Left Zone: Mobile toggle & Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`md:hidden p-2 rounded-lg ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 truncate">
              <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{t.appName}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 rtl:rotate-180" />
              <span className="text-blue-500 font-semibold truncate">
                {t[`tab${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` as keyof typeof t] ||
                  activeTab.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Right Zone: Controls */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* Global Search Button */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-400 bg-slate-800/70 hover:bg-slate-800 border-slate-700/60'
                  : 'text-slate-600 bg-slate-100 hover:bg-slate-200 border-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.searchPlaceholder}</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800 border-slate-700/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
              }`}
              title={isDark ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className={`relative p-2 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800 border-slate-700/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
              }`}
              title={t.notifications}
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center tabular-nums">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Role indicator button */}
            <button
              onClick={() => setIsRoleSwitcherOpen(true)}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'bg-blue-950/60 border border-blue-800/80 text-blue-300 hover:bg-blue-900/60'
                  : 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <Shield className="w-3 h-3 text-blue-500" />
              <span className="truncate max-w-[130px]">
                {t[`role_${state.currentUser.role}` as keyof typeof t] || state.currentUser.role}
              </span>
            </button>

            {/* Top Logout Button */}
            <button
              onClick={logout}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border-rose-800/60'
                  : 'text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border-rose-200'
              }`}
              title="تسجيل الخروج من النظام"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-xs">
            <div className={`w-72 h-full p-4 flex flex-col border-e ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-500" />
                  <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.appName}</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-1 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {allowedTabs.includes('reception') && (
                <div className="my-3">
                  <button
                    onClick={() => handleNavClick('reception')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-medium text-xs rounded-lg"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{t.quickReception}</span>
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-4">
                {filteredNavGroups.map((g, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className={`text-[10px] font-bold uppercase px-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{g.title}</div>
                    {g.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-start ${
                            activeTab === item.id
                              ? 'bg-blue-600 text-white'
                              : isDark
                              ? 'text-slate-300 hover:bg-slate-800'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Mobile Drawer Logout */}
              <div className={`pt-3 border-t mt-auto ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border border-rose-500/30"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Primary Page Canvas */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
