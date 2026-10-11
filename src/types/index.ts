export type RoleType = 
  | 'owner' 
  | 'operations_manager' 
  | 'receptionist' 
  | 'workshop_manager' 
  | 'technician' 
  | 'accountant' 
  | 'inventory_officer' 
  | 'hr_officer';

export interface User {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  username: string;
  password?: string;
  role: RoleType;
  avatarUrl?: string;
  phone?: string;
  permissions: string[];
  isActive?: boolean;
  createdAt?: string;
}

export interface Customer {
  id: string;
  customerNumber: string;
  name: string;
  nameAr?: string;
  phone: string;
  email: string;
  address: string;
  taxNumber?: string;
  customerType: 'individual' | 'corporate';
  notes?: string;
  balance: number; // outstanding balance in EGP
  createdAt: string;
  vehicleCount?: number;
}

export interface Vehicle {
  id: string;
  customerId: string;
  plateNumber: string; // Egyptian style e.g. "س ر ق ٥ ٤ ٢ ١" or "SRQ 5421"
  plateNumberArabic?: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  currentMileage: number;
  notes?: string;
  status: 'in_workshop' | 'with_customer' | 'awaiting_pickup';
  lastServiceDate?: string;
  // Dealership & Rental fields
  listingPrice?: number;
  purchaseCost?: number;
  saleStatus?: 'available' | 'sold' | 'reserved';
  rentalStatus?: 'available' | 'rented' | 'maintenance';
  dailyRentalRate?: number;
  category?: 'sedan' | 'suv' | 'sports' | 'luxury';
}

export interface VehicleSale {
  id: string;
  saleNumber: string;
  vehicleId: string;
  vehicleInfo: string;
  customerId: string;
  customerName: string;
  saleDate: string;
  salePrice: number;
  discount: number;
  netPrice: number;
  downPayment: number;
  remainingBalance: number;
  paymentStatus: 'paid' | 'partial' | 'pending';
  invoiceId?: string;
  paymentMethod: string;
  notes?: string;
  salesRep: string;
}

export interface VehiclePurchase {
  id: string;
  purchaseNumber: string;
  sellerName: string;
  sellerPhone: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  plateNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  additionalCosts: number;
  totalCost: number;
  paymentStatus: 'paid' | 'pending';
  notes?: string;
  receivedBy: string;
}

export interface VehicleRental {
  id: string;
  bookingNumber: string;
  vehicleId: string;
  vehicleInfo: string;
  customerId: string;
  customerName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyRate: number;
  totalAmount: number;
  depositAmount: number;
  paidAmount: number;
  status: 'confirmed' | 'active' | 'returned' | 'cancelled';
  pickupMileage: number;
  returnMileage?: number;
  contractTerms?: string;
  notes?: string;
}

export type ServiceOrderStatus = 
  | 'draft'
  | 'received'
  | 'awaiting_inspection'
  | 'awaiting_estimate'
  | 'awaiting_approval'
  | 'approved'
  | 'in_progress'
  | 'waiting_parts'
  | 'quality_inspection'
  | 'ready_for_delivery'
  | 'completed'
  | 'cancelled';

export type Priority = 'normal' | 'urgent' | 'critical';

export interface LaborItem {
  id: string;
  description: string;
  descriptionAr?: string;
  hours: number;
  hourlyRate: number;
  technicianId?: string;
  technicianName?: string;
  total: number;
  status?: 'pending' | 'in_progress' | 'completed';
}

export interface OrderPartItem {
  id: string;
  partId: string;
  partName: string;
  partSku: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  total: number;
  issued: boolean;
}

export interface ServiceOrder {
  id: string;
  orderNumber: string; // e.g. WO-2026-0104
  customerId: string;
  vehicleId: string;
  advisorId: string;
  advisorName: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  status: ServiceOrderStatus;
  priority: Priority;
  mileageIn: number;
  customerComplaint: string;
  diagnosisNotes?: string;
  inspectionSummary?: string;
  preExistingDamage?: string[];
  fuelLevel?: number; // percentage 0 - 100
  laborItems: LaborItem[];
  partsItems: OrderPartItem[];
  estimatedTotal: number;
  approvedTotal: number;
  actualTotal: number;
  createdAt: string;
  estimatedCompletionDate?: string;
  completedAt?: string;
  deliveredAt?: string;
  internalNotes?: string;
  customerNotes?: string;
  invoiceId?: string;
}

export interface InspectionItem {
  id: string;
  system: string;
  component: string;
  condition: 'good' | 'attention' | 'critical';
  notes: string;
  recommendedAction?: string;
  estimatedLaborCost?: number;
  estimatedPartCost?: number;
}

export interface Inspection {
  id: string;
  inspectionNumber: string;
  serviceOrderId: string;
  vehicleId: string;
  inspectorId: string;
  inspectorName: string;
  date: string;
  mileage: number;
  overallScore: number; // 0-100
  items: InspectionItem[];
  summary: string;
  exportedToEstimate: boolean;
}

export interface Estimate {
  id: string;
  estimateNumber: string;
  serviceOrderId: string;
  customerId: string;
  vehicleId: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'revised';
  laborItems: LaborItem[];
  partsItems: OrderPartItem[];
  subtotal: number;
  discount: number;
  taxRate: number; // e.g. 14 for 14% Egypt VAT
  taxAmount: number;
  total: number;
  validUntil: string;
  createdAt: string;
  approvalDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
  convertedToInvoiceId?: string;
}

export interface SparePart {
  id: string;
  sku: string;
  partNumber: string;
  name: string;
  nameAr: string;
  category: 'brakes' | 'filters' | 'suspension' | 'fluids' | 'electrical' | 'engine' | 'transmission' | 'tires';
  supplierId: string;
  supplierName: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
  binLocation: string; // e.g. "Rack B-03"
  compatibleVehicles: string;
  unit: string;
}

export interface StockMovement {
  id: string;
  partId: string;
  partName: string;
  partSku: string;
  type: 'receipt' | 'issue' | 'adjustment' | 'return';
  quantity: number; // positive or negative
  referenceType: 'purchase_order' | 'service_order' | 'manual_adjustment';
  referenceId: string;
  previousStock: number;
  newStock: number;
  unitCost: number;
  notes: string;
  createdAt: string;
  createdBy: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  balance: number; // amount we owe supplier
  paymentTerms: string;
}

export interface PurchaseOrderItem {
  partId: string;
  partName: string;
  partSku: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  orderDate: string;
  expectedDate?: string;
  receivedDate?: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  type: 'labor' | 'part' | 'vehicle_sale' | 'vehicle_rental';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  serviceOrderId?: string;
  customerId: string;
  customerName: string;
  vehiclePlate?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'cancelled';
  paymentMethod?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: 'cash' | 'credit_card' | 'bank_transfer' | 'instapay_vodafone';
  date: string;
  receivedBy: string;
  notes?: string;
  receiptNumber: string;
}

export interface CashAccount {
  id: string;
  name: string;
  nameAr: string;
  accountType: 'cash_drawer' | 'bank_account' | 'petty_cash';
  currentBalance: number;
  currency: string;
}

export interface CashMovement {
  id: string;
  accountId: string;
  accountName: string;
  type: 'inflow' | 'outflow';
  amount: number;
  category: string;
  description: string;
  referenceId?: string;
  balanceAfter: number;
  date: string;
  performedBy: string;
}

export interface Expense {
  id: string;
  expenseNumber: string;
  category: 'rent' | 'utilities' | 'tools_equipment' | 'workshop_consumables' | 'salaries' | 'marketing' | 'maintenance' | 'other';
  amount: number;
  date: string;
  paymentMethod: string;
  accountId: string;
  description: string;
  paidTo: string;
  createdBy: string;
}

export interface Employee {
  id: string;
  employeeNumber: string;
  name: string;
  nameAr: string;
  role: RoleType;
  jobTitle: string;
  jobTitleAr: string;
  department: 'workshop' | 'reception' | 'management' | 'accounting' | 'parts' | 'hr';
  phone: string;
  email: string;
  monthlySalary: number;
  hireDate: string;
  status: 'active' | 'on_leave' | 'terminated';
  avatarUrl?: string;
  currentWorkOrderCount?: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  days: number;
  leaveType: 'annual' | 'sick' | 'unpaid' | 'emergency';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedBy?: string;
}

export interface PayrollRecord {
  id: string;
  payrollMonth: string; // YYYY-MM
  employeeId: string;
  employeeName: string;
  jobTitle: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'draft' | 'approved' | 'paid';
  paidDate?: string;
  paymentMethod?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ipAddress?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  read: boolean;
  timestamp: string;
  linkTab?: string;
  linkId?: string;
}

export interface BusinessSettings {
  workshopName: string;
  workshopNameAr: string;
  branch: string;
  branchAr: string;
  address: string;
  addressAr: string;
  phone: string;
  email: string;
  taxNumber: string;
  commercialReg: string;
  currency: string;
  currencyAr: string;
  taxRate: number; // VAT %
  invoicePrefix: string;
  workOrderPrefix: string;
  timeZone: string;
  theme: 'dark' | 'light';
  language: 'ar' | 'en';
}

export type ActiveTab = 
  | 'dashboard'
  | 'reception'
  | 'service_orders'
  | 'inspections'
  | 'estimates'
  | 'workshop_board'
  | 'customers'
  | 'vehicles'
  | 'sales'
  | 'purchases'
  | 'rentals'
  | 'spare_parts'
  | 'stock_movements'
  | 'suppliers'
  | 'purchase_orders'
  | 'invoices'
  | 'payments'
  | 'cash_management'
  | 'expenses'
  | 'financial_reports'
  | 'employees'
  | 'attendance'
  | 'payroll'
  | 'users_permissions'
  | 'notifications'
  | 'audit_log'
  | 'settings';
