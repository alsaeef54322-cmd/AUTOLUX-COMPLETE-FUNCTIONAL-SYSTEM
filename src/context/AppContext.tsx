import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppState,
  getInitialState,
  saveState,
  resetStateToSeed,
  createAuditEntry,
} from '../services/store';
import {
  ActiveTab,
  RoleType,
  User,
  Employee,
  Customer,
  Vehicle,
  ServiceOrder,
  ServiceOrderStatus,
  Priority,
  LaborItem,
  OrderPartItem,
  Inspection,
  Estimate,
  Invoice,
  Payment,
  Expense,
  PurchaseOrder,
  SparePart,
  StockMovement,
  CashMovement,
  BusinessSettings,
  NotificationItem,
  VehicleSale,
  VehiclePurchase,
  VehicleRental,
  AttendanceRecord,
  PayrollRecord,
} from '../types';
import { translationsEn, translationsAr, Translations } from '../i18n/translations';

interface AppContextType {
  state: AppState;
  t: Translations;
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  isRoleSwitcherOpen: boolean;
  setIsRoleSwitcherOpen: (open: boolean) => void;

  // Auth
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;

  // Users CRUD
  createUser: (data: Omit<User, 'id'>) => User;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => { success: boolean; error?: string };

  // Employees CRUD
  createEmployee: (data: Omit<Employee, 'id' | 'employeeNumber'>) => Employee;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => { success: boolean; error?: string };

  // Invoice Deletion
  deleteInvoice: (id: string) => { success: boolean; error?: string };

  // Actions
  switchUserRole: (role: RoleType) => void;
  receiveVehicle: (data: {
    customerMode: 'existing' | 'new';
    customerId?: string;
    newCustomer?: { name: string; phone: string; email?: string; address?: string };
    vehicleMode: 'existing' | 'new';
    vehicleId?: string;
    newVehicle?: { plateNumber: string; vin?: string; make: string; model: string; year: number; color?: string };
    mileageIn: number;
    complaint: string;
    priority: Priority;
    advisorId: string;
    preExistingDamage?: string[];
    fuelLevel?: number;
  }) => { success: boolean; serviceOrder?: ServiceOrder; error?: string };

  updateServiceOrderStatus: (orderId: string, newStatus: ServiceOrderStatus, notes?: string) => void;
  assignTechnician: (orderId: string, technicianId: string) => void;
  addLaborItem: (orderId: string, item: Omit<LaborItem, 'id' | 'total'>) => void;
  issuePartToOrder: (orderId: string, partId: string, quantity: number) => { success: boolean; error?: string };
  
  createInspection: (data: Omit<Inspection, 'id' | 'inspectionNumber'>) => Inspection;
  convertInspectionToEstimate: (inspectionId: string) => Estimate;

  createEstimate: (data: Omit<Estimate, 'id' | 'estimateNumber'>) => Estimate;
  approveEstimate: (estimateId: string) => void;
  convertEstimateToInvoice: (estimateId: string) => Invoice;

  createInvoice: (data: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice;
  recordPayment: (invoiceId: string, amount: number, paymentMethod: 'cash' | 'credit_card' | 'bank_transfer' | 'instapay_vodafone', notes?: string) => Payment;

  recordExpense: (data: Omit<Expense, 'id' | 'expenseNumber'>) => Expense;
  receivePurchaseOrder: (poId: string) => void;
  createPurchaseOrder: (data: Omit<PurchaseOrder, 'id' | 'poNumber'>) => PurchaseOrder;

  createCustomer: (data: Omit<Customer, 'id' | 'customerNumber' | 'balance' | 'createdAt'>) => Customer;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => { success: boolean; error?: string };
  createVehicle: (data: Omit<Vehicle, 'id'>) => Vehicle;
  updateVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (id: string) => { success: boolean; error?: string };
  deleteServiceOrder: (id: string) => { success: boolean; error?: string };

  createSale: (data: Omit<VehicleSale, 'id' | 'saleNumber'>) => VehicleSale;
  updateSale: (sale: VehicleSale) => void;
  deleteSale: (id: string) => void;

  createPurchase: (data: Omit<VehiclePurchase, 'id' | 'purchaseNumber'>) => VehiclePurchase;
  updatePurchase: (purchase: VehiclePurchase) => void;
  deletePurchase: (id: string) => void;

  createRental: (data: Omit<VehicleRental, 'id' | 'bookingNumber'>) => VehicleRental;
  updateRental: (rental: VehicleRental) => void;
  deleteRental: (id: string) => void;

  createSparePart: (data: Omit<SparePart, 'id'>) => SparePart;
  updateSparePart: (part: SparePart) => void;
  deleteSparePart: (id: string) => { success: boolean; error?: string };
  deleteExpense: (id: string) => { success: boolean; error?: string };
  deleteSupplier: (id: string) => { success: boolean; error?: string };
  deletePurchaseOrder: (id: string) => { success: boolean; error?: string };
  deleteEstimate: (id: string) => { success: boolean; error?: string };
  deleteInspection: (id: string) => { success: boolean; error?: string };

  toggleCheckIn: (employeeId: string) => void;
  setAttendanceStatus: (data: {
    employeeId: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'leave';
    checkIn?: string;
    checkOut?: string;
    overtimeHours?: number;
    delayMinutes?: number;
    notes?: string;
  }) => void;
  savePayrollRecord: (record: PayrollRecord) => void;
  approveLeaveRequest: (requestId: string) => void;

  updateSettings: (settings: Partial<BusinessSettings>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
  refreshData: () => Promise<void>;

  // Print support
  printDocument: (docType: string, data: any) => void;
  activePrintDoc: { docType: string; data: any } | null;
  closePrintDoc: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(getInitialState);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [activePrintDoc, setActivePrintDoc] = useState<{ docType: any; data: any } | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem('tagamoa_auth_session');
      return !!savedAuth;
    } catch {
      return false;
    }
  });

  // Restore current user if session saved
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tagamoa_auth_session');
      if (saved) {
        const { userId } = JSON.parse(saved);
        const match = state.users.find((u) => u.id === userId);
        if (match) {
          setState((prev) => ({ ...prev, currentUser: match }));
          setIsAuthenticated(true);
        }
      }
    } catch (_) {}
  }, []);

  // Sync state to localStorage and server API whenever changed
  useEffect(() => {
    saveState(state);
    // Asynchronously try to sync to server
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    }).catch(() => {
      // Ignore background network failure, localStorage is primary
    });
  }, [state]);

  const language = state.settings.language;
  const theme = state.settings.theme;
  const t = language === 'ar' ? translationsAr : translationsEn;

  // Update HTML dir and lang attributes
  useEffect(() => {
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  // Update theme class on root and body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const setLanguage = (lang: 'ar' | 'en') => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, language: lang },
    }));
  };

  const setTheme = (th: 'dark' | 'light') => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, theme: th },
    }));
    try {
      localStorage.setItem('tagamoa_theme', th);
    } catch (_) {}
  };

  const login = (usernameOrEmail: string, pass: string): { success: boolean; error?: string } => {
    const q = usernameOrEmail.trim().toLowerCase();
    const match = state.users.find(
      (u) =>
        (u.username && u.username.toLowerCase() === q) ||
        (u.email && u.email.toLowerCase() === q)
    );
    if (!match) {
      return { success: false, error: 'اسم المستخدم أو البريد الإلكتروني غير مسجل في مركز صيانة التجمع الخامس.' };
    }
    if (match.password && match.password !== pass) {
      return { success: false, error: 'كلمة المرور غير صحيحة، يرجى إعادة المحاولة.' };
    }
    if (match.isActive === false) {
      return { success: false, error: 'هذا الحساب موقوف، يرجى مراجعة إدارة المركز.' };
    }

    setState((prev) => ({
      ...prev,
      currentUser: match,
      auditLogs: [
        createAuditEntry(
          match,
          'LOGIN',
          'auth',
          match.id,
          `تم تسجيل الدخول بنجاح للمستخدم: ${match.nameAr || match.name} (${match.role})`
        ),
        ...prev.auditLogs,
      ],
    }));
    setIsAuthenticated(true);
    try {
      localStorage.setItem('tagamoa_auth_session', JSON.stringify({ userId: match.id, role: match.role }));
    } catch (_) {}
    return { success: true };
  };

  const logout = () => {
    try {
      localStorage.removeItem('tagamoa_auth_session');
    } catch (_) {}
    setIsAuthenticated(false);
  };

  const createUser = (userData: Omit<User, 'id'>): User => {
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
      createdAt: new Date().toISOString().substring(0, 10),
      isActive: userData.isActive !== undefined ? userData.isActive : true,
    };
    setState((prev) => ({
      ...prev,
      users: [newUser, ...prev.users],
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'CREATE_USER',
          'users',
          newUser.id,
          `تم إنشاء مستخدم جديد: ${newUser.nameAr || newUser.name} (${newUser.username})`
        ),
        ...prev.auditLogs,
      ],
    }));
    return newUser;
  };

  const updateUser = (user: User) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === user.id ? user : u)),
      currentUser: prev.currentUser.id === user.id ? user : prev.currentUser,
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'UPDATE_USER',
          'users',
          user.id,
          `تم تحديث بيانات المستخدم: ${user.nameAr || user.name}`
        ),
        ...prev.auditLogs,
      ],
    }));
  };

  const deleteUser = (id: string): { success: boolean; error?: string } => {
    if (state.currentUser.id === id) {
      return { success: false, error: 'لا يمكن حذف الحساب المسجل به حالياً داخل النظام.' };
    }
    const target = state.users.find((u) => u.id === id);
    if (!target) return { success: false, error: 'المستخدم غير موجود' };

    setState((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== id),
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'DELETE_USER',
          'users',
          id,
          `تم حذف حساب المستخدم: ${target.nameAr || target.name}`
        ),
        ...prev.auditLogs,
      ],
    }));
    return { success: true };
  };

  const createEmployee = (empData: Omit<Employee, 'id' | 'employeeNumber'>): Employee => {
    const nextNum = state.employees.length + 101;
    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now()}`,
      employeeNumber: `EMP-${nextNum}`,
    };
    setState((prev) => ({
      ...prev,
      employees: [newEmp, ...prev.employees],
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'CREATE_EMPLOYEE',
          'employees',
          newEmp.id,
          `تم إضافة موظف جديد: ${newEmp.nameAr || newEmp.name} (${newEmp.jobTitleAr || newEmp.jobTitle})`
        ),
        ...prev.auditLogs,
      ],
    }));
    return newEmp;
  };

  const updateEmployee = (employee: Employee) => {
    setState((prev) => ({
      ...prev,
      employees: prev.employees.map((e) => (e.id === employee.id ? employee : e)),
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'UPDATE_EMPLOYEE',
          'employees',
          employee.id,
          `تم تحديث بيانات الموظف: ${employee.nameAr || employee.name}`
        ),
        ...prev.auditLogs,
      ],
    }));
  };

  const deleteEmployee = (id: string): { success: boolean; error?: string } => {
    const target = state.employees.find((e) => e.id === id);
    if (!target) return { success: false, error: 'الموظف غير موجود' };

    setState((prev) => ({
      ...prev,
      employees: prev.employees.filter((e) => e.id !== id),
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'DELETE_EMPLOYEE',
          'employees',
          id,
          `تم حذف الموظف: ${target.nameAr || target.name}`
        ),
        ...prev.auditLogs,
      ],
    }));
    return { success: true };
  };

  const deleteInvoice = (id: string): { success: boolean; error?: string } => {
    const inv = state.invoices.find((i) => i.id === id);
    if (!inv) return { success: false, error: 'الفاتورة غير موجودة.' };
    setState((prev) => ({
      ...prev,
      invoices: prev.invoices.filter((i) => i.id !== id),
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'DELETE_INVOICE',
          'invoices',
          id,
          `تم حذف الفاتورة رقم ${inv.invoiceNumber}`
        ),
        ...prev.auditLogs,
      ],
    }));
    return { success: true };
  };

  const switchUserRole = (role: RoleType) => {
    const matched = state.users.find((u) => u.role === role) || state.employees.find((e) => e.role === role);
    const newName = matched ? matched.name : `User (${role})`;
    const newNameAr = matched ? matched.nameAr : `مستخدم (${role})`;
    const updatedUser: User = matched && 'username' in matched ? (matched as User) : {
      id: matched ? matched.id : `u-${role}`,
      name: newName,
      nameAr: newNameAr,
      username: role,
      email: matched ? matched.email : `${role}@tagamoa-care.eg`,
      role,
      avatarUrl: matched?.avatarUrl,
      permissions: role === 'owner' ? ['*'] : [role],
      isActive: true,
    };
    setState((prev) => ({
      ...prev,
      currentUser: updatedUser,
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'SWITCH_ROLE',
          'users',
          role,
          `تم تبديل الدور النشط إلى: ${role}`
        ),
        ...prev.auditLogs,
      ],
    }));
    try {
      localStorage.setItem('tagamoa_auth_session', JSON.stringify({ userId: updatedUser.id, role }));
    } catch (_) {}
  };

  // Quick Reception Flow (Critical Workflow)
  const receiveVehicle = (data: {
    customerMode: 'existing' | 'new';
    customerId?: string;
    newCustomer?: { name: string; phone: string; email?: string; address?: string };
    vehicleMode: 'existing' | 'new';
    vehicleId?: string;
    newVehicle?: { plateNumber: string; vin?: string; make: string; model: string; year: number; color?: string };
    mileageIn: number;
    complaint: string;
    priority: Priority;
    advisorId: string;
    preExistingDamage?: string[];
    fuelLevel?: number;
  }) => {
    let customer: Customer | undefined;
    let vehicle: Vehicle | undefined;

    let updatedCustomers = [...state.customers];
    let updatedVehicles = [...state.vehicles];

    // 1. Resolve Customer
    if (data.customerMode === 'existing' && data.customerId) {
      customer = updatedCustomers.find((c) => c.id === data.customerId);
      if (!customer) return { success: false, error: 'Customer not found' };
    } else if (data.newCustomer) {
      const nextCustNum = `CUST-${1000 + updatedCustomers.length + 1}`;
      customer = {
        id: `c-${Date.now()}`,
        customerNumber: nextCustNum,
        name: data.newCustomer.name,
        phone: data.newCustomer.phone,
        email: data.newCustomer.email || '',
        address: data.newCustomer.address || 'New Cairo',
        customerType: 'individual',
        balance: 0,
        createdAt: new Date().toISOString().substring(0, 10),
      };
      updatedCustomers.push(customer);
    } else {
      return { success: false, error: 'Customer information required' };
    }

    // 2. Resolve Vehicle
    if (data.vehicleMode === 'existing' && data.vehicleId) {
      vehicle = updatedVehicles.find((v) => v.id === data.vehicleId);
      if (!vehicle) return { success: false, error: 'Vehicle not found' };
      // Update vehicle mileage and status
      vehicle = {
        ...vehicle,
        currentMileage: data.mileageIn,
        status: 'in_workshop',
        lastServiceDate: new Date().toISOString().substring(0, 10),
      };
      updatedVehicles = updatedVehicles.map((v) => (v.id === vehicle!.id ? vehicle! : v));
    } else if (data.newVehicle) {
      vehicle = {
        id: `v-${Date.now()}`,
        customerId: customer.id,
        plateNumber: data.newVehicle.plateNumber.toUpperCase(),
        vin: data.newVehicle.vin || `VIN-${Date.now().toString().slice(-8)}`,
        make: data.newVehicle.make,
        model: data.newVehicle.model,
        year: data.newVehicle.year,
        color: data.newVehicle.color || 'Black',
        fuelType: 'petrol',
        currentMileage: data.mileageIn,
        status: 'in_workshop',
        lastServiceDate: new Date().toISOString().substring(0, 10),
      };
      updatedVehicles.push(vehicle);
    } else {
      return { success: false, error: 'Vehicle information required' };
    }

    // 3. Resolve Advisor Name
    const advisor = state.employees.find((e) => e.id === data.advisorId) || state.employees[5];

    // 4. Generate Service Order
    const orderNum = `WO-2026-${String(100 + state.serviceOrders.length + 1).padStart(4, '0')}`;
    const newOrder: ServiceOrder = {
      id: `so-${Date.now()}`,
      orderNumber: orderNum,
      customerId: customer.id,
      vehicleId: vehicle.id,
      advisorId: advisor.id,
      advisorName: advisor.name,
      status: 'received',
      priority: data.priority,
      mileageIn: data.mileageIn,
      customerComplaint: data.complaint,
      preExistingDamage: data.preExistingDamage || [],
      fuelLevel: data.fuelLevel ?? 50,
      laborItems: [],
      partsItems: [],
      estimatedTotal: 0,
      approvedTotal: 0,
      actualTotal: 0,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    const newAudit = createAuditEntry(
      state.currentUser,
      'CREATE_RECEPTION',
      'service_orders',
      newOrder.orderNumber,
      `Quick reception created for ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber}) under customer ${customer.name}.`
    );

    const newNotification: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New Vehicle Received',
      titleAr: 'تم استلام مركبة جديدة في الورشة',
      message: `${orderNum} - ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber}) checked in.`,
      messageAr: `تم فتح كارت شغل ${orderNum} للسيارة ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber}).`,
      type: 'info',
      read: false,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      linkTab: 'service_orders',
      linkId: newOrder.id,
    };

    setState((prev) => ({
      ...prev,
      customers: updatedCustomers,
      vehicles: updatedVehicles,
      serviceOrders: [newOrder, ...prev.serviceOrders],
      auditLogs: [newAudit, ...prev.auditLogs],
      notifications: [newNotification, ...prev.notifications],
    }));

    return { success: true, serviceOrder: newOrder };
  };

  const updateServiceOrderStatus = (orderId: string, newStatus: ServiceOrderStatus, notes?: string) => {
    setState((prev) => {
      const order = prev.serviceOrders.find((o) => o.id === orderId);
      if (!order) return prev;

      const updatedOrders = prev.serviceOrders.map((o) => {
        if (o.id === orderId) {
          const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
          return {
            ...o,
            status: newStatus,
            internalNotes: notes ? `${o.internalNotes || ''}\n[${nowStr}] ${notes}` : o.internalNotes,
            completedAt: (newStatus === 'completed' || newStatus === 'ready_for_delivery') ? (o.completedAt || nowStr) : o.completedAt,
            deliveredAt: newStatus === 'completed' ? (o.deliveredAt || nowStr) : o.deliveredAt,
          };
        }
        return o;
      });

      // If marked completed, update vehicle status to awaiting_pickup or with_customer
      let updatedVehicles = prev.vehicles;
      if (newStatus === 'completed') {
        updatedVehicles = prev.vehicles.map((v) =>
          v.id === order.vehicleId ? { ...v, status: 'with_customer' } : v
        );
      } else if (newStatus === 'ready_for_delivery') {
        updatedVehicles = prev.vehicles.map((v) =>
          v.id === order.vehicleId ? { ...v, status: 'awaiting_pickup' } : v
        );
      }

      const audit = createAuditEntry(
        prev.currentUser,
        'UPDATE_ORDER_STATUS',
        'service_orders',
        order.orderNumber,
        `Status transitioned from ${order.status} to ${newStatus}. ${notes || ''}`
      );

      return {
        ...prev,
        serviceOrders: updatedOrders,
        vehicles: updatedVehicles,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  };

  const assignTechnician = (orderId: string, technicianId: string) => {
    const tech = state.employees.find((e) => e.id === technicianId);
    if (!tech) return;

    setState((prev) => {
      const updatedOrders = prev.serviceOrders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            assignedTechnicianId: tech.id,
            assignedTechnicianName: tech.name,
            status: o.status === 'received' ? 'awaiting_inspection' : o.status,
          };
        }
        return o;
      });

      const audit = createAuditEntry(
        prev.currentUser,
        'ASSIGN_TECHNICIAN',
        'service_orders',
        orderId,
        `Assigned lead technician ${tech.name} to work order.`
      );

      return {
        ...prev,
        serviceOrders: updatedOrders,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  };

  const addLaborItem = (orderId: string, item: Omit<LaborItem, 'id' | 'total'>) => {
    setState((prev) => {
      const order = prev.serviceOrders.find((o) => o.id === orderId);
      if (!order) return prev;

      const total = item.hours * item.hourlyRate;
      const newItem: LaborItem = {
        id: `l-${Date.now()}`,
        ...item,
        total,
      };

      const updatedLabor = [...order.laborItems, newItem];
      const laborTotal = updatedLabor.reduce((sum, l) => sum + l.total, 0);
      const partsTotal = order.partsItems.reduce((sum, p) => sum + p.total, 0);
      const grandTotal = laborTotal + partsTotal;

      const updatedOrders = prev.serviceOrders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              laborItems: updatedLabor,
              actualTotal: grandTotal,
              estimatedTotal: o.estimatedTotal === 0 ? grandTotal : o.estimatedTotal,
            }
          : o
      );

      return { ...prev, serviceOrders: updatedOrders };
    });
  };

  const issuePartToOrder = (orderId: string, partId: string, quantity: number) => {
    const part = state.spareParts.find((p) => p.id === partId);
    if (!part) return { success: false, error: 'Part not found' };
    if (part.currentStock < quantity) {
      return { success: false, error: `Insufficient stock: only ${part.currentStock} available in inventory` };
    }

    setState((prev) => {
      const order = prev.serviceOrders.find((o) => o.id === orderId);
      if (!order) return prev;

      // 1. Deduct part stock
      const updatedParts = prev.spareParts.map((p) =>
        p.id === partId ? { ...p, currentStock: p.currentStock - quantity } : p
      );

      // 2. Add stock movement
      const newMovement: StockMovement = {
        id: `sm-${Date.now()}`,
        partId: part.id,
        partName: part.name,
        partSku: part.sku,
        type: 'issue',
        quantity: -quantity,
        referenceType: 'service_order',
        referenceId: order.orderNumber,
        previousStock: part.currentStock,
        newStock: part.currentStock - quantity,
        unitCost: part.costPrice,
        notes: `Issued to ${order.orderNumber}`,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        createdBy: prev.currentUser.name,
      };

      // 3. Add to order parts
      const newOrderPart: OrderPartItem = {
        id: `pi-${Date.now()}`,
        partId: part.id,
        partName: part.name,
        partSku: part.sku,
        quantity,
        unitCost: part.costPrice,
        unitPrice: part.sellingPrice,
        total: quantity * part.sellingPrice,
        issued: true,
      };

      const updatedPartsList = [...order.partsItems, newOrderPart];
      const laborTotal = order.laborItems.reduce((sum, l) => sum + l.total, 0);
      const partsTotal = updatedPartsList.reduce((sum, p) => sum + p.total, 0);
      const grandTotal = laborTotal + partsTotal;

      const updatedOrders = prev.serviceOrders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              partsItems: updatedPartsList,
              actualTotal: grandTotal,
              status: o.status === 'waiting_parts' ? 'in_progress' : o.status,
            }
          : o
      );

      const audit = createAuditEntry(
        prev.currentUser,
        'ISSUE_SPARE_PART',
        'spare_parts',
        part.sku,
        `Issued ${quantity}x ${part.name} to ${order.orderNumber}. Stock updated: ${part.currentStock} -> ${part.currentStock - quantity}`
      );

      return {
        ...prev,
        spareParts: updatedParts,
        stockMovements: [newMovement, ...prev.stockMovements],
        serviceOrders: updatedOrders,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });

    return { success: true };
  };

  const createInspection = (data: Omit<Inspection, 'id' | 'inspectionNumber'>) => {
    const inspNum = `INSP-2026-${String(90 + state.inspections.length + 1).padStart(4, '0')}`;
    const newInsp: Inspection = {
      ...data,
      id: `insp-${Date.now()}`,
      inspectionNumber: inspNum,
    };

    setState((prev) => ({
      ...prev,
      inspections: [newInsp, ...prev.inspections],
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'CREATE_INSPECTION',
          'inspections',
          inspNum,
          `Completed vehicle inspection checklist for WO: ${data.serviceOrderId}`
        ),
        ...prev.auditLogs,
      ],
    }));

    return newInsp;
  };

  const convertInspectionToEstimate = (inspectionId: string) => {
    const insp = state.inspections.find((i) => i.id === inspectionId);
    if (!insp) throw new Error('Inspection not found');

    const order = state.serviceOrders.find((o) => o.id === insp.serviceOrderId);
    const criticalItems = insp.items.filter((item) => item.condition === 'critical' || item.condition === 'attention');

    const laborItems: LaborItem[] = criticalItems.map((item, idx) => ({
      id: `el-${Date.now()}-${idx}`,
      description: item.recommendedAction || `Repair/Replace ${item.component}`,
      hours: 2,
      hourlyRate: 850,
      total: 1700,
    }));

    const partsItems: OrderPartItem[] = criticalItems.slice(0, 2).map((item, idx) => {
      const samplePart = state.spareParts[idx % state.spareParts.length];
      return {
        id: `epi-${Date.now()}-${idx}`,
        partId: samplePart.id,
        partName: samplePart.name,
        partSku: samplePart.sku,
        quantity: 1,
        unitCost: samplePart.costPrice,
        unitPrice: samplePart.sellingPrice,
        total: samplePart.sellingPrice,
        issued: false,
      };
    });

    const laborSub = laborItems.reduce((s, l) => s + l.total, 0);
    const partsSub = partsItems.reduce((s, p) => s + p.total, 0);
    const subtotal = laborSub + partsSub;
    const taxRate = state.settings.taxRate;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    const estNum = `EST-2026-${String(115 + state.estimates.length + 1).padStart(4, '0')}`;
    const newEst: Estimate = {
      id: `est-${Date.now()}`,
      estimateNumber: estNum,
      serviceOrderId: insp.serviceOrderId,
      customerId: order ? order.customerId : 'c-1',
      vehicleId: insp.vehicleId,
      status: 'draft',
      laborItems,
      partsItems,
      subtotal,
      discount: 0,
      taxRate,
      taxAmount,
      total,
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setState((prev) => ({
      ...prev,
      estimates: [newEst, ...prev.estimates],
      inspections: prev.inspections.map((i) =>
        i.id === inspectionId ? { ...i, exportedToEstimate: true } : i
      ),
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'EXPORT_INSPECTION_TO_ESTIMATE',
          'estimates',
          estNum,
          `Converted inspection ${insp.inspectionNumber} into Estimate ${estNum}`
        ),
        ...prev.auditLogs,
      ],
    }));

    return newEst;
  };

  const createEstimate = (data: Omit<Estimate, 'id' | 'estimateNumber'>) => {
    const estNum = `EST-2026-${String(115 + state.estimates.length + 1).padStart(4, '0')}`;
    const newEst: Estimate = {
      ...data,
      id: `est-${Date.now()}`,
      estimateNumber: estNum,
    };

    setState((prev) => ({
      ...prev,
      estimates: [newEst, ...prev.estimates],
    }));

    return newEst;
  };

  const approveEstimate = (estimateId: string) => {
    setState((prev) => {
      const est = prev.estimates.find((e) => e.id === estimateId);
      if (!est) return prev;

      const updatedEstimates = prev.estimates.map((e) =>
        e.id === estimateId
          ? {
              ...e,
              status: 'approved' as const,
              approvalDate: new Date().toISOString().substring(0, 10),
              approvedBy: prev.currentUser.name,
            }
          : e
      );

      // Also update linked ServiceOrder status to 'approved' and approvedTotal
      const updatedOrders = prev.serviceOrders.map((o) =>
        o.id === est.serviceOrderId
          ? {
              ...o,
              status: 'approved' as const,
              approvedTotal: est.total,
              laborItems: est.laborItems.length > 0 ? est.laborItems : o.laborItems,
              partsItems: est.partsItems.length > 0 ? est.partsItems : o.partsItems,
            }
          : o
      );

      const audit = createAuditEntry(
        prev.currentUser,
        'APPROVE_ESTIMATE',
        'estimates',
        est.estimateNumber,
        `Estimate ${est.estimateNumber} approved for ${est.total.toLocaleString()} EGP.`
      );

      return {
        ...prev,
        estimates: updatedEstimates,
        serviceOrders: updatedOrders,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  };

  const convertEstimateToInvoice = (estimateId: string) => {
    const est = state.estimates.find((e) => e.id === estimateId);
    if (!est) throw new Error('Estimate not found');

    const customer = state.customers.find((c) => c.id === est.customerId);
    const vehicle = state.vehicles.find((v) => v.id === est.vehicleId);

    const invoiceItems = [
      ...est.laborItems.map((l) => ({
        id: `inv-item-${Date.now()}-${l.id}`,
        description: l.description,
        type: 'labor' as const,
        quantity: l.hours,
        unitPrice: l.hourlyRate,
        total: l.total,
      })),
      ...est.partsItems.map((p) => ({
        id: `inv-item-${Date.now()}-${p.id}`,
        description: p.partName,
        type: 'part' as const,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        total: p.total,
      })),
    ];

    const invNum = `INV-2026-${String(215 + state.invoices.length + 1).padStart(4, '0')}`;
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNum,
      serviceOrderId: est.serviceOrderId,
      customerId: est.customerId,
      customerName: customer ? customer.name : 'Valued Client',
      vehiclePlate: vehicle ? `${vehicle.plateNumber} (${vehicle.make} ${vehicle.model})` : undefined,
      issueDate: new Date().toISOString().substring(0, 10),
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
      items: invoiceItems,
      subtotal: est.subtotal,
      discount: est.discount,
      taxRate: est.taxRate,
      taxAmount: est.taxAmount,
      totalAmount: est.total,
      paidAmount: 0,
      balanceDue: est.total,
      status: 'unpaid',
      notes: `Generated from approved estimate ${est.estimateNumber}`,
    };

    setState((prev) => ({
      ...prev,
      invoices: [newInvoice, ...prev.invoices],
      estimates: prev.estimates.map((e) =>
        e.id === estimateId ? { ...e, convertedToInvoiceId: newInvoice.id } : e
      ),
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'CREATE_INVOICE_FROM_ESTIMATE',
          'invoices',
          invNum,
          `Generated tax invoice ${invNum} from estimate ${est.estimateNumber}`
        ),
        ...prev.auditLogs,
      ],
    }));

    return newInvoice;
  };

  const createInvoice = (data: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const invNum = `INV-2026-${String(215 + state.invoices.length + 1).padStart(4, '0')}`;
    const newInvoice: Invoice = {
      ...data,
      id: `inv-${Date.now()}`,
      invoiceNumber: invNum,
    };

    setState((prev) => ({
      ...prev,
      invoices: [newInvoice, ...prev.invoices],
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'CREATE_INVOICE',
          'invoices',
          invNum,
          `Issued invoice ${invNum} for ${newInvoice.totalAmount.toLocaleString()} EGP`
        ),
        ...prev.auditLogs,
      ],
    }));

    return newInvoice;
  };

  const recordPayment = (
    invoiceId: string,
    amount: number,
    paymentMethod: 'cash' | 'credit_card' | 'bank_transfer' | 'instapay_vodafone',
    notes?: string
  ) => {
    const invoice = state.invoices.find((i) => i.id === invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    const payNum = `RCP-2026-${String(320 + state.payments.length + 1).padStart(4, '0')}`;
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      paymentNumber: payNum,
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      amount,
      paymentMethod,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      receivedBy: state.currentUser.name,
      notes,
      receiptNumber: `REC-${Math.floor(10000 + Math.random() * 90000)}`,
    };

    // Determine target cash account
    const targetAccountId =
      paymentMethod === 'cash'
        ? 'acc-1' // Reception Safe
        : paymentMethod === 'credit_card' || paymentMethod === 'bank_transfer'
        ? 'acc-2' // CIB Operating Account
        : 'acc-1'; // Default InstaPay to safe

    setState((prev) => {
      // 1. Update Invoice
      const newPaid = invoice.paidAmount + amount;
      const newBalance = Math.max(0, invoice.totalAmount - newPaid);
      const newStatus = newBalance === 0 ? 'paid' : 'partially_paid';

      const updatedInvoices = prev.invoices.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              paidAmount: newPaid,
              balanceDue: newBalance,
              status: newStatus as any,
              paymentMethod,
            }
          : inv
      );

      // 2. Update Customer Balance
      const updatedCustomers = prev.customers.map((c) =>
        c.id === invoice.customerId ? { ...c, balance: Math.max(0, c.balance - amount) } : c
      );

      // 3. Update Cash Account
      const targetAcc = prev.cashAccounts.find((a) => a.id === targetAccountId) || prev.cashAccounts[0];
      const newAccBalance = targetAcc.currentBalance + amount;
      const updatedCashAccounts = prev.cashAccounts.map((a) =>
        a.id === targetAcc.id ? { ...a, currentBalance: newAccBalance } : a
      );

      // 4. Cash Movement Ledger
      const newMovement: CashMovement = {
        id: `cm-${Date.now()}`,
        accountId: targetAcc.id,
        accountName: targetAcc.name,
        type: 'inflow',
        amount,
        category: 'Customer Invoice Payment',
        description: `Payment for ${invoice.invoiceNumber} (${invoice.customerName}) via ${paymentMethod}`,
        referenceId: payNum,
        balanceAfter: newAccBalance,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        performedBy: prev.currentUser.name,
      };

      const audit = createAuditEntry(
        prev.currentUser,
        'RECORD_PAYMENT',
        'payments',
        payNum,
        `Collected ${amount.toLocaleString()} EGP for invoice ${invoice.invoiceNumber}. Account ${targetAcc.name} updated.`
      );

      return {
        ...prev,
        invoices: updatedInvoices,
        customers: updatedCustomers,
        payments: [newPayment, ...prev.payments],
        cashAccounts: updatedCashAccounts,
        cashMovements: [newMovement, ...prev.cashMovements],
        auditLogs: [audit, ...prev.auditLogs],
      };
    });

    return newPayment;
  };

  const recordExpense = (data: Omit<Expense, 'id' | 'expenseNumber'>) => {
    const expNum = `EXP-2026-${String(45 + state.expenses.length + 1).padStart(4, '0')}`;
    const newExpense: Expense = {
      ...data,
      id: `exp-${Date.now()}`,
      expenseNumber: expNum,
    };

    setState((prev) => {
      const targetAcc = prev.cashAccounts.find((a) => a.id === data.accountId) || prev.cashAccounts[0];
      const newBalance = targetAcc.currentBalance - data.amount;

      const updatedAccounts = prev.cashAccounts.map((a) =>
        a.id === targetAcc.id ? { ...a, currentBalance: newBalance } : a
      );

      const newMovement: CashMovement = {
        id: `cm-${Date.now()}`,
        accountId: targetAcc.id,
        accountName: targetAcc.name,
        type: 'outflow',
        amount: data.amount,
        category: `Operating Expense: ${data.category}`,
        description: data.description,
        referenceId: expNum,
        balanceAfter: newBalance,
        date: data.date,
        performedBy: prev.currentUser.name,
      };

      const audit = createAuditEntry(
        prev.currentUser,
        'RECORD_EXPENSE',
        'expenses',
        expNum,
        `Paid ${data.amount.toLocaleString()} EGP to ${data.paidTo} for ${data.description}.`
      );

      return {
        ...prev,
        expenses: [newExpense, ...prev.expenses],
        cashAccounts: updatedAccounts,
        cashMovements: [newMovement, ...prev.cashMovements],
        auditLogs: [audit, ...prev.auditLogs],
      };
    });

    return newExpense;
  };

  const receivePurchaseOrder = (poId: string) => {
    setState((prev) => {
      const po = prev.purchaseOrders.find((p) => p.id === poId);
      if (!po || po.status === 'received') return prev;

      // 1. Increment parts stock
      let updatedParts = [...prev.spareParts];
      const newMovements: StockMovement[] = [];

      po.items.forEach((item) => {
        const partIdx = updatedParts.findIndex((p) => p.id === item.partId);
        if (partIdx !== -1) {
          const oldStock = updatedParts[partIdx].currentStock;
          const newStock = oldStock + item.quantity;
          updatedParts[partIdx] = {
            ...updatedParts[partIdx],
            currentStock: newStock,
          };

          newMovements.push({
            id: `sm-${Date.now()}-${item.partId}`,
            partId: item.partId,
            partName: item.partName,
            partSku: item.partSku,
            type: 'receipt',
            quantity: item.quantity,
            referenceType: 'purchase_order',
            referenceId: po.poNumber,
            previousStock: oldStock,
            newStock,
            unitCost: item.unitCost,
            notes: `Received delivery from ${po.supplierName}`,
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            createdBy: prev.currentUser.name,
          });
        }
      });

      // 2. Mark PO as received
      const updatedPOs = prev.purchaseOrders.map((p) =>
        p.id === poId
          ? {
              ...p,
              status: 'received' as const,
              receivedDate: new Date().toISOString().substring(0, 10),
            }
          : p
      );

      const audit = createAuditEntry(
        prev.currentUser,
        'RECEIVE_PURCHASE_ORDER',
        'purchase_orders',
        po.poNumber,
        `Received delivery for ${po.poNumber} (${po.items.length} items). Inventory stocks increased.`
      );

      return {
        ...prev,
        spareParts: updatedParts,
        purchaseOrders: updatedPOs,
        stockMovements: [...newMovements, ...prev.stockMovements],
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  };

  const createPurchaseOrder = (data: Omit<PurchaseOrder, 'id' | 'poNumber'>) => {
    const poNum = `PO-2026-${String(43 + state.purchaseOrders.length + 1).padStart(4, '0')}`;
    const newPO: PurchaseOrder = {
      ...data,
      id: `po-${Date.now()}`,
      poNumber: poNum,
    };

    setState((prev) => ({
      ...prev,
      purchaseOrders: [newPO, ...prev.purchaseOrders],
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'CREATE_PURCHASE_ORDER',
          'purchase_orders',
          poNum,
          `Created PO ${poNum} for supplier ${data.supplierName} with total ${data.total.toLocaleString()} EGP`
        ),
        ...prev.auditLogs,
      ],
    }));

    return newPO;
  };

  const createCustomer = (data: Omit<Customer, 'id' | 'customerNumber' | 'balance' | 'createdAt'>) => {
    const custNum = `CUST-${1000 + state.customers.length + 1}`;
    const newCust: Customer = {
      ...data,
      id: `c-${Date.now()}`,
      customerNumber: custNum,
      balance: 0,
      createdAt: new Date().toISOString().substring(0, 10),
    };

    setState((prev) => ({
      ...prev,
      customers: [...prev.customers, newCust],
    }));

    return newCust;
  };

  const updateCustomer = (customer: Customer) => {
    setState((prev) => ({
      ...prev,
      customers: prev.customers.map((c) => (c.id === customer.id ? customer : c)),
    }));
  };

  const createVehicle = (data: Omit<Vehicle, 'id'>) => {
    const newVeh: Vehicle = {
      ...data,
      id: `v-${Date.now()}`,
    };

    setState((prev) => ({
      ...prev,
      vehicles: [...prev.vehicles, newVeh],
    }));

    return newVeh;
  };

  const updateVehicle = (vehicle: Vehicle) => {
    setState((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v) => (v.id === vehicle.id ? vehicle : v)),
    }));
  };

  const createSparePart = (data: Omit<SparePart, 'id'>) => {
    const newPart: SparePart = {
      ...data,
      id: `p-${Date.now()}`,
    };

    setState((prev) => ({
      ...prev,
      spareParts: [...prev.spareParts, newPart],
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'CREATE_SPARE_PART',
          'spare_parts',
          data.sku,
          `Added new part catalog item: ${data.name} (${data.sku})`
        ),
        ...prev.auditLogs,
      ],
    }));

    return newPart;
  };

  const updateSparePart = (part: SparePart) => {
    setState((prev) => ({
      ...prev,
      spareParts: prev.spareParts.map((p) => (p.id === part.id ? part : p)),
    }));
  };

  const toggleCheckIn = (employeeId: string) => {
    setState((prev) => {
      const today = new Date().toISOString().substring(0, 10);
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const existing = prev.attendance.find((a) => a.employeeId === employeeId && a.date === today);

      let updatedAttendance = [...prev.attendance];
      if (existing) {
        if (!existing.checkOut) {
          updatedAttendance = updatedAttendance.map((a) =>
            a.id === existing.id ? { ...a, checkOut: nowTime } : a
          );
        }
      } else {
        const emp = prev.employees.find((e) => e.id === employeeId);
        updatedAttendance.push({
          id: `att-${Date.now()}`,
          employeeId,
          employeeName: emp ? emp.name : 'Staff',
          date: today,
          checkIn: nowTime,
          status: 'present',
        });
      }

      return { ...prev, attendance: updatedAttendance };
    });
  };

  const setAttendanceStatus = (data: {
    employeeId: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'leave';
    checkIn?: string;
    checkOut?: string;
    overtimeHours?: number;
    delayMinutes?: number;
    notes?: string;
  }) => {
    setState((prev) => {
      const emp = prev.employees.find((e) => e.id === data.employeeId);
      const existingIdx = prev.attendance.findIndex(
        (a) => a.employeeId === data.employeeId && a.date === data.date
      );

      const defaultCheckIn = data.status === 'present' ? '08:30' : data.status === 'late' ? '09:15' : undefined;
      const defaultCheckOut = (data.status === 'present' || data.status === 'late') ? '17:30' : undefined;

      const newRecord: AttendanceRecord = {
        id: existingIdx >= 0 ? prev.attendance[existingIdx].id : `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        employeeId: data.employeeId,
        employeeName: emp ? (emp.nameAr || emp.name) : 'Staff',
        date: data.date,
        status: data.status,
        checkIn: data.checkIn ?? defaultCheckIn,
        checkOut: data.checkOut ?? defaultCheckOut,
        overtimeHours: data.overtimeHours || 0,
        delayMinutes: data.delayMinutes || (data.status === 'late' ? 30 : 0),
        notes: data.notes || '',
      };

      const updated = [...prev.attendance];
      if (existingIdx >= 0) {
        updated[existingIdx] = newRecord;
      } else {
        updated.unshift(newRecord);
      }

      return {
        ...prev,
        attendance: updated,
      };
    });
  };

  const savePayrollRecord = (record: PayrollRecord) => {
    setState((prev) => {
      const existingIdx = prev.payrollRecords.findIndex(
        (p) => p.id === record.id || (p.employeeId === record.employeeId && p.payrollMonth === record.payrollMonth)
      );

      const updated = [...prev.payrollRecords];
      if (existingIdx >= 0) {
        updated[existingIdx] = { ...updated[existingIdx], ...record };
      } else {
        updated.unshift({ ...record, id: record.id || `pr-${Date.now()}` });
      }

      return {
        ...prev,
        payrollRecords: updated,
      };
    });
  };

  const approveLeaveRequest = (requestId: string) => {
    setState((prev) => ({
      ...prev,
      leaveRequests: prev.leaveRequests.map((l) =>
        l.id === requestId ? { ...l, status: 'approved', reviewedBy: prev.currentUser.name } : l
      ),
    }));
  };

  const updateSettings = (settings: Partial<BusinessSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  };

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const markAllNotificationsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const resetDemoData = () => {
    const fresh = resetStateToSeed();
    setState(fresh);
  };

  const deleteCustomer = (id: string): { success: boolean; error?: string } => {
    const target = state.customers.find((c) => c.id === id);
    if (!target) return { success: false, error: 'العميل غير موجود' };
    setState((prev) => ({
      ...prev,
      customers: prev.customers.filter((c) => c.id !== id),
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'DELETE_CUSTOMER',
          'customers',
          id,
          `تم حذف العميل: ${target.nameAr || target.name}`
        ),
        ...prev.auditLogs,
      ],
    }));
    return { success: true };
  };

  const deleteVehicle = (id: string): { success: boolean; error?: string } => {
    const target = state.vehicles.find((v) => v.id === id);
    if (!target) return { success: false, error: 'المركبة غير موجودة' };
    setState((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((v) => v.id !== id),
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'DELETE_VEHICLE',
          'vehicles',
          id,
          `تم حذف المركبة: ${target.make} ${target.model} (${target.plateNumber})`
        ),
        ...prev.auditLogs,
      ],
    }));
    return { success: true };
  };

  const deleteServiceOrder = (id: string): { success: boolean; error?: string } => {
    const target = state.serviceOrders.find((o) => o.id === id);
    if (!target) return { success: false, error: 'أمر الشغل غير موجود' };
    setState((prev) => ({
      ...prev,
      serviceOrders: prev.serviceOrders.filter((o) => o.id !== id),
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'DELETE_SERVICE_ORDER',
          'serviceOrders',
          id,
          `تم حذف أمر الشغل رقم: ${target.orderNumber}`
        ),
        ...prev.auditLogs,
      ],
    }));
    return { success: true };
  };

  const deleteSparePart = (id: string): { success: boolean; error?: string } => {
    const target = state.spareParts.find((p) => p.id === id);
    if (!target) return { success: false, error: 'قطعة الغيار غير موجودة' };
    setState((prev) => ({
      ...prev,
      spareParts: prev.spareParts.filter((p) => p.id !== id),
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'DELETE_SPARE_PART',
          'inventory',
          id,
          `تم حذف قطعة الغيار: ${target.nameAr || target.name}`
        ),
        ...prev.auditLogs,
      ],
    }));
    return { success: true };
  };

  const deleteExpense = (id: string): { success: boolean; error?: string } => {
    const target = state.expenses.find((e) => e.id === id);
    if (!target) return { success: false, error: 'إذن الصرف غير موجود' };
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'DELETE_EXPENSE',
          'finance',
          id,
          `تم حذف إذن الصرف رقم: ${target.expenseNumber}`
        ),
        ...prev.auditLogs,
      ],
    }));
    return { success: true };
  };

  const deleteSupplier = (id: string): { success: boolean; error?: string } => {
    const target = state.suppliers.find((s) => s.id === id);
    if (!target) return { success: false, error: 'المورد غير موجود' };
    setState((prev) => ({
      ...prev,
      suppliers: prev.suppliers.filter((s) => s.id !== id),
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'DELETE_SUPPLIER',
          'inventory',
          id,
          `تم حذف المورد: ${target.name}`
        ),
        ...prev.auditLogs,
      ],
    }));
    return { success: true };
  };

  const deletePurchaseOrder = (id: string): { success: boolean; error?: string } => {
    const target = state.purchaseOrders.find((po) => po.id === id);
    if (!target) return { success: false, error: 'أمر الشراء غير موجود' };
    setState((prev) => ({
      ...prev,
      purchaseOrders: prev.purchaseOrders.filter((po) => po.id !== id),
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'DELETE_PURCHASE_ORDER',
          'inventory',
          id,
          `تم حذف أمر الشراء: ${target.poNumber}`
        ),
        ...prev.auditLogs,
      ],
    }));
    return { success: true };
  };

  const deleteEstimate = (id: string): { success: boolean; error?: string } => {
    const target = state.estimates.find((e) => e.id === id);
    if (!target) return { success: false, error: 'المقايسة غير موجودة' };
    setState((prev) => ({
      ...prev,
      estimates: prev.estimates.filter((e) => e.id !== id),
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'DELETE_ESTIMATE',
          'estimates',
          id,
          `تم حذف المقايسة رقم: ${target.estimateNumber}`
        ),
        ...prev.auditLogs,
      ],
    }));
    return { success: true };
  };

  const deleteInspection = (id: string): { success: boolean; error?: string } => {
    const target = state.inspections.find((i) => i.id === id);
    if (!target) return { success: false, error: 'تقرير الفحص غير موجود' };
    setState((prev) => ({
      ...prev,
      inspections: prev.inspections.filter((i) => i.id !== id),
      auditLogs: [
        createAuditEntry(
          prev.currentUser,
          'DELETE_INSPECTION',
          'inspections',
          id,
          `تم حذف تقرير الفحص رقم: ${target.inspectionNumber}`
        ),
        ...prev.auditLogs,
      ],
    }));
    return { success: true };
  };

  const createSale = (data: Omit<VehicleSale, 'id' | 'saleNumber'>): VehicleSale => {
    const nextNum = (state.sales?.length || 0) + 1;
    const newSale: VehicleSale = {
      ...data,
      id: `sale-${Date.now()}`,
      saleNumber: `SAL-2026-${String(nextNum).padStart(4, '0')}`,
    };
    setState((prev) => ({
      ...prev,
      sales: [newSale, ...(prev.sales || [])],
      vehicles: prev.vehicles.map((v) =>
        v.id === data.vehicleId ? { ...v, saleStatus: 'sold' } : v
      ),
    }));
    return newSale;
  };

  const updateSale = (sale: VehicleSale) => {
    setState((prev) => ({
      ...prev,
      sales: (prev.sales || []).map((s) => (s.id === sale.id ? sale : s)),
    }));
  };

  const deleteSale = (id: string) => {
    setState((prev) => {
      const target = (prev.sales || []).find((s) => s.id === id);
      return {
        ...prev,
        sales: (prev.sales || []).filter((s) => s.id !== id),
        vehicles: target
          ? prev.vehicles.map((v) =>
              v.id === target.vehicleId ? { ...v, saleStatus: 'available' } : v
            )
          : prev.vehicles,
      };
    });
  };

  const createPurchase = (data: Omit<VehiclePurchase, 'id' | 'purchaseNumber'>): VehiclePurchase => {
    const nextNum = (state.purchases?.length || 0) + 1;
    const newPurchase: VehiclePurchase = {
      ...data,
      id: `pur-${Date.now()}`,
      purchaseNumber: `PUR-2026-${String(nextNum).padStart(4, '0')}`,
    };
    const newVehicle: Vehicle = {
      id: `v-acq-${Date.now()}`,
      customerId: 'dealership',
      plateNumber: data.plateNumber || 'Pending Reg',
      vin: data.vin,
      make: data.make,
      model: data.model,
      year: data.year,
      color: 'Executive Black',
      fuelType: 'petrol',
      currentMileage: 0,
      status: 'in_workshop',
      purchaseCost: data.totalCost,
      listingPrice: Math.round(data.totalCost * 1.15),
      saleStatus: 'available',
      rentalStatus: 'available',
      category: 'luxury',
    };
    setState((prev) => ({
      ...prev,
      purchases: [newPurchase, ...(prev.purchases || [])],
      vehicles: [newVehicle, ...prev.vehicles],
    }));
    return newPurchase;
  };

  const updatePurchase = (purchase: VehiclePurchase) => {
    setState((prev) => ({
      ...prev,
      purchases: (prev.purchases || []).map((p) => (p.id === purchase.id ? purchase : p)),
    }));
  };

  const deletePurchase = (id: string) => {
    setState((prev) => ({
      ...prev,
      purchases: (prev.purchases || []).filter((p) => p.id !== id),
    }));
  };

  const createRental = (data: Omit<VehicleRental, 'id' | 'bookingNumber'>): VehicleRental => {
    const nextNum = (state.rentals?.length || 0) + 1;
    const newRental: VehicleRental = {
      ...data,
      id: `rent-${Date.now()}`,
      bookingNumber: `RNT-2026-${String(nextNum).padStart(4, '0')}`,
    };
    setState((prev) => ({
      ...prev,
      rentals: [newRental, ...(prev.rentals || [])],
      vehicles: prev.vehicles.map((v) =>
        v.id === data.vehicleId ? { ...v, rentalStatus: 'rented' } : v
      ),
    }));
    return newRental;
  };

  const updateRental = (rental: VehicleRental) => {
    setState((prev) => ({
      ...prev,
      rentals: (prev.rentals || []).map((r) => (r.id === rental.id ? rental : r)),
    }));
  };

  const deleteRental = (id: string) => {
    setState((prev) => {
      const target = (prev.rentals || []).find((r) => r.id === id);
      return {
        ...prev,
        rentals: (prev.rentals || []).filter((r) => r.id !== id),
        vehicles: target
          ? prev.vehicles.map((v) =>
              v.id === target.vehicleId ? { ...v, rentalStatus: 'available' } : v
            )
          : prev.vehicles,
      };
    });
  };

  const refreshData = async () => {
    try {
      const res = await fetch('/api/db');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setState(json.data);
        }
      }
    } catch (e) {
      console.warn('Refresh from server failed:', e);
    }
  };

  const printDocument = (docType: string, data: any) => {
    setActivePrintDoc({ docType, data });
  };

  const closePrintDoc = () => {
    setActivePrintDoc(null);
  };

  return (
    <AppContext.Provider
      value={{
        state,
        t,
        language,
        setLanguage,
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        isSearchModalOpen,
        setIsSearchModalOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        isRoleSwitcherOpen,
        setIsRoleSwitcherOpen,

        // Auth
        isAuthenticated,
        login,
        logout,

        // User CRUD
        createUser,
        updateUser,
        deleteUser,

        // Employee CRUD
        createEmployee,
        updateEmployee,
        deleteEmployee,

        // Invoice Deletion
        deleteInvoice,

        switchUserRole,
        receiveVehicle,
        updateServiceOrderStatus,
        assignTechnician,
        addLaborItem,
        issuePartToOrder,
        createInspection,
        convertInspectionToEstimate,
        createEstimate,
        approveEstimate,
        convertEstimateToInvoice,
        createInvoice,
        recordPayment,
        recordExpense,
        receivePurchaseOrder,
        createPurchaseOrder,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        createVehicle,
        updateVehicle,
        deleteVehicle,
        deleteServiceOrder,

        createSale,
        updateSale,
        deleteSale,
        createPurchase,
        updatePurchase,
        deletePurchase,
        createRental,
        updateRental,
        deleteRental,

        createSparePart,
        updateSparePart,
        deleteSparePart,
        deleteExpense,
        deleteSupplier,
        deletePurchaseOrder,
        deleteEstimate,
        deleteInspection,
        toggleCheckIn,
        setAttendanceStatus,
        savePayrollRecord,
        approveLeaveRequest,
        updateSettings,
        markNotificationRead,
        markAllNotificationsRead,
        resetDemoData,
        refreshData,

        printDocument,
        activePrintDoc,
        closePrintDoc,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
