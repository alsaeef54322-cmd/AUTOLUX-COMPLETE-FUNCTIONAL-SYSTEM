import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Error handling & Middleware imports
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  BadRequestError,
} from './server/errors/AppError.ts';
import {
  errorHandler,
  notFoundHandler,
  asyncHandler,
} from './server/middleware/errorHandler.ts';
import {
  requireAuth,
  requireRole,
  AuthenticatedRequest,
} from './server/middleware/authMiddleware.ts';
import {
  validateRequiredFields,
  validateBody,
} from './server/middleware/validate.ts';

// Seed data fallback
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
} from './src/data/seedData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'autocare_db.json');

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}



// Database state management
function getCleanSeedData() {
  return {
    currentUser: initialUsers[0],
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

function loadDb(): any {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && parsed.customers && parsed.customers.length > 0) {
        // Ensure sales, purchases, rentals exist if missing
        if (!parsed.sales) parsed.sales = initialSales;
        if (!parsed.purchases) parsed.purchases = initialPurchases;
        if (!parsed.rentals) parsed.rentals = initialRentals;
        return parsed;
      }
    } catch (e) {
      console.error('Error reading DB file:', e);
    }
  }
  const seed = getCleanSeedData();
  saveDb(seed);
  return seed;
}

function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving DB file:', e);
  }
}

// Initialize database file on startup
let db = loadDb();

// Helper to filter, sort, and paginate arrays
function paginateAndFilter<T>(
  items: T[],
  req: Request,
  searchFields: (keyof T)[] = [],
  sortFieldDefault: keyof T = 'id' as keyof T
) {
  let result = [...items];

  // Search filter
  const q = ((req.query.search || req.query.q || '') as string).trim().toLowerCase();
  if (q && searchFields.length > 0) {
    result = result.filter((item) =>
      searchFields.some((field) => {
        const val = item[field];
        return val && String(val).toLowerCase().includes(q);
      })
    );
  }

  // Exact match filters from query params
  for (const [key, value] of Object.entries(req.query)) {
    if (['search', 'q', 'page', 'limit', 'sort', 'order'].includes(key)) continue;
    if (value && typeof value === 'string') {
      result = result.filter((item: any) => String(item[key]) === value);
    }
  }

  // Sort
  const sort = (req.query.sort as keyof T) || sortFieldDefault;
  const order = req.query.order === 'desc' ? -1 : 1;
  result.sort((a: any, b: any) => {
    if (a[sort] === b[sort]) return 0;
    return a[sort] > b[sort] ? order : -order;
  });

  // Pagination
  const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt((req.query.limit as string) || '50', 10)));
  const total = result.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginated = result.slice(startIndex, startIndex + limit);

  return {
    data: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// ==========================================
// API ROUTES
// ==========================================

// 1. System & Health
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'operational',
    service: 'AutoCare Pro / AutoLux ERP API',
    location: 'New Cairo, Egypt',
    version: '2.5.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// 2. Database Sync & Backup
app.get('/api/db', (req: Request, res: Response) => {
  db = loadDb();
  res.json({ success: true, data: db });
});

app.post('/api/sync', (req: Request, res: Response) => {
  const clientState = req.body;
  if (!clientState || typeof clientState !== 'object' || !Array.isArray(clientState.customers)) {
    throw new ValidationError('Invalid sync payload: state must contain valid customers array');
  }
  db = clientState;
  saveDb(db);
  res.json({
    success: true,
    message: 'All records synced to server disk storage successfully',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/reset', (req: Request, res: Response) => {
  db = getCleanSeedData();
  saveDb(db);
  res.json({
    success: true,
    message: 'Database restored to clean initial seed data',
    data: db,
  });
});


// ==========================================
// 3. Customers CRUD
// ==========================================
app.get('/api/customers', (req: Request, res: Response) => {
  db = loadDb();
  const result = paginateAndFilter(
    db.customers || [],
    req,
    ['name', 'phone', 'email', 'customerNumber', 'address'],
    'name'
  );
  res.json({ success: true, ...result });
});

app.get('/api/customers/:id', (req: Request, res: Response) => {
  db = loadDb();
  const customer = (db.customers || []).find((c: any) => c.id === req.params.id);
  if (!customer) throw new NotFoundError(`Customer with ID ${req.params.id}`);
  res.json({ success: true, data: customer });
});

app.post(
  '/api/customers',
  validateBody([
    { field: 'name', required: true, type: 'string', min: 2 },
    { field: 'phone', required: true, type: 'string', min: 6 },
    { field: 'customerType', required: true, enum: ['individual', 'corporate'] },
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const { name, phone, email, address, taxNumber, customerType, notes } = req.body;

    // Check duplicate phone
    const existing = (db.customers || []).find((c: any) => c.phone.trim() === phone.trim());
    if (existing) {
      throw new ConflictError(`Customer with phone number "${phone}" already exists (${existing.name})`);
    }

    const nextNum = (db.customers?.length || 0) + 1;
    const newCustomer = {
      id: `c-${Date.now()}`,
      customerNumber: `CUST-2026-${String(nextNum).padStart(4, '0')}`,
      name: name.trim(),
      phone: phone.trim(),
      email: (email || '').trim(),
      address: (address || 'New Cairo, Cairo, Egypt').trim(),
      taxNumber: taxNumber || '',
      customerType,
      notes: notes || '',
      balance: 0,
      createdAt: new Date().toISOString().substring(0, 10),
      vehicleCount: 0,
    };

    db.customers = [newCustomer, ...(db.customers || [])];
    saveDb(db);
    res.status(201).json({ success: true, data: newCustomer, message: 'Customer registered successfully' });
  })
);

app.put(
  '/api/customers/:id',
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const idx = (db.customers || []).findIndex((c: any) => c.id === req.params.id);
    if (idx === -1) throw new NotFoundError(`Customer with ID ${req.params.id}`);

    const updated = { ...db.customers[idx], ...req.body, id: req.params.id };
    db.customers[idx] = updated;
    saveDb(db);
    res.json({ success: true, data: updated, message: 'Customer updated successfully' });
  })
);

app.delete(
  '/api/customers/:id',
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const idx = (db.customers || []).findIndex((c: any) => c.id === req.params.id);
    if (idx === -1) throw new NotFoundError(`Customer with ID ${req.params.id}`);

    // Check relationship dependencies: are there active work orders or vehicles?
    const hasVehicles = (db.vehicles || []).some((v: any) => v.customerId === req.params.id);
    if (hasVehicles) {
      throw new ConflictError(
        'Cannot delete customer with registered vehicles. Please reassign or delete vehicles first.'
      );
    }

    const removed = db.customers.splice(idx, 1)[0];
    saveDb(db);
    res.json({ success: true, data: removed, message: 'Customer removed successfully' });
  })
);

// ==========================================
// 4. Vehicles CRUD
// ==========================================
app.get('/api/vehicles', (req: Request, res: Response) => {
  db = loadDb();
  const result = paginateAndFilter(
    db.vehicles || [],
    req,
    ['plateNumber', 'vin', 'make', 'model', 'color'],
    'make'
  );
  res.json({ success: true, ...result });
});

app.get('/api/vehicles/:id', (req: Request, res: Response) => {
  db = loadDb();
  const vehicle = (db.vehicles || []).find((v: any) => v.id === req.params.id);
  if (!vehicle) throw new NotFoundError(`Vehicle with ID ${req.params.id}`);
  res.json({ success: true, data: vehicle });
});

app.post(
  '/api/vehicles',
  validateBody([
    { field: 'plateNumber', required: true, type: 'string', min: 2 },
    { field: 'make', required: true, type: 'string' },
    { field: 'model', required: true, type: 'string' },
    { field: 'vin', required: true, type: 'string', min: 5 },
    { field: 'year', required: true, type: 'number', min: 1980, max: 2030 },
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const { plateNumber, vin } = req.body;

    const dupVin = (db.vehicles || []).find((v: any) => v.vin.toLowerCase() === vin.toLowerCase());
    if (dupVin) {
      throw new ConflictError(`Vehicle with VIN "${vin}" already registered (${dupVin.make} ${dupVin.model})`);
    }

    const newVehicle = {
      id: `v-${Date.now()}`,
      status: 'in_workshop',
      currentMileage: 0,
      fuelType: 'petrol',
      saleStatus: 'available',
      rentalStatus: 'available',
      category: 'sedan',
      ...req.body,
    };

    db.vehicles = [newVehicle, ...(db.vehicles || [])];
    // Increment customer vehicle count
    if (newVehicle.customerId) {
      const cust = (db.customers || []).find((c: any) => c.id === newVehicle.customerId);
      if (cust) cust.vehicleCount = (cust.vehicleCount || 0) + 1;
    }
    saveDb(db);
    res.status(201).json({ success: true, data: newVehicle, message: 'Vehicle registered successfully' });
  })
);

app.put(
  '/api/vehicles/:id',
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const idx = (db.vehicles || []).findIndex((v: any) => v.id === req.params.id);
    if (idx === -1) throw new NotFoundError(`Vehicle with ID ${req.params.id}`);

    const updated = { ...db.vehicles[idx], ...req.body, id: req.params.id };
    db.vehicles[idx] = updated;
    saveDb(db);
    res.json({ success: true, data: updated, message: 'Vehicle updated successfully' });
  })
);

app.delete(
  '/api/vehicles/:id',
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const idx = (db.vehicles || []).findIndex((v: any) => v.id === req.params.id);
    if (idx === -1) throw new NotFoundError(`Vehicle with ID ${req.params.id}`);

    const vehicle = db.vehicles[idx];
    const hasActiveOrders = (db.serviceOrders || []).some(
      (o: any) => o.vehicleId === req.params.id && !['completed', 'cancelled'].includes(o.status)
    );
    if (hasActiveOrders) {
      throw new ConflictError('Cannot delete vehicle while an active work order is open');
    }

    const removed = db.vehicles.splice(idx, 1)[0];
    // Decrement customer vehicle count
    if (vehicle.customerId) {
      const cust = (db.customers || []).find((c: any) => c.id === vehicle.customerId);
      if (cust && cust.vehicleCount) cust.vehicleCount = Math.max(0, cust.vehicleCount - 1);
    }
    saveDb(db);
    res.json({ success: true, data: removed, message: 'Vehicle deleted successfully' });
  })
);

// ==========================================
// 5. Service Orders CRUD
// ==========================================
app.get('/api/service-orders', (req: Request, res: Response) => {
  db = loadDb();
  const result = paginateAndFilter(
    db.serviceOrders || [],
    req,
    ['orderNumber', 'title', 'notes', 'status', 'assignedTechName', 'advisorName'],
    'orderNumber'
  );
  res.json({ success: true, ...result });
});

app.get('/api/service-orders/:id', (req: Request, res: Response) => {
  db = loadDb();
  const order = (db.serviceOrders || []).find((o: any) => o.id === req.params.id);
  if (!order) throw new NotFoundError(`Service order with ID ${req.params.id}`);
  res.json({ success: true, data: order });
});

app.post(
  '/api/service-orders',
  validateBody([
    { field: 'customerId', required: true, type: 'string' },
    { field: 'vehicleId', required: true, type: 'string' },
    { field: 'title', required: true, type: 'string' },
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const nextNum = (db.serviceOrders?.length || 0) + 1;
    const newOrder = {
      id: `wo-${Date.now()}`,
      orderNumber: `WO-2026-${String(nextNum).padStart(4, '0')}`,
      status: 'received',
      priority: 'normal',
      laborItems: [],
      partsItems: [],
      laborTotal: 0,
      partsTotal: 0,
      taxAmount: 0,
      totalAmount: 0,
      createdAt: new Date().toISOString(),
      ...req.body,
    };

    db.serviceOrders = [newOrder, ...(db.serviceOrders || [])];
    saveDb(db);
    res.status(201).json({ success: true, data: newOrder, message: 'Work order created successfully' });
  })
);

app.patch(
  '/api/service-orders/:id/status',
  validateBody([{ field: 'status', required: true, type: 'string' }]),
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const order = (db.serviceOrders || []).find((o: any) => o.id === req.params.id);
    if (!order) throw new NotFoundError(`Service order with ID ${req.params.id}`);

    order.status = req.body.status;
    order.updatedAt = new Date().toISOString();
    saveDb(db);
    res.json({ success: true, data: order, message: `Status updated to ${req.body.status}` });
  })
);

app.put(
  '/api/service-orders/:id',
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const idx = (db.serviceOrders || []).findIndex((o: any) => o.id === req.params.id);
    if (idx === -1) throw new NotFoundError(`Service order with ID ${req.params.id}`);

    const updated = { ...db.serviceOrders[idx], ...req.body, id: req.params.id };
    db.serviceOrders[idx] = updated;
    saveDb(db);
    res.json({ success: true, data: updated, message: 'Work order updated successfully' });
  })
);

app.delete(
  '/api/service-orders/:id',
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const idx = (db.serviceOrders || []).findIndex((o: any) => o.id === req.params.id);
    if (idx === -1) throw new NotFoundError(`Service order with ID ${req.params.id}`);

    const removed = db.serviceOrders.splice(idx, 1)[0];
    saveDb(db);
    res.json({ success: true, data: removed, message: 'Work order deleted successfully' });
  })
);

// ==========================================
// 6. Dealership Modules: Sales, Purchases, Rentals
// ==========================================

// --- Sales ---
app.get('/api/sales', (req: Request, res: Response) => {
  db = loadDb();
  const result = paginateAndFilter(
    db.sales || [],
    req,
    ['saleNumber', 'customerName', 'vehicleInfo', 'salesRep', 'paymentStatus'],
    'saleDate'
  );
  res.json({ success: true, ...result });
});

app.get('/api/sales/:id', (req: Request, res: Response) => {
  db = loadDb();
  const sale = (db.sales || []).find((s: any) => s.id === req.params.id);
  if (!sale) throw new NotFoundError(`Sale record with ID ${req.params.id}`);
  res.json({ success: true, data: sale });
});

app.post(
  '/api/sales',
  validateBody([
    { field: 'vehicleId', required: true, type: 'string' },
    { field: 'customerId', required: true, type: 'string' },
    { field: 'salePrice', required: true, type: 'number', min: 1 },
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const { vehicleId, customerId, salePrice, discount = 0, downPayment = 0, paymentMethod, salesRep, notes } = req.body;

    const vehicle = (db.vehicles || []).find((v: any) => v.id === vehicleId);
    if (!vehicle) throw new NotFoundError(`Vehicle with ID ${vehicleId}`);

    const customer = (db.customers || []).find((c: any) => c.id === customerId);
    if (!customer) throw new NotFoundError(`Customer with ID ${customerId}`);

    const nextNum = (db.sales?.length || 0) + 1;
    const netPrice = Math.max(0, salePrice - discount);
    const remainingBalance = Math.max(0, netPrice - downPayment);
    const paymentStatus = remainingBalance === 0 ? 'paid' : downPayment > 0 ? 'partial' : 'pending';

    const newSale = {
      id: `sale-${Date.now()}`,
      saleNumber: `SAL-2026-${String(nextNum).padStart(4, '0')}`,
      vehicleId,
      vehicleInfo: `${vehicle.make} ${vehicle.model} (${vehicle.year}) - ${vehicle.plateNumber}`,
      customerId,
      customerName: customer.name,
      saleDate: new Date().toISOString().substring(0, 10),
      salePrice,
      discount,
      netPrice,
      downPayment,
      remainingBalance,
      paymentStatus,
      paymentMethod: paymentMethod || 'Bank Wire',
      salesRep: salesRep || 'Sales Manager',
      notes: notes || '',
    };

    // Mark vehicle as sold
    vehicle.saleStatus = 'sold';

    db.sales = [newSale, ...(db.sales || [])];
    saveDb(db);
    res.status(201).json({ success: true, data: newSale, message: 'Vehicle sale contract created successfully' });
  })
);

app.put(
  '/api/sales/:id',
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const idx = (db.sales || []).findIndex((s: any) => s.id === req.params.id);
    if (idx === -1) throw new NotFoundError(`Sale with ID ${req.params.id}`);

    const updated = { ...db.sales[idx], ...req.body, id: req.params.id };
    db.sales[idx] = updated;
    saveDb(db);
    res.json({ success: true, data: updated, message: 'Sale updated successfully' });
  })
);

app.delete(
  '/api/sales/:id',
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const idx = (db.sales || []).findIndex((s: any) => s.id === req.params.id);
    if (idx === -1) throw new NotFoundError(`Sale with ID ${req.params.id}`);

    const removed = db.sales.splice(idx, 1)[0];
    // Revert vehicle status if applicable
    if (removed.vehicleId) {
      const v = (db.vehicles || []).find((veh: any) => veh.id === removed.vehicleId);
      if (v) v.saleStatus = 'available';
    }
    saveDb(db);
    res.json({ success: true, data: removed, message: 'Sale cancelled and removed successfully' });
  })
);

// --- Vehicle Purchases ---
app.get('/api/purchases', (req: Request, res: Response) => {
  db = loadDb();
  const result = paginateAndFilter(
    db.purchases || [],
    req,
    ['purchaseNumber', 'sellerName', 'make', 'model', 'vin', 'plateNumber'],
    'purchaseDate'
  );
  res.json({ success: true, ...result });
});

app.post(
  '/api/purchases',
  validateBody([
    { field: 'sellerName', required: true, type: 'string' },
    { field: 'make', required: true, type: 'string' },
    { field: 'model', required: true, type: 'string' },
    { field: 'vin', required: true, type: 'string' },
    { field: 'purchasePrice', required: true, type: 'number', min: 1 },
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const { sellerName, sellerPhone, make, model, year, vin, plateNumber, purchasePrice, additionalCosts = 0, notes, receivedBy } = req.body;

    const nextNum = (db.purchases?.length || 0) + 1;
    const totalCost = purchasePrice + additionalCosts;

    const newPurchase = {
      id: `pur-${Date.now()}`,
      purchaseNumber: `PUR-2026-${String(nextNum).padStart(4, '0')}`,
      sellerName,
      sellerPhone: sellerPhone || '',
      make,
      model,
      year: year || 2023,
      vin,
      plateNumber: plateNumber || 'Pending Reg',
      purchaseDate: new Date().toISOString().substring(0, 10),
      purchasePrice,
      additionalCosts,
      totalCost,
      paymentStatus: 'paid',
      notes: notes || '',
      receivedBy: receivedBy || 'Operations Manager',
    };

    // Add purchased vehicle to inventory
    const newVehicle = {
      id: `v-deal-${Date.now()}`,
      customerId: 'dealership',
      plateNumber: plateNumber || 'Pending Reg',
      vin,
      make,
      model,
      year: year || 2023,
      color: 'Black Metallic',
      fuelType: 'petrol',
      currentMileage: 0,
      status: 'in_workshop',
      purchaseCost: totalCost,
      listingPrice: Math.round(totalCost * 1.15),
      saleStatus: 'available',
      rentalStatus: 'available',
      category: 'luxury',
    };

    db.purchases = [newPurchase, ...(db.purchases || [])];
    db.vehicles = [newVehicle, ...(db.vehicles || [])];
    saveDb(db);
    res.status(201).json({ success: true, data: newPurchase, message: 'Vehicle purchase recorded successfully' });
  })
);

app.delete(
  '/api/purchases/:id',
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const idx = (db.purchases || []).findIndex((p: any) => p.id === req.params.id);
    if (idx === -1) throw new NotFoundError(`Purchase with ID ${req.params.id}`);

    const removed = db.purchases.splice(idx, 1)[0];
    saveDb(db);
    res.json({ success: true, data: removed, message: 'Purchase record deleted' });
  })
);

// --- Rentals ---
app.get('/api/rentals', (req: Request, res: Response) => {
  db = loadDb();
  const result = paginateAndFilter(
    db.rentals || [],
    req,
    ['bookingNumber', 'customerName', 'vehicleInfo', 'status'],
    'startDate'
  );
  res.json({ success: true, ...result });
});

app.post(
  '/api/rentals',
  validateBody([
    { field: 'vehicleId', required: true, type: 'string' },
    { field: 'customerId', required: true, type: 'string' },
    { field: 'startDate', required: true, type: 'string' },
    { field: 'endDate', required: true, type: 'string' },
    { field: 'dailyRate', required: true, type: 'number', min: 1 },
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const { vehicleId, customerId, startDate, endDate, dailyRate, depositAmount = 0, contractTerms, notes } = req.body;

    const vehicle = (db.vehicles || []).find((v: any) => v.id === vehicleId);
    if (!vehicle) throw new NotFoundError(`Vehicle with ID ${vehicleId}`);

    const customer = (db.customers || []).find((c: any) => c.id === customerId);
    if (!customer) throw new NotFoundError(`Customer with ID ${customerId}`);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalAmount = totalDays * dailyRate;

    const nextNum = (db.rentals?.length || 0) + 1;
    const newRental = {
      id: `rent-${Date.now()}`,
      bookingNumber: `RNT-2026-${String(nextNum).padStart(4, '0')}`,
      vehicleId,
      vehicleInfo: `${vehicle.make} ${vehicle.model} (${vehicle.year}) - ${vehicle.plateNumber}`,
      customerId,
      customerName: customer.name,
      startDate,
      endDate,
      totalDays,
      dailyRate,
      totalAmount,
      depositAmount,
      paidAmount: totalAmount + depositAmount,
      status: 'active',
      pickupMileage: vehicle.currentMileage || 10000,
      contractTerms: contractTerms || 'Standard VIP Luxury Lease Terms',
      notes: notes || '',
    };

    vehicle.rentalStatus = 'rented';

    db.rentals = [newRental, ...(db.rentals || [])];
    saveDb(db);
    res.status(201).json({ success: true, data: newRental, message: 'Rental lease agreement booked successfully' });
  })
);

app.delete(
  '/api/rentals/:id',
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const idx = (db.rentals || []).findIndex((r: any) => r.id === req.params.id);
    if (idx === -1) throw new NotFoundError(`Rental with ID ${req.params.id}`);

    const removed = db.rentals.splice(idx, 1)[0];
    if (removed.vehicleId) {
      const v = (db.vehicles || []).find((veh: any) => veh.id === removed.vehicleId);
      if (v) v.rentalStatus = 'available';
    }
    saveDb(db);
    res.json({ success: true, data: removed, message: 'Rental cancelled successfully' });
  })
);

// ==========================================
// 7. Inventory & Spare Parts
// ==========================================
app.get('/api/inventory', (req: Request, res: Response) => {
  db = loadDb();
  const result = paginateAndFilter(
    db.spareParts || [],
    req,
    ['partNumber', 'name', 'nameAr', 'brand', 'category', 'locationBin'],
    'name'
  );
  res.json({ success: true, ...result });
});

app.post(
  '/api/inventory',
  validateBody([
    { field: 'partNumber', required: true, type: 'string' },
    { field: 'name', required: true, type: 'string' },
    { field: 'costPrice', required: true, type: 'number', min: 0 },
    { field: 'sellingPrice', required: true, type: 'number', min: 0 },
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const { partNumber, name, nameAr, brand, category, costPrice, sellingPrice, currentStock = 0, minStock = 2, locationBin } = req.body;

    const dup = (db.spareParts || []).find((p: any) => p.partNumber.toLowerCase() === partNumber.toLowerCase());
    if (dup) throw new ConflictError(`Part with code "${partNumber}" already exists in catalog`);

    const newPart = {
      id: `part-${Date.now()}`,
      partNumber,
      name,
      nameAr: nameAr || name,
      brand: brand || 'OEM',
      category: category || 'General',
      costPrice,
      sellingPrice,
      currentStock,
      minStock,
      locationBin: locationBin || 'Bay A-1',
      compatibility: [],
    };

    db.spareParts = [newPart, ...(db.spareParts || [])];
    saveDb(db);
    res.status(201).json({ success: true, data: newPart, message: 'Spare part added to inventory' });
  })
);

app.patch(
  '/api/inventory/:id/stock',
  validateBody([{ field: 'delta', required: true, type: 'number' }]),
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const part = (db.spareParts || []).find((p: any) => p.id === req.params.id);
    if (!part) throw new NotFoundError(`Part with ID ${req.params.id}`);

    const newStock = part.currentStock + req.body.delta;
    if (newStock < 0) {
      throw new BadRequestError(`Insufficient stock. Current: ${part.currentStock}, Requested reduction: ${Math.abs(req.body.delta)}`);
    }

    part.currentStock = newStock;
    saveDb(db);
    res.json({ success: true, data: part, message: `Stock updated to ${part.currentStock}` });
  })
);

// ==========================================
// 8. Invoices & Billing
// ==========================================
app.get('/api/invoices', (req: Request, res: Response) => {
  db = loadDb();
  const result = paginateAndFilter(
    db.invoices || [],
    req,
    ['invoiceNumber', 'customerName', 'status', 'vehicleInfo'],
    'issueDate'
  );
  res.json({ success: true, ...result });
});

app.get('/api/invoices/:id', (req: Request, res: Response) => {
  db = loadDb();
  const invoice = (db.invoices || []).find((inv: any) => inv.id === req.params.id);
  if (!invoice) throw new NotFoundError(`Invoice with ID ${req.params.id}`);
  res.json({ success: true, data: invoice });
});

app.post(
  '/api/invoices',
  validateBody([
    { field: 'customerId', required: true, type: 'string' },
    { field: 'totalAmount', required: true, type: 'number', min: 0 },
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const nextNum = (db.invoices?.length || 0) + 1;
    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${String(nextNum).padStart(4, '0')}`,
      status: 'issued',
      paidAmount: 0,
      issueDate: new Date().toISOString().substring(0, 10),
      ...req.body,
    };
    newInvoice.remainingBalance = newInvoice.totalAmount - (newInvoice.paidAmount || 0);

    db.invoices = [newInvoice, ...(db.invoices || [])];
    saveDb(db);
    res.status(201).json({ success: true, data: newInvoice, message: 'Invoice issued successfully' });
  })
);

// ==========================================
// 9. Payments
// ==========================================
app.get('/api/payments', (req: Request, res: Response) => {
  db = loadDb();
  const result = paginateAndFilter(
    db.payments || [],
    req,
    ['paymentNumber', 'customerName', 'paymentMethod'],
    'paymentDate'
  );
  res.json({ success: true, ...result });
});

app.post(
  '/api/payments',
  validateBody([
    { field: 'customerId', required: true, type: 'string' },
    { field: 'amount', required: true, type: 'number', min: 1 },
    { field: 'paymentMethod', required: true, type: 'string' },
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const { invoiceId, customerId, amount, paymentMethod, referenceNumber, notes } = req.body;

    const nextNum = (db.payments?.length || 0) + 1;
    const customer = (db.customers || []).find((c: any) => c.id === customerId);

    const newPayment = {
      id: `pay-${Date.now()}`,
      paymentNumber: `REC-2026-${String(nextNum).padStart(4, '0')}`,
      invoiceId: invoiceId || '',
      customerId,
      customerName: customer ? customer.name : 'Valued Customer',
      amount,
      paymentMethod,
      referenceNumber: referenceNumber || '',
      paymentDate: new Date().toISOString().substring(0, 10),
      notes: notes || '',
      recordedBy: 'Accounting Department',
    };

    // Update invoice if matched
    if (invoiceId) {
      const inv = (db.invoices || []).find((i: any) => i.id === invoiceId);
      if (inv) {
        inv.paidAmount = (inv.paidAmount || 0) + amount;
        inv.remainingBalance = Math.max(0, inv.totalAmount - inv.paidAmount);
        inv.status = inv.remainingBalance === 0 ? 'paid' : 'partial';
      }
    }

    // Update customer outstanding balance
    if (customer) {
      customer.balance = Math.max(0, (customer.balance || 0) - amount);
    }

    db.payments = [newPayment, ...(db.payments || [])];
    saveDb(db);
    res.status(201).json({ success: true, data: newPayment, message: 'Payment recorded and credited successfully' });
  })
);

// ==========================================
// 10. Expenses
// ==========================================
app.get('/api/expenses', (req: Request, res: Response) => {
  db = loadDb();
  const result = paginateAndFilter(
    db.expenses || [],
    req,
    ['expenseNumber', 'title', 'category', 'vendor', 'paymentMethod'],
    'expenseDate'
  );
  res.json({ success: true, ...result });
});

app.post(
  '/api/expenses',
  validateBody([
    { field: 'title', required: true, type: 'string' },
    { field: 'amount', required: true, type: 'number', min: 1 },
    { field: 'category', required: true, type: 'string' },
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const nextNum = (db.expenses?.length || 0) + 1;
    const newExpense = {
      id: `exp-${Date.now()}`,
      expenseNumber: `EXP-2026-${String(nextNum).padStart(4, '0')}`,
      expenseDate: new Date().toISOString().substring(0, 10),
      recordedBy: 'Finance Officer',
      ...req.body,
    };

    db.expenses = [newExpense, ...(db.expenses || [])];
    saveDb(db);
    res.status(201).json({ success: true, data: newExpense, message: 'Expense voucher booked' });
  })
);

// ==========================================
// 11. Employees & HR
// ==========================================
app.get('/api/employees', (req: Request, res: Response) => {
  db = loadDb();
  const result = paginateAndFilter(
    db.employees || [],
    req,
    ['name', 'nameAr', 'employeeNumber', 'position', 'department', 'phone'],
    'name'
  );
  res.json({ success: true, ...result });
});

app.post(
  '/api/employees',
  validateBody([
    { field: 'name', required: true, type: 'string' },
    { field: 'position', required: true, type: 'string' },
    { field: 'department', required: true, type: 'string' },
    { field: 'salary', required: true, type: 'number', min: 0 },
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    db = loadDb();
    const nextNum = (db.employees?.length || 0) + 1;
    const newEmployee = {
      id: `emp-${Date.now()}`,
      employeeNumber: `EMP-${String(nextNum).padStart(3, '0')}`,
      status: 'active',
      joinDate: new Date().toISOString().substring(0, 10),
      ...req.body,
    };

    db.employees = [newEmployee, ...(db.employees || [])];
    saveDb(db);
    res.status(201).json({ success: true, data: newEmployee, message: 'Employee hired and registered' });
  })
);

// ==========================================
// 12. Audit Trail
// ==========================================
app.get('/api/audit-logs', (req: Request, res: Response) => {
  db = loadDb();
  const result = paginateAndFilter(
    db.auditLogs || [],
    req,
    ['action', 'userName', 'entity', 'details'],
    'timestamp'
  );
  res.json({ success: true, ...result });
});

// ==========================================
// CENTRALIZED ERROR HANDLING MIDDLEWARE
// (Must be mounted AFTER all API routes)
// ==========================================

// Catch-all 404 for unmatched API routes
app.all('/api/*', notFoundHandler);

// Centralized error handler catches AppErrors, validation failures, syntax errors & 500s
app.use(errorHandler);

// ==========================================
// STATIC ASSETS & VITE INTEGRATION
// ==========================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`AutoCare Pro ERP / AutoLux API server online at http://0.0.0.0:${PORT}`);
    console.log(`Centralized error handling & validation middleware active on all /api endpoints.`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
});
