import {
  Customer,
  Vehicle,
  ServiceOrder,
  ServiceOrderStatus,
  Inspection,
  Estimate,
  SparePart,
  StockMovement,
  Supplier,
  PurchaseOrder,
  Invoice,
  Payment,
  CashAccount,
  CashMovement,
  Expense,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  PayrollRecord,
  AuditLog,
  NotificationItem,
  BusinessSettings,
  User,
  RoleType,
  Priority,
  LaborItem,
  OrderPartItem,
  VehicleSale,
  VehiclePurchase,
  VehicleRental,
} from '../types';

import {
  initialUsers,
  initialCustomers,
  initialVehicles,
  initialServiceOrders,
  initialSpareParts,
  initialSuppliers,
  initialPurchaseOrders,
  initialStockMovements,
  initialInspections,
  initialEstimates,
  initialInvoices,
  initialPayments,
  initialCashAccounts,
  initialCashMovements,
  initialExpenses,
  initialEmployees,
  initialAttendance,
  initialLeaveRequests,
  initialPayrollRecords,
  initialAuditLogs,
  initialNotifications,
  initialSettings,
  initialSales,
  initialPurchases,
  initialRentals,
} from '../data/seedData';

const STORAGE_KEY = 'autocare_pro_erp_state_v1';

export interface AppState {
  currentUser: User;
  users: User[];
  settings: BusinessSettings;
  customers: Customer[];
  vehicles: Vehicle[];
  serviceOrders: ServiceOrder[];
  sales: VehicleSale[];
  purchases: VehiclePurchase[];
  rentals: VehicleRental[];
  spareParts: SparePart[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  stockMovements: StockMovement[];
  inspections: Inspection[];
  estimates: Estimate[];
  invoices: Invoice[];
  payments: Payment[];
  cashAccounts: CashAccount[];
  cashMovements: CashMovement[];
  expenses: Expense[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  payrollRecords: PayrollRecord[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
}

export function getInitialState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate that parsed has customers
      if (parsed.customers && parsed.customers.length > 0) {
        if (!parsed.users || parsed.users.length === 0) parsed.users = initialUsers;
        if (!parsed.employees || parsed.employees.length === 0) parsed.employees = initialEmployees;
        if (!parsed.sales) parsed.sales = initialSales;
        if (!parsed.purchases) parsed.purchases = initialPurchases;
        if (!parsed.rentals) parsed.rentals = initialRentals;
        if (parsed.settings) {
          parsed.settings.workshopName = 'مركز صيانة التجمع الخامس';
          parsed.settings.workshopNameAr = 'مركز صيانة التجمع الخامس - القاهرة الجديدة';
          parsed.settings.language = 'ar';
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load saved state from localStorage, falling back to seed data:', err);
  }

  return {
    currentUser: initialUsers[0],
    users: initialUsers,
    settings: initialSettings,
    customers: initialCustomers,
    vehicles: initialVehicles,
    serviceOrders: initialServiceOrders,
    sales: initialSales,
    purchases: initialPurchases,
    rentals: initialRentals,
    spareParts: initialSpareParts,
    suppliers: initialSuppliers,
    purchaseOrders: initialPurchaseOrders,
    stockMovements: initialStockMovements,
    inspections: initialInspections,
    estimates: initialEstimates,
    invoices: initialInvoices,
    payments: initialPayments,
    cashAccounts: initialCashAccounts,
    cashMovements: initialCashMovements,
    expenses: initialExpenses,
    employees: initialEmployees,
    attendance: initialAttendance,
    leaveRequests: initialLeaveRequests,
    payrollRecords: initialPayrollRecords,
    auditLogs: initialAuditLogs,
    notifications: initialNotifications,
  };
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
}

export function resetStateToSeed(): AppState {
  const freshState: AppState = {
    currentUser: initialUsers[0],
    users: initialUsers,
    settings: initialSettings,
    customers: initialCustomers,
    vehicles: initialVehicles,
    serviceOrders: initialServiceOrders,
    sales: initialSales,
    purchases: initialPurchases,
    rentals: initialRentals,
    spareParts: initialSpareParts,
    suppliers: initialSuppliers,
    purchaseOrders: initialPurchaseOrders,
    stockMovements: initialStockMovements,
    inspections: initialInspections,
    estimates: initialEstimates,
    invoices: initialInvoices,
    payments: initialPayments,
    cashAccounts: initialCashAccounts,
    cashMovements: initialCashMovements,
    expenses: initialExpenses,
    employees: initialEmployees,
    attendance: initialAttendance,
    leaveRequests: initialLeaveRequests,
    payrollRecords: initialPayrollRecords,
    auditLogs: [
      {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userId: initialUsers[0].id,
        userName: initialUsers[0].name,
        userRole: initialUsers[0].role,
        action: 'RESET_DEMO_DATABASE',
        entity: 'system',
        entityId: 'ALL',
        details: 'Restored clean factory demo database with all linked business records.',
      },
      ...initialAuditLogs,
    ],
    notifications: [
      {
        id: `notif-${Date.now()}`,
        title: 'Demo Data Restored',
        titleAr: 'تمت استعادة البيانات التجريبية',
        message: 'All records have been reset to factory state.',
        messageAr: 'تمت إعادة ضبط جميع السجلات للبيانات الأصلية المترابطة.',
        type: 'info',
        read: false,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      },
      ...initialNotifications,
    ],
  };

  saveState(freshState);
  return freshState;
}

// Helper to log audit trail
export function createAuditEntry(
  user: User,
  action: string,
  entity: string,
  entityId: string,
  details: string
): AuditLog {
  return {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action,
    entity,
    entityId,
    details,
  };
}
