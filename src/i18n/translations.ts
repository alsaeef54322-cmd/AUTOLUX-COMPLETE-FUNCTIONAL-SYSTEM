export interface Translations {
  // Navigation & Shell
  appName: string;
  appSubtitle: string;
  workshopLocation: string;
  searchPlaceholder: string;
  role: string;
  switchRole: string;
  notifications: string;
  markAllRead: string;
  noNotifications: string;
  lightMode: string;
  darkMode: string;
  language: string;
  arabic: string;
  english: string;
  quickReception: string;
  overview: string;
  workshopOps: string;
  customersVehicles: string;
  dealershipShowroom: string;
  inventoryProcurement: string;
  finance: string;
  peopleHR: string;
  administration: string;

  // Tabs
  tabDashboard: string;
  tabReception: string;
  tabServiceOrders: string;
  tabInspections: string;
  tabEstimates: string;
  tabWorkshopBoard: string;
  tabCustomers: string;
  tabVehicles: string;
  tabSales: string;
  tabPurchases: string;
  tabRentals: string;
  tabSpareParts: string;
  tabStockMovements: string;
  tabSuppliers: string;
  tabPurchaseOrders: string;
  tabInvoices: string;
  tabPayments: string;
  tabCashManagement: string;
  tabExpenses: string;
  tabFinancialReports: string;
  tabEmployees: string;
  tabAttendance: string;
  tabPayroll: string;
  tabUsersPermissions: string;
  tabAuditLog: string;
  tabSettings: string;

  // Common Actions & States
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  create: string;
  view: string;
  filter: string;
  all: string;
  actions: string;
  search: string;
  status: string;
  priority: string;
  date: string;
  total: string;
  subtotal: string;
  discount: string;
  tax: string;
  print: string;
  exportPdf: string;
  loading: string;
  noData: string;
  confirm: string;
  success: string;
  error: string;
  close: string;
  resetDemoData: string;
  demoDataResetNotice: string;
  currencySymbol: string;

  // Reception
  receptionTitle: string;
  receptionSubtitle: string;
  stepCustomer: string;
  stepVehicle: string;
  stepComplaint: string;
  stepConfirmation: string;
  searchCustomerPlaceholder: string;
  searchVehiclePlaceholder: string;
  newCustomer: string;
  newVehicle: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  plateNumber: string;
  vinNumber: string;
  makeModel: string;
  year: string;
  mileageKm: string;
  complaintDescription: string;
  priorityNormal: string;
  priorityUrgent: string;
  priorityCritical: string;
  assignAdvisor: string;
  confirmReception: string;
  receptionSuccess: string;
  orderCreated: string;
  viewServiceOrder: string;
  printReceptionTicket: string;
  startInspection: string;

  // Service Orders & Board
  serviceOrdersTitle: string;
  orderNumber: string;
  vehicle: string;
  customer: string;
  advisor: string;
  technician: string;
  progress: string;
  laborItems: string;
  partsItems: string;
  addLabor: string;
  addPart: string;
  advanceStatus: string;
  transitionStatus: string;
  
  // Statuses
  status_draft: string;
  status_received: string;
  status_awaiting_inspection: string;
  status_awaiting_estimate: string;
  status_awaiting_approval: string;
  status_approved: string;
  status_in_progress: string;
  status_waiting_parts: string;
  status_quality_inspection: string;
  status_ready_for_delivery: string;
  status_completed: string;
  status_cancelled: string;

  // Finance & Inventory
  invoicesTitle: string;
  invoiceNumber: string;
  paidAmount: string;
  balanceDue: string;
  recordPayment: string;
  paymentMethod: string;
  cashMethod: string;
  cardMethod: string;
  bankMethod: string;
  instapayMethod: string;
  expensesTitle: string;
  addExpense: string;
  partsCatalogTitle: string;
  addPartItem: string;
  stockInHand: string;
  minStock: string;
  unitCost: string;
  unitPrice: string;
  locationBin: string;
  suppliersTitle: string;
  purchaseOrdersTitle: string;
  receiveStock: string;

  // HR & Roles
  role_owner: string;
  role_operations_manager: string;
  role_receptionist: string;
  role_workshop_manager: string;
  role_technician: string;
  role_accountant: string;
  role_inventory_officer: string;
  role_hr_officer: string;
}

export const translationsEn: Translations = {
  appName: 'AutoCare Pro',
  appSubtitle: 'Enterprise Workshop ERP',
  workshopLocation: 'New Cairo, Branch 1',
  searchPlaceholder: 'Search customers, plate number, VIN, WO#...',
  role: 'Active Role',
  switchRole: 'Switch Role (RBAC Simulation)',
  notifications: 'Notifications',
  markAllRead: 'Mark all as read',
  noNotifications: 'No unread notifications',
  lightMode: 'Light Mode',
  darkMode: 'Dark Mode',
  language: 'Language',
  arabic: 'العربية (RTL)',
  english: 'English (LTR)',
  quickReception: 'Quick Reception',
  overview: 'Overview',
  workshopOps: 'Workshop Operations',
  customersVehicles: 'Customers & Fleet',
  dealershipShowroom: 'Dealership & Showroom',
  inventoryProcurement: 'Inventory & Purchasing',
  finance: 'Financial Management',
  peopleHR: 'Staff & Human Resources',
  administration: 'Administration & System',

  tabDashboard: 'Dashboard',
  tabReception: 'Quick Reception',
  tabServiceOrders: 'Service Orders',
  tabInspections: 'Inspections & Diagnostics',
  tabEstimates: 'Estimates & Approvals',
  tabWorkshopBoard: 'Workshop Kanban',
  tabCustomers: 'Customer Directory',
  tabVehicles: 'Registered Vehicles',
  tabSales: 'Vehicle Sales',
  tabPurchases: 'Dealership Acquisitions',
  tabRentals: 'Car Rentals',
  tabSpareParts: 'Spare Parts Catalog',
  tabStockMovements: 'Stock Movements',
  tabSuppliers: 'Parts Suppliers',
  tabPurchaseOrders: 'Purchase Orders',
  tabInvoices: 'Billing & Invoices',
  tabPayments: 'Payment Receipts',
  tabCashManagement: 'Cash Registers',
  tabExpenses: 'Operational Expenses',
  tabFinancialReports: 'Financial Reports',
  tabEmployees: 'Employee Roster',
  tabAttendance: 'Attendance Log',
  tabPayroll: 'Payroll & Salaries',
  tabUsersPermissions: 'Users & Permissions',
  tabAuditLog: 'System Audit Log',
  tabSettings: 'Workshop Settings',

  save: 'Save Changes',
  cancel: 'Cancel',
  edit: 'Edit',
  delete: 'Delete',
  create: 'Create',
  view: 'View Details',
  filter: 'Filter',
  all: 'All',
  actions: 'Actions',
  search: 'Search',
  status: 'Status',
  priority: 'Priority',
  date: 'Date',
  total: 'Total',
  subtotal: 'Subtotal',
  discount: 'Discount',
  tax: 'VAT (14%)',
  print: 'Print Document',
  exportPdf: 'Export Statement',
  loading: 'Loading data...',
  noData: 'No records found matching current criteria.',
  confirm: 'Confirm Action',
  success: 'Operation completed successfully.',
  error: 'An error occurred. Please verify inputs.',
  close: 'Close',
  resetDemoData: 'Reset Demo Data',
  demoDataResetNotice: 'Database has been restored to factory demo state with complete linked records.',
  currencySymbol: 'EGP',

  receptionTitle: 'Fast Vehicle Check-in & Work Order Creation',
  receptionSubtitle: 'Single-screen intake: Link customer, vehicle, mileage & complaints into an active service order instantly.',
  stepCustomer: 'Customer Identification',
  stepVehicle: 'Vehicle Registration',
  stepComplaint: 'Complaint & Intake Details',
  stepConfirmation: 'Dispatch & Order Confirmation',
  searchCustomerPlaceholder: 'Search by phone number, name or code...',
  searchVehiclePlaceholder: 'Search by plate number (e.g. 5421) or VIN...',
  newCustomer: '+ New Customer',
  newVehicle: '+ New Vehicle',
  customerName: 'Customer Name',
  customerPhone: 'Mobile Phone',
  customerEmail: 'Email Address',
  customerAddress: 'City / District (Cairo/Giza)',
  plateNumber: 'Plate Number',
  vinNumber: 'VIN (Chassis Number)',
  makeModel: 'Make & Model',
  year: 'Year',
  mileageKm: 'Odometer Reading (KM)',
  complaintDescription: 'Customer Reported Issues & Requested Services',
  priorityNormal: 'Standard Priority',
  priorityUrgent: 'Urgent (Express Lane)',
  priorityCritical: 'Critical / Breakdown',
  assignAdvisor: 'Assigned Service Advisor',
  confirmReception: 'Confirm Reception & Issue Work Order',
  receptionSuccess: 'Vehicle successfully received into workshop!',
  orderCreated: 'Work order generated and assigned to reception bay.',
  viewServiceOrder: 'Open Service Order',
  printReceptionTicket: 'Print Intake Gate Pass',
  startInspection: 'Start 24-Point Inspection',

  serviceOrdersTitle: 'Work Orders & Job Cards',
  orderNumber: 'Work Order #',
  vehicle: 'Vehicle',
  customer: 'Customer',
  advisor: 'Service Advisor',
  technician: 'Lead Mechanic',
  progress: 'Stage',
  laborItems: 'Labor & Operations',
  partsItems: 'Parts & Consumables',
  addLabor: '+ Add Labor Line',
  addPart: '+ Issue Spare Part',
  advanceStatus: 'Move to Next Stage',
  transitionStatus: 'Change Work Order Status',

  status_draft: 'Draft',
  status_received: 'Received',
  status_awaiting_inspection: 'Awaiting Inspection',
  status_awaiting_estimate: 'Awaiting Estimate',
  status_awaiting_approval: 'Customer Approval Pending',
  status_approved: 'Approved by Client',
  status_in_progress: 'In Progress (Bay Active)',
  status_waiting_parts: 'Waiting for Parts',
  status_quality_inspection: 'Quality Inspection (QC)',
  status_ready_for_delivery: 'Ready for Handover',
  status_completed: 'Completed & Delivered',
  status_cancelled: 'Cancelled',

  invoicesTitle: 'Tax Invoices & Billing',
  invoiceNumber: 'Invoice #',
  paidAmount: 'Collected Amount',
  balanceDue: 'Remaining Due',
  recordPayment: 'Record Payment',
  paymentMethod: 'Payment Channel',
  cashMethod: 'Cash Safe',
  cardMethod: 'POS Card Terminal',
  bankMethod: 'Bank Wire Transfer',
  instapayMethod: 'InstaPay / E-Wallet',
  expensesTitle: 'Workshop Operating Expenses',
  addExpense: '+ Record Expense',
  partsCatalogTitle: 'Parts & Consumables Catalog',
  addPartItem: '+ Add New Part',
  stockInHand: 'Stock Level',
  minStock: 'Minimum Reorder Alert',
  unitCost: 'Cost (EGP)',
  unitPrice: 'Retail Price (EGP)',
  locationBin: 'Storage Bin',
  suppliersTitle: 'Spare Parts Vendors',
  purchaseOrdersTitle: 'Purchase Invoices & Orders',
  receiveStock: 'Receive Delivery into Stock',

  role_owner: 'Owner / General Director',
  role_operations_manager: 'Operations Manager',
  role_receptionist: 'Service Receptionist',
  role_workshop_manager: 'Workshop Chief Engineer',
  role_technician: 'Master Technician',
  role_accountant: 'Senior Accountant',
  role_inventory_officer: 'Storekeeper / Inventory',
  role_hr_officer: 'HR & Personnel Officer',
};

export const translationsAr: Translations = {
  appName: 'مركز صيانة التجمع الخامس',
  appSubtitle: 'المركز المتكامل لصيانة وخدمة السيارات والأجهزة - التجمع الخامس',
  workshopLocation: 'التجمع الخامس - القاهرة الجديدة',
  searchPlaceholder: 'بحث برقم الطلب، اسم العميل، رقم الهاتف أو اللوحة...',
  role: 'الدور والصلاحية',
  switchRole: 'تبديل الدور (صلاحيات النظام)',
  notifications: 'الإشعارات',
  markAllRead: 'تحديد الكل كمقروء',
  noNotifications: 'لا توجد إشعارات غير مقروءة',
  lightMode: 'الوضع النهاري',
  darkMode: 'الوضع الليلي',
  language: 'اللغة',
  arabic: 'العربية (RTL)',
  english: 'English (LTR)',
  quickReception: 'الاستقبال السريع',
  overview: 'نظرة عامة',
  workshopOps: 'عمليات الورشة',
  customersVehicles: 'العملاء والسيارات',
  dealershipShowroom: 'معرض السيارات والمبيعات',
  inventoryProcurement: 'المخازن والمشتريات',
  finance: 'الإدارة المالية',
  peopleHR: 'فريق العمل والموارد البشرية',
  administration: 'النظام والإعدادات',

  tabDashboard: 'لوحة التحكم والمؤشرات',
  tabReception: 'الاستقبال وفتح كارت الشغل',
  tabServiceOrders: 'أوامر الصيانة (Job Cards)',
  tabInspections: 'الفحص والتشخيص الفني',
  tabEstimates: 'عروض الأسعار والموافقات',
  tabWorkshopBoard: 'لوحة الورديات والمسارات',
  tabCustomers: 'دليل العملاء',
  tabVehicles: 'سجل السيارات المسجلة',
  tabSales: 'مبيعات السيارات',
  tabPurchases: 'مشتريات المعرض',
  tabRentals: 'تأجير السيارات',
  tabSpareParts: 'كتالوج قطع الغيار',
  tabStockMovements: 'حركة المخزن والأرصدة',
  tabSuppliers: 'الموردون وشركات القطع',
  tabPurchaseOrders: 'أوامر التوريد والشراء',
  tabInvoices: 'الفواتير الضريبية',
  tabPayments: 'سندات التحصيل والقبض',
  tabCashManagement: 'الخزينة والحسابات النقدية',
  tabExpenses: 'المصروفات التشغيلية',
  tabFinancialReports: 'التقارير والقوائم المالية',
  tabEmployees: 'فريق العمل والفنيين',
  tabAttendance: 'سجل الحضور والانصراف',
  tabPayroll: 'مسيرات الرواتب الشهرية',
  tabUsersPermissions: 'المستخدمون والصلاحيات',
  tabAuditLog: 'سجل العمليات والرقابة',
  tabSettings: 'إعدادات المركز',

  save: 'حفظ التعديلات',
  cancel: 'إلغاء',
  edit: 'تعديل',
  delete: 'حذف',
  create: 'إنشاء جديد',
  view: 'عرض التفاصيل',
  filter: 'تصفية',
  all: 'الكل',
  actions: 'الإجراءات',
  search: 'بحث',
  status: 'الحالة',
  priority: 'الأولوية',
  date: 'التاريخ',
  total: 'الإجمالي',
  subtotal: 'المجموع الفرعي',
  discount: 'الخصم',
  tax: 'ضريبة القيمة المضافة (14%)',
  print: 'طباعة المستند',
  exportPdf: 'تصدير كشف الحساب',
  loading: 'جاري تحميل البيانات...',
  noData: 'لا توجد سجلات مطابقة للشروط الحالية.',
  confirm: 'تأكيد العملية',
  success: 'تم تنفيذ العملية بنجاح.',
  error: 'حدث خطأ، يرجى مراجعة المدخلات.',
  close: 'إغلاق',
  resetDemoData: 'إعادة ضبط البيانات التجريبية',
  demoDataResetNotice: 'تمت استعادة قاعدة البيانات إلى الحالة التجريبية القياسية بنجاح.',
  currencySymbol: 'ج.م',

  receptionTitle: 'استقبال فوري وإصدار أمر الصيانة',
  receptionSubtitle: 'تسجيل متكامل في شاشة واحدة: ربط العميل، السيارة، قراءة العداد، والشكوى مباشرة لإنشاء أمر الشغل.',
  stepCustomer: 'بيانات العميل',
  stepVehicle: 'بيانات المركبة',
  stepComplaint: 'الشكوى والفحص المبدئي',
  stepConfirmation: 'التوجيه والإصدار',
  searchCustomerPlaceholder: 'بحث برقم الهاتف، الاسم أو الكود...',
  searchVehiclePlaceholder: 'بحث برقم اللوحة (مثال: س ر ق ٥٤٢١) أو الشاسيه...',
  newCustomer: '+ عميل جديد',
  newVehicle: '+ مركبة جديدة',
  customerName: 'اسم العميل',
  customerPhone: 'رقم الموبايل',
  customerEmail: 'البريد الإلكتروني',
  customerAddress: 'المنطقة / المدينة (التجمع، المعادي...)',
  plateNumber: 'رقم اللوحة المعدنية',
  vinNumber: 'رقم الشاسيه (VIN)',
  makeModel: 'الماركة والموديل',
  year: 'سنة الصنع',
  mileageKm: 'قراءة العداد الحالية (كم)',
  complaintDescription: 'شكوى العميل والخدمات المطلوبة',
  priorityNormal: 'أولوية عادية',
  priorityUrgent: 'عاجل (مسار سريع)',
  priorityCritical: 'حرج / طارئ',
  assignAdvisor: 'مهندس الاستقبال المسؤول',
  confirmReception: 'تأكيد الاستقبال وفتح أمر الصيانة',
  receptionSuccess: 'تم استلام المركبة بنجاح وفتح كارت الشغل!',
  orderCreated: 'تم إصدار أمر الشغل وتوجيه المركبة لمنطقة الفحص المبدئي.',
  viewServiceOrder: 'فتح كارت الشغل',
  printReceptionTicket: 'طباعة إذن الدخول والتسليم',
  startInspection: 'بدء الفحص الفني الشامل',

  serviceOrdersTitle: 'أوامر الشغل وبطاقات الصيانة',
  orderNumber: 'رقم أمر الشغل',
  vehicle: 'المركبة',
  customer: 'العميل',
  advisor: 'مهندس الاستقبال',
  technician: 'الفني المسؤول',
  progress: 'المرحلة الحالية',
  laborItems: 'المصنعيات وبنود العمل',
  partsItems: 'قطع الغيار والمستهلكات',
  addLabor: '+ إضافة بند مصنعية',
  addPart: '+ صرف قطعة غيار',
  advanceStatus: 'نقل للمرحلة التالية',
  transitionStatus: 'تغيير حالة أمر الشغل',

  status_draft: 'مسودة',
  status_received: 'تم الاستلام',
  status_awaiting_inspection: 'في انتظار الفحص الفني',
  status_awaiting_estimate: 'في انتظار تقدير التكلفة',
  status_awaiting_approval: 'بانتظار موافقة العميل',
  status_approved: 'تمت موافقة العميل',
  status_in_progress: 'قيد التنفيذ في الورشة',
  status_waiting_parts: 'في انتظار وصول القطع',
  status_quality_inspection: 'مراقبة الجودة والتجربة',
  status_ready_for_delivery: 'جاهزة للتسليم للعميل',
  status_completed: 'مكتملة ومسلمة',
  status_cancelled: 'ملغاة',

  invoicesTitle: 'الفواتير الضريبية والتحصيل',
  invoiceNumber: 'رقم الفاتورة',
  paidAmount: 'المبلغ المحصل',
  balanceDue: 'المتبقي للتحصيل',
  recordPayment: 'تسجيل سند قبض',
  paymentMethod: 'طريقة الدفع',
  cashMethod: 'الخزينة النقدية (كاش)',
  cardMethod: 'بطاقة بنكية / فيزا POS',
  bankMethod: 'تحويل بنكي مباشر',
  instapayMethod: 'انستاباي / محفظة إلكترونية',
  expensesTitle: 'المصروفات التشغيلية للمركز',
  addExpense: '+ تسجيل مصروف جديد',
  partsCatalogTitle: 'كتالوج قطع الغيار والمستهلكات',
  addPartItem: '+ إضافة صنف جديد',
  stockInHand: 'الرصيد المتاح',
  minStock: 'حد إعادة الطلب',
  unitCost: 'سعر التكلفة (ج.م)',
  unitPrice: 'سعر البيع (ج.م)',
  locationBin: 'موقع الرف / الستاند',
  suppliersTitle: 'موردو قطع الغيار',
  purchaseOrdersTitle: 'فواتير الشراء والتوريد',
  receiveStock: 'استلام وتوريد للمخزن',

  role_owner: 'المالك / المدير العام',
  role_operations_manager: 'مدير العمليات والتشغيل',
  role_receptionist: 'موظف الاستقبال وخدمة العملاء',
  role_workshop_manager: 'مدير الورشة وكبير المهندسين',
  role_technician: 'فني صيانة ميكانيكا',
  role_accountant: 'المحاسب المالي',
  role_inventory_officer: 'أمين المخزن وقطع الغيار',
  role_hr_officer: 'مسؤول الموارد البشرية وشؤون العاملين',
};
