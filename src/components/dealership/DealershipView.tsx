import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { VehicleSale, VehiclePurchase, VehicleRental } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';
import {
  BadgePercent,
  BadgeDollarSign,
  Key,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Download,
  Printer,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Car,
  X,
  User,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const DealershipView: React.FC = () => {
  const {
    state,
    activeTab,
    setActiveTab,
    createSale,
    updateSale,
    deleteSale,
    createPurchase,
    updatePurchase,
    deletePurchase,
    createRental,
    updateRental,
    deleteRental,
    refreshData,
    printDocument,
  } = useApp();

  // Sub-tab selection: sales | purchases | rentals
  const [subTab, setSubTab] = useState<'sales' | 'purchases' | 'rentals'>(
    activeTab === 'purchases' ? 'purchases' : activeTab === 'rentals' ? 'rentals' : 'sales'
  );

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<string>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [activeModal, setActiveModal] = useState<
    'createSale' | 'editSale' | 'createPurchase' | 'editPurchase' | 'createRental' | 'editRental' | 'viewDetail' | null
  >(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [saleForm, setSaleForm] = useState({
    vehicleId: '',
    customerId: '',
    salePrice: 0,
    discount: 0,
    downPayment: 0,
    paymentMethod: 'Bank Wire (CIB)',
    salesRep: state.currentUser.name || 'Sales Representative',
    notes: '',
  });

  const [purchaseForm, setPurchaseForm] = useState({
    sellerName: '',
    sellerPhone: '',
    make: '',
    model: '',
    year: 2023,
    vin: '',
    plateNumber: '',
    purchasePrice: 0,
    additionalCosts: 0,
    notes: '',
    receivedBy: state.currentUser.name || 'Fleet Manager',
  });

  const [rentalForm, setRentalForm] = useState({
    vehicleId: '',
    customerId: '',
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10),
    dailyRate: 6500,
    depositAmount: 25000,
    contractTerms: 'Comprehensive luxury coverage included with 250 KM daily limit.',
    notes: '',
  });

  // Handle Refresh from backend
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Sync subTab with activeTab
  React.useEffect(() => {
    if (activeTab === 'purchases') setSubTab('purchases');
    else if (activeTab === 'rentals') setSubTab('rentals');
    else if (activeTab === 'sales') setSubTab('sales');
    setSelectedIds([]);
    setPage(1);
  }, [activeTab]);

  // Available vehicles and customers
  const availableVehicles = useMemo(
    () => state.vehicles.filter((v) => v.saleStatus !== 'sold'),
    [state.vehicles]
  );

  // -------------------------------------------------------------
  // Filtered & Sorted Datasets
  // -------------------------------------------------------------
  const salesList = useMemo(() => {
    let list = [...(state.sales || [])];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.saleNumber.toLowerCase().includes(q) ||
          s.customerName.toLowerCase().includes(q) ||
          s.vehicleInfo.toLowerCase().includes(q) ||
          s.salesRep.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter((s) => s.paymentStatus === statusFilter);
    }
    list.sort((a, b) => {
      let valA: any = a.saleDate;
      let valB: any = b.saleDate;
      if (sortField === 'price') {
        valA = a.netPrice;
        valB = b.netPrice;
      } else if (sortField === 'balance') {
        valA = a.remainingBalance;
        valB = b.remainingBalance;
      }
      return sortAsc ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
    });
    return list;
  }, [state.sales, search, statusFilter, sortField, sortAsc]);

  const purchasesList = useMemo(() => {
    let list = [...(state.purchases || [])];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.purchaseNumber.toLowerCase().includes(q) ||
          p.sellerName.toLowerCase().includes(q) ||
          p.make.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.vin.toLowerCase().includes(q) ||
          p.plateNumber.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const valA = sortField === 'price' ? a.totalCost : a.purchaseDate;
      const valB = sortField === 'price' ? b.totalCost : b.purchaseDate;
      return sortAsc ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
    });
    return list;
  }, [state.purchases, search, sortField, sortAsc]);

  const rentalsList = useMemo(() => {
    let list = [...(state.rentals || [])];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.bookingNumber.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.vehicleInfo.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter((r) => r.status === statusFilter);
    }
    list.sort((a, b) => {
      const valA = sortField === 'price' ? a.totalAmount : a.startDate;
      const valB = sortField === 'price' ? b.totalAmount : b.startDate;
      return sortAsc ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
    });
    return list;
  }, [state.rentals, search, statusFilter, sortField, sortAsc]);

  // Current active data & pagination
  const currentData = subTab === 'sales' ? salesList : subTab === 'purchases' ? purchasesList : rentalsList;
  const totalPages = Math.max(1, Math.ceil(currentData.length / pageSize));
  const paginatedData = currentData.slice((page - 1) * pageSize, page * pageSize);

  // Bulk Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedData.map((d: any) => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (!selectedIds.length) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected record(s)?`)) {
      selectedIds.forEach((id) => {
        if (subTab === 'sales') deleteSale(id);
        else if (subTab === 'purchases') deletePurchase(id);
        else if (subTab === 'rentals') deleteRental(id);
      });
      setSelectedIds([]);
    }
  };

  // -------------------------------------------------------------
  // Universal Export Handler
  // -------------------------------------------------------------
  const handleExportCSV = () => {
    if (subTab === 'sales') {
      exportToCSV(
        'AutoLux_Vehicle_Sales',
        [
          { header: 'Sale Number', key: 'saleNumber' },
          { header: 'Date', key: 'saleDate' },
          { header: 'Vehicle', key: 'vehicleInfo' },
          { header: 'Customer', key: 'customerName' },
          { header: 'Gross Price (EGP)', key: 'salePrice' },
          { header: 'Discount (EGP)', key: 'discount' },
          { header: 'Net Price (EGP)', key: 'netPrice' },
          { header: 'Down Payment (EGP)', key: 'downPayment' },
          { header: 'Remaining Balance (EGP)', key: 'remainingBalance' },
          { header: 'Status', key: 'paymentStatus' },
          { header: 'Sales Rep', key: 'salesRep' },
          { header: 'Payment Method', key: 'paymentMethod' },
        ],
        salesList
      );
    } else if (subTab === 'purchases') {
      exportToCSV(
        'AutoLux_Vehicle_Purchases',
        [
          { header: 'Purchase Number', key: 'purchaseNumber' },
          { header: 'Date', key: 'purchaseDate' },
          { header: 'Make & Model', key: (p) => `${p.make} ${p.model} (${p.year})` },
          { header: 'VIN', key: 'vin' },
          { header: 'Plate Number', key: 'plateNumber' },
          { header: 'Seller Name', key: 'sellerName' },
          { header: 'Seller Phone', key: 'sellerPhone' },
          { header: 'Base Cost (EGP)', key: 'purchasePrice' },
          { header: 'Additional Costs (EGP)', key: 'additionalCosts' },
          { header: 'Total Cost (EGP)', key: 'totalCost' },
          { header: 'Received By', key: 'receivedBy' },
        ],
        purchasesList
      );
    } else {
      exportToCSV(
        'AutoLux_Vehicle_Rentals',
        [
          { header: 'Booking Number', key: 'bookingNumber' },
          { header: 'Customer', key: 'customerName' },
          { header: 'Vehicle', key: 'vehicleInfo' },
          { header: 'Start Date', key: 'startDate' },
          { header: 'End Date', key: 'endDate' },
          { header: 'Total Days', key: 'totalDays' },
          { header: 'Daily Rate (EGP)', key: 'dailyRate' },
          { header: 'Total Lease (EGP)', key: 'totalAmount' },
          { header: 'Security Deposit (EGP)', key: 'depositAmount' },
          { header: 'Status', key: 'status' },
          { header: 'Pickup Mileage', key: 'pickupMileage' },
        ],
        rentalsList
      );
    }
  };

  // Form submit handlers
  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleForm.vehicleId || !saleForm.customerId || saleForm.salePrice <= 0) {
      alert('Please select vehicle, customer, and enter valid sale price.');
      return;
    }

    const veh = state.vehicles.find((v) => v.id === saleForm.vehicleId);
    const cust = state.customers.find((c) => c.id === saleForm.customerId);
    const net = Math.max(0, saleForm.salePrice - (saleForm.discount || 0));
    const balance = Math.max(0, net - (saleForm.downPayment || 0));
    const status = balance === 0 ? 'paid' : saleForm.downPayment > 0 ? 'partial' : 'pending';

    if (activeModal === 'editSale' && selectedRecord) {
      updateSale({
        ...selectedRecord,
        vehicleId: saleForm.vehicleId,
        vehicleInfo: veh ? `${veh.make} ${veh.model} (${veh.year}) - ${veh.plateNumber}` : selectedRecord.vehicleInfo,
        customerId: saleForm.customerId,
        customerName: cust ? cust.name : selectedRecord.customerName,
        salePrice: Number(saleForm.salePrice),
        discount: Number(saleForm.discount || 0),
        netPrice: net,
        downPayment: Number(saleForm.downPayment || 0),
        remainingBalance: balance,
        paymentStatus: status,
        paymentMethod: saleForm.paymentMethod,
        salesRep: saleForm.salesRep,
        notes: saleForm.notes,
      });
    } else {
      createSale({
        vehicleId: saleForm.vehicleId,
        vehicleInfo: veh ? `${veh.make} ${veh.model} (${veh.year}) - ${veh.plateNumber}` : 'Luxury Vehicle',
        customerId: saleForm.customerId,
        customerName: cust ? cust.name : 'Valued Client',
        saleDate: new Date().toISOString().substring(0, 10),
        salePrice: Number(saleForm.salePrice),
        discount: Number(saleForm.discount || 0),
        netPrice: net,
        downPayment: Number(saleForm.downPayment || 0),
        remainingBalance: balance,
        paymentStatus: status,
        paymentMethod: saleForm.paymentMethod,
        salesRep: saleForm.salesRep,
        notes: saleForm.notes,
      });
    }
    setActiveModal(null);
  };

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseForm.sellerName || !purchaseForm.make || !purchaseForm.model || !purchaseForm.vin || purchaseForm.purchasePrice <= 0) {
      alert('Please fill all required acquisition fields.');
      return;
    }

    const totalCost = Number(purchaseForm.purchasePrice) + Number(purchaseForm.additionalCosts || 0);

    if (activeModal === 'editPurchase' && selectedRecord) {
      updatePurchase({
        ...selectedRecord,
        ...purchaseForm,
        purchasePrice: Number(purchaseForm.purchasePrice),
        additionalCosts: Number(purchaseForm.additionalCosts || 0),
        totalCost,
      });
    } else {
      createPurchase({
        sellerName: purchaseForm.sellerName,
        sellerPhone: purchaseForm.sellerPhone,
        make: purchaseForm.make,
        model: purchaseForm.model,
        year: Number(purchaseForm.year),
        vin: purchaseForm.vin,
        plateNumber: purchaseForm.plateNumber || 'Pending Reg',
        purchaseDate: new Date().toISOString().substring(0, 10),
        purchasePrice: Number(purchaseForm.purchasePrice),
        additionalCosts: Number(purchaseForm.additionalCosts || 0),
        totalCost,
        paymentStatus: 'paid',
        notes: purchaseForm.notes,
        receivedBy: purchaseForm.receivedBy,
      });
    }
    setActiveModal(null);
  };

  const handleSaveRental = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rentalForm.vehicleId || !rentalForm.customerId || rentalForm.dailyRate <= 0) {
      alert('Please select vehicle, customer, and specify daily lease rate.');
      return;
    }

    const start = new Date(rentalForm.startDate);
    const end = new Date(rentalForm.endDate);
    const days = Math.max(1, Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const totalAmount = days * Number(rentalForm.dailyRate);
    const veh = state.vehicles.find((v) => v.id === rentalForm.vehicleId);
    const cust = state.customers.find((c) => c.id === rentalForm.customerId);

    if (activeModal === 'editRental' && selectedRecord) {
      updateRental({
        ...selectedRecord,
        ...rentalForm,
        totalDays: days,
        dailyRate: Number(rentalForm.dailyRate),
        totalAmount,
        depositAmount: Number(rentalForm.depositAmount),
        paidAmount: totalAmount + Number(rentalForm.depositAmount),
      });
    } else {
      createRental({
        vehicleId: rentalForm.vehicleId,
        vehicleInfo: veh ? `${veh.make} ${veh.model} (${veh.year}) - ${veh.plateNumber}` : 'Luxury Fleet Vehicle',
        customerId: rentalForm.customerId,
        customerName: cust ? cust.name : 'VIP Customer',
        startDate: rentalForm.startDate,
        endDate: rentalForm.endDate,
        totalDays: days,
        dailyRate: Number(rentalForm.dailyRate),
        totalAmount,
        depositAmount: Number(rentalForm.depositAmount),
        paidAmount: totalAmount + Number(rentalForm.depositAmount),
        status: 'active',
        pickupMileage: veh?.currentMileage || 12000,
        contractTerms: rentalForm.contractTerms,
        notes: rentalForm.notes,
      });
    }
    setActiveModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/10 border border-blue-500/20 rounded-lg text-blue-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">AutoLux Dealership & Showroom</h1>
              <p className="text-xs text-slate-400">
                End-to-end management of luxury vehicle sales, fleet acquisitions, and VIP rental agreements.
              </p>
            </div>
          </div>
        </div>

        {/* Global Module Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            title="Reload from persistent backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export CSV / Excel
          </button>
          <button
            onClick={() => {
              if (subTab === 'sales') {
                setSaleForm({
                  vehicleId: availableVehicles[0]?.id || '',
                  customerId: state.customers[0]?.id || '',
                  salePrice: 2500000,
                  discount: 0,
                  downPayment: 1000000,
                  paymentMethod: 'Bank Wire (CIB)',
                  salesRep: state.currentUser.name,
                  notes: '',
                });
                setActiveModal('createSale');
              } else if (subTab === 'purchases') {
                setPurchaseForm({
                  sellerName: '',
                  sellerPhone: '',
                  make: 'Porsche',
                  model: 'Cayenne GTS',
                  year: 2023,
                  vin: '',
                  plateNumber: '',
                  purchasePrice: 3500000,
                  additionalCosts: 50000,
                  notes: '',
                  receivedBy: state.currentUser.name,
                });
                setActiveModal('createPurchase');
              } else {
                setRentalForm({
                  vehicleId: availableVehicles[0]?.id || '',
                  customerId: state.customers[0]?.id || '',
                  startDate: new Date().toISOString().substring(0, 10),
                  endDate: new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10),
                  dailyRate: 7500,
                  depositAmount: 30000,
                  contractTerms: 'Standard VIP comprehensive lease coverage.',
                  notes: '',
                });
                setActiveModal('createRental');
              }
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {subTab === 'sales'
              ? 'New Vehicle Sale'
              : subTab === 'purchases'
              ? 'Record Vehicle Acquisition'
              : 'Book Rental Agreement'}
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Sales Volume</span>
            <BadgePercent className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-white font-mono">
            {salesList.reduce((acc, s) => acc + (s.netPrice || 0), 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">EGP</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{salesList.length} signed vehicle sale contracts</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Outstanding Collections</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-amber-400 font-mono">
            {salesList.reduce((acc, s) => acc + (s.remainingBalance || 0), 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">EGP</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pending installment & balance receivables</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Fleet Capital Deployed</span>
            <BadgeDollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-white font-mono">
            {purchasesList.reduce((acc, p) => acc + (p.totalCost || 0), 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">EGP</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{purchasesList.length} luxury vehicles acquired into catalog</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Rental Revenue</span>
            <Key className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-purple-300 font-mono">
            {rentalsList.reduce((acc, r) => acc + (r.totalAmount || 0), 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">EGP</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{rentalsList.filter((r) => r.status === 'active').length} active VIP leases in field</p>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center border-b border-slate-800 gap-2">
        <button
          onClick={() => {
            setSubTab('sales');
            setActiveTab('sales');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            subTab === 'sales'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BadgePercent className="w-4 h-4" />
          Vehicle Sales ({salesList.length})
        </button>
        <button
          onClick={() => {
            setSubTab('purchases');
            setActiveTab('purchases');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            subTab === 'purchases'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BadgeDollarSign className="w-4 h-4" />
          Dealership Acquisitions ({purchasesList.length})
        </button>
        <button
          onClick={() => {
            setSubTab('rentals');
            setActiveTab('rentals');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            subTab === 'rentals'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          Luxury Car Rentals ({rentalsList.length})
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={`Search ${subTab} by customer, ID, vehicle, or VIN...`}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {subTab !== 'purchases' && (
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden"
              >
                <option value="all">All Statuses</option>
                {subTab === 'sales' ? (
                  <>
                    <option value="paid">Paid in Full</option>
                    <option value="partial">Partial Payment</option>
                    <option value="pending">Pending</option>
                  </>
                ) : (
                  <>
                    <option value="active">Active Lease</option>
                    <option value="returned">Returned</option>
                    <option value="confirmed">Confirmed</option>
                  </>
                )}
              </select>
            </div>
          )}
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-300 font-medium">
              {selectedIds.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every((item: any) => selectedIds.includes(item.id))
                    }
                    onChange={handleSelectAll}
                    className="rounded-sm border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
                  />
                </th>
                {subTab === 'sales' && (
                  <>
                    <th className="py-3 px-4 text-start">Sale # / Date</th>
                    <th className="py-3 px-4 text-start">Vehicle</th>
                    <th className="py-3 px-4 text-start">Buyer</th>
                    <th
                      className="py-3 px-4 text-end cursor-pointer hover:text-white"
                      onClick={() => {
                        setSortField('price');
                        setSortAsc(!sortAsc);
                      }}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Net Price</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 text-end">Down Payment</th>
                    <th
                      className="py-3 px-4 text-end cursor-pointer hover:text-white"
                      onClick={() => {
                        setSortField('balance');
                        setSortAsc(!sortAsc);
                      }}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Balance Due</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center">Payment Status</th>
                    <th className="py-3 px-4 text-end">Actions</th>
                  </>
                )}

                {subTab === 'purchases' && (
                  <>
                    <th className="py-3 px-4 text-start">Purchase # / Date</th>
                    <th className="py-3 px-4 text-start">Vehicle & Plate</th>
                    <th className="py-3 px-4 text-start">VIN</th>
                    <th className="py-3 px-4 text-start">Seller</th>
                    <th
                      className="py-3 px-4 text-end cursor-pointer hover:text-white"
                      onClick={() => {
                        setSortField('price');
                        setSortAsc(!sortAsc);
                      }}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Acquisition Cost</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 text-start">Received By</th>
                    <th className="py-3 px-4 text-end">Actions</th>
                  </>
                )}

                {subTab === 'rentals' && (
                  <>
                    <th className="py-3 px-4 text-start">Booking # / Dates</th>
                    <th className="py-3 px-4 text-start">Vehicle</th>
                    <th className="py-3 px-4 text-start">Client</th>
                    <th className="py-3 px-4 text-center">Duration</th>
                    <th className="py-3 px-4 text-end">Daily Rate</th>
                    <th className="py-3 px-4 text-end">Total Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-end">Actions</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800 text-slate-300">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <Car className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                    No records found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((record: any) => (
                  <tr key={record.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(record.id)}
                        onChange={() => handleToggleSelect(record.id)}
                        className="rounded-sm border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
                      />
                    </td>

                    {subTab === 'sales' && (
                      <>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-white block">
                            {record.saleNumber}
                          </span>
                          <span className="text-[11px] text-slate-400">{record.saleDate}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-200">
                          {record.vehicleInfo}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {record.customerName}
                          <span className="block text-[11px] text-slate-500">
                            Rep: {record.salesRep}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-end font-mono font-semibold text-white">
                          {Number(record.netPrice).toLocaleString()} EGP
                        </td>
                        <td className="py-3 px-4 text-end font-mono text-emerald-400">
                          {Number(record.downPayment).toLocaleString()} EGP
                        </td>
                        <td className="py-3 px-4 text-end font-mono font-semibold text-rose-400">
                          {Number(record.remainingBalance).toLocaleString()} EGP
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              record.paymentStatus === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : record.paymentStatus === 'partial'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {record.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-end">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedRecord(record);
                                setActiveModal('viewDetail');
                              }}
                              className="p-1 text-slate-400 hover:text-white transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => printDocument('sale_contract', record)}
                              className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                              title="Print Contract"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRecord(record);
                                setSaleForm({
                                  vehicleId: record.vehicleId,
                                  customerId: record.customerId,
                                  salePrice: record.salePrice,
                                  discount: record.discount,
                                  downPayment: record.downPayment,
                                  paymentMethod: record.paymentMethod,
                                  salesRep: record.salesRep,
                                  notes: record.notes || '',
                                });
                                setActiveModal('editSale');
                              }}
                              className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(record.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}

                    {subTab === 'purchases' && (
                      <>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-white block">
                            {record.purchaseNumber}
                          </span>
                          <span className="text-[11px] text-slate-400">{record.purchaseDate}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-200">
                          {record.make} {record.model} ({record.year})
                          <span className="block text-[11px] text-slate-400 font-mono">
                            {record.plateNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                          {record.vin}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {record.sellerName}
                          <span className="block text-[11px] text-slate-500">{record.sellerPhone}</span>
                        </td>
                        <td className="py-3 px-4 text-end font-mono font-bold text-white">
                          {Number(record.totalCost).toLocaleString()} EGP
                        </td>
                        <td className="py-3 px-4 text-slate-300">{record.receivedBy}</td>
                        <td className="py-3 px-4 text-end">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedRecord(record);
                                setActiveModal('viewDetail');
                              }}
                              className="p-1 text-slate-400 hover:text-white transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => printDocument('purchase_voucher', record)}
                              className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                              title="Print Acquisition Voucher"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRecord(record);
                                setPurchaseForm({
                                  sellerName: record.sellerName,
                                  sellerPhone: record.sellerPhone,
                                  make: record.make,
                                  model: record.model,
                                  year: record.year,
                                  vin: record.vin,
                                  plateNumber: record.plateNumber,
                                  purchasePrice: record.purchasePrice,
                                  additionalCosts: record.additionalCosts,
                                  notes: record.notes || '',
                                  receivedBy: record.receivedBy,
                                });
                                setActiveModal('editPurchase');
                              }}
                              className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(record.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}

                    {subTab === 'rentals' && (
                      <>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-white block">
                            {record.bookingNumber}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {record.startDate} → {record.endDate}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-200">
                          {record.vehicleInfo}
                        </td>
                        <td className="py-3 px-4 text-slate-300">{record.customerName}</td>
                        <td className="py-3 px-4 text-center font-mono">
                          {record.totalDays} Days
                        </td>
                        <td className="py-3 px-4 text-end font-mono">
                          {Number(record.dailyRate).toLocaleString()} EGP
                        </td>
                        <td className="py-3 px-4 text-end font-mono font-bold text-purple-300">
                          {Number(record.totalAmount).toLocaleString()} EGP
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              record.status === 'active'
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                : record.status === 'returned'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-end">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedRecord(record);
                                setActiveModal('viewDetail');
                              }}
                              className="p-1 text-slate-400 hover:text-white transition-colors"
                              title="View Agreement"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => printDocument('rental_agreement', record)}
                              className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                              title="Print Agreement"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRecord(record);
                                setRentalForm({
                                  vehicleId: record.vehicleId,
                                  customerId: record.customerId,
                                  startDate: record.startDate,
                                  endDate: record.endDate,
                                  dailyRate: record.dailyRate,
                                  depositAmount: record.depositAmount,
                                  contractTerms: record.contractTerms,
                                  notes: record.notes || '',
                                });
                                setActiveModal('editRental');
                              }}
                              className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(record.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="py-3 px-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-200">
              {currentData.length > 0 ? (page - 1) * pageSize + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-200">
              {Math.min(page * pageSize, currentData.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-200">{currentData.length}</span> entries
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-slate-300 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Create / Edit Sale */}
      {/* ------------------------------------------------------------- */}
      {(activeModal === 'createSale' || activeModal === 'editSale') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BadgePercent className="w-5 h-5 text-blue-400" />
                {activeModal === 'createSale' ? 'New Vehicle Sale Contract' : 'Edit Sale Contract'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSale} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Select Vehicle *</label>
                  <select
                    value={saleForm.vehicleId}
                    onChange={(e) => setSaleForm({ ...saleForm, vehicleId: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="">-- Choose Vehicle --</option>
                    {state.vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.make} {v.model} ({v.year}) - {v.plateNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Customer / Buyer *</label>
                  <select
                    value={saleForm.customerId}
                    onChange={(e) => setSaleForm({ ...saleForm, customerId: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="">-- Choose Customer --</option>
                    {state.customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Gross Price (EGP) *</label>
                  <input
                    type="number"
                    min="1"
                    value={saleForm.salePrice}
                    onChange={(e) => setSaleForm({ ...saleForm, salePrice: Number(e.target.value) })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Discount (EGP)</label>
                  <input
                    type="number"
                    min="0"
                    value={saleForm.discount}
                    onChange={(e) => setSaleForm({ ...saleForm, discount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Down Payment (EGP)</label>
                  <input
                    type="number"
                    min="0"
                    value={saleForm.downPayment}
                    onChange={(e) => setSaleForm({ ...saleForm, downPayment: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between font-mono">
                <span className="text-slate-400">Calculated Balance Due:</span>
                <span className="font-bold text-rose-400">
                  {Math.max(0, saleForm.salePrice - saleForm.discount - saleForm.downPayment).toLocaleString()}{' '}
                  EGP
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Payment Method</label>
                  <input
                    type="text"
                    value={saleForm.paymentMethod}
                    onChange={(e) => setSaleForm({ ...saleForm, paymentMethod: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Sales Representative</label>
                  <input
                    type="text"
                    value={saleForm.salesRep}
                    onChange={(e) => setSaleForm({ ...saleForm, salesRep: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Warranty & Contract Notes</label>
                <textarea
                  rows={2}
                  value={saleForm.notes}
                  onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })}
                  placeholder="Warranty terms, inclusion of service vouchers, etc."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {activeModal === 'createSale' ? 'Create Contract' : 'Update Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Record / Edit Vehicle Acquisition */}
      {/* ------------------------------------------------------------- */}
      {(activeModal === 'createPurchase' || activeModal === 'editPurchase') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BadgeDollarSign className="w-5 h-5 text-emerald-400" />
                {activeModal === 'createPurchase'
                  ? 'Record Dealership Vehicle Acquisition'
                  : 'Edit Acquisition Record'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Seller / Source Name *</label>
                  <input
                    type="text"
                    required
                    value={purchaseForm.sellerName}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, sellerName: e.target.value })}
                    placeholder="e.g. Bavarian Premium Imports"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Seller Phone</label>
                  <input
                    type="text"
                    value={purchaseForm.sellerPhone}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, sellerPhone: e.target.value })}
                    placeholder="+20 1xx..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Make *</label>
                  <input
                    type="text"
                    required
                    value={purchaseForm.make}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, make: e.target.value })}
                    placeholder="e.g. Porsche"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    value={purchaseForm.model}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, model: e.target.value })}
                    placeholder="e.g. 911 Carrera"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Model Year *</label>
                  <input
                    type="number"
                    min="1990"
                    max="2027"
                    required
                    value={purchaseForm.year}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, year: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">VIN Number (17 chars) *</label>
                  <input
                    type="text"
                    required
                    value={purchaseForm.vin}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, vin: e.target.value })}
                    placeholder="WP0AA2..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Plate Number</label>
                  <input
                    type="text"
                    value={purchaseForm.plateNumber}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, plateNumber: e.target.value })}
                    placeholder="e.g. أ ب ج ١ ٢ ٣"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Acquisition Price (EGP) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={purchaseForm.purchasePrice}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, purchasePrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Logistics / Inspection Costs (EGP)</label>
                  <input
                    type="number"
                    min="0"
                    value={purchaseForm.additionalCosts}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, additionalCosts: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between font-mono">
                <span className="text-slate-400">Total Capital Cost:</span>
                <span className="font-bold text-emerald-400">
                  {(Number(purchaseForm.purchasePrice) + Number(purchaseForm.additionalCosts || 0)).toLocaleString()}{' '}
                  EGP
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {activeModal === 'createPurchase' ? 'Save & Add to Inventory' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Book / Edit Luxury Rental */}
      {/* ------------------------------------------------------------- */}
      {(activeModal === 'createRental' || activeModal === 'editRental') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-400" />
                {activeModal === 'createRental' ? 'Book VIP Luxury Lease Agreement' : 'Edit Rental Booking'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRental} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Rental Vehicle *</label>
                  <select
                    value={rentalForm.vehicleId}
                    onChange={(e) => setRentalForm({ ...rentalForm, vehicleId: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-hidden focus:border-purple-500"
                  >
                    <option value="">-- Choose Fleet Vehicle --</option>
                    {state.vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.make} {v.model} ({v.year}) - {v.plateNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Client *</label>
                  <select
                    value={rentalForm.customerId}
                    onChange={(e) => setRentalForm({ ...rentalForm, customerId: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-hidden focus:border-purple-500"
                  >
                    <option value="">-- Choose Client --</option>
                    {state.customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={rentalForm.startDate}
                    onChange={(e) => setRentalForm({ ...rentalForm, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={rentalForm.endDate}
                    onChange={(e) => setRentalForm({ ...rentalForm, endDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Daily Rate (EGP) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={rentalForm.dailyRate}
                    onChange={(e) => setRentalForm({ ...rentalForm, dailyRate: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Security Deposit (EGP)</label>
                  <input
                    type="number"
                    min="0"
                    value={rentalForm.depositAmount}
                    onChange={(e) => setRentalForm({ ...rentalForm, depositAmount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Contract Conditions</label>
                <textarea
                  rows={2}
                  value={rentalForm.contractTerms}
                  onChange={(e) => setRentalForm({ ...rentalForm, contractTerms: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {activeModal === 'createRental' ? 'Book Agreement' : 'Update Agreement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: View Details Slideover/Dialog */}
      {/* ------------------------------------------------------------- */}
      {activeModal === 'viewDetail' && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                Record Details: {selectedRecord.saleNumber || selectedRecord.purchaseNumber || selectedRecord.bookingNumber}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs divide-y divide-slate-800/80">
              <div className="grid grid-cols-2 gap-2 pt-2">
                <span className="text-slate-400">Date:</span>
                <span className="font-semibold text-white">
                  {selectedRecord.saleDate || selectedRecord.purchaseDate || selectedRecord.startDate}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <span className="text-slate-400">Vehicle:</span>
                <span className="font-semibold text-white">
                  {selectedRecord.vehicleInfo || `${selectedRecord.make} ${selectedRecord.model}`}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <span className="text-slate-400">Counterparty:</span>
                <span className="font-semibold text-white">
                  {selectedRecord.customerName || selectedRecord.sellerName}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <span className="text-slate-400">Total Financial Value:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {Number(
                    selectedRecord.netPrice || selectedRecord.totalCost || selectedRecord.totalAmount
                  ).toLocaleString()}{' '}
                  EGP
                </span>
              </div>
              {selectedRecord.remainingBalance !== undefined && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <span className="text-slate-400">Outstanding Balance:</span>
                  <span className="font-mono font-bold text-rose-400">
                    {Number(selectedRecord.remainingBalance).toLocaleString()} EGP
                  </span>
                </div>
              )}
              {selectedRecord.notes && (
                <div className="pt-2">
                  <span className="text-slate-400 block mb-1">Notes:</span>
                  <p className="p-2 bg-slate-950 rounded text-slate-300 border border-slate-800">
                    {selectedRecord.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800 mt-4">
              <button
                onClick={() => {
                  if (selectedRecord.saleNumber) printDocument('sale_contract', selectedRecord);
                  else if (selectedRecord.purchaseNumber) printDocument('purchase_voucher', selectedRecord);
                  else printDocument('rental_agreement', selectedRecord);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Document
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CONFIRM DELETE DIALOG */}
      {/* ------------------------------------------------------------- */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-5 text-slate-100">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              Confirm Record Deletion
            </h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Are you sure you want to permanently delete this record? This action will update inventory and balances in the persistent database.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (subTab === 'sales') deleteSale(deleteConfirmId);
                  else if (subTab === 'purchases') deletePurchase(deleteConfirmId);
                  else if (subTab === 'rentals') deleteRental(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
