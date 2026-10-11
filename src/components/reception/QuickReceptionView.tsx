import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Priority } from '../../types';
import {
  Car,
  User,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle2,
  Search,
  Plus,
  Printer,
  Wrench,
  Fuel,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const QuickReceptionView: React.FC = () => {
  const { state, receiveVehicle, setActiveTab, printDocument, theme, t } = useApp();
  const isDark = theme === 'dark';

  // Mode states
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // New Customer inputs
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('التجمع الخامس، القاهرة الجديدة');

  // Vehicle states
  const [vehicleMode, setVehicleMode] = useState<'existing' | 'new'>('existing');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');

  // New Vehicle inputs
  const [newPlateNumber, setNewPlateNumber] = useState('');
  const [newVin, setNewVin] = useState('');
  const [newMake, setNewMake] = useState('BMW');
  const [newModel, setNewModel] = useState('530i M Sport');
  const [newYear, setNewYear] = useState(2023);
  const [newColor, setNewColor] = useState('أسود ميتاليك');

  // Intake operational details
  const [mileageIn, setMileageIn] = useState<number>(52000);
  const [complaint, setComplaint] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [advisorId, setAdvisorId] = useState(state.employees[5]?.id || state.employees[0]?.id);
  const [fuelLevel, setFuelLevel] = useState<number>(60);
  const [selectedDamages, setSelectedDamages] = useState<string[]>([]);
  const [customDamage, setCustomDamage] = useState('');

  // Submission result modal
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtering existing customers
  const filteredCustomers = state.customers.filter((c) => {
    if (!customerSearch) return true;
    const q = customerSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.nameAr && c.nameAr.toLowerCase().includes(q)) ||
      c.phone.includes(q) ||
      c.customerNumber.toLowerCase().includes(q)
    );
  });

  // When a customer is picked, filter their linked vehicles or all vehicles
  const filteredVehicles = state.vehicles.filter((v) => {
    if (selectedCustomerId && v.customerId !== selectedCustomerId) {
      return false;
    }
    if (!vehicleSearch) return true;
    const q = vehicleSearch.toLowerCase();
    return (
      v.plateNumber.toLowerCase().includes(q) ||
      (v.plateNumberArabic && v.plateNumberArabic.includes(q)) ||
      v.vin.toLowerCase().includes(q) ||
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q)
    );
  });

  const handleSelectVehicle = (vId: string) => {
    setSelectedVehicleId(vId);
    const veh = state.vehicles.find((v) => v.id === vId);
    if (veh) {
      setMileageIn(veh.currentMileage);
      if (veh.customerId && customerMode === 'existing') {
        setSelectedCustomerId(veh.customerId);
      }
    }
  };

  const commonDamagePoints = [
    'خدش سطحي بالإكصدام الأمامي',
    'نقرة حجر بالزجاج الأمامي',
    'حكة بجنط العجلة اليمنى',
    'صدمة خفيفة بالرفرف الخلفي',
  ];

  const toggleDamage = (pt: string) => {
    if (selectedDamages.includes(pt)) {
      setSelectedDamages(selectedDamages.filter((d) => d !== pt));
    } else {
      setSelectedDamages([...selectedDamages, pt]);
    }
  };

  const handleAddCustomDamage = () => {
    if (customDamage.trim()) {
      setSelectedDamages([...selectedDamages, customDamage.trim()]);
      setCustomDamage('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (customerMode === 'existing' && !selectedCustomerId) {
      setErrorMsg('يرجى اختيار العميل من القائمة');
      return;
    }
    if (customerMode === 'new' && (!newCustomerName || !newCustomerPhone)) {
      setErrorMsg('يرجى إدخال اسم ورقم هاتف العميل الجديد');
      return;
    }
    if (vehicleMode === 'existing' && !selectedVehicleId) {
      setErrorMsg('يرجى اختيار السيارة المسجلة');
      return;
    }
    if (vehicleMode === 'new' && (!newPlateNumber || !newMake || !newModel)) {
      setErrorMsg('يرجى إدخال بيانات اللوحة والماركة والموديل');
      return;
    }
    if (!complaint.trim()) {
      setErrorMsg('يرجى كتابة شكوى العميل أو الخدمة المطلوبة');
      return;
    }

    const payload = {
      customerMode,
      customerId: selectedCustomerId,
      newCustomer: customerMode === 'new' ? {
        name: newCustomerName,
        phone: newCustomerPhone,
        email: newCustomerEmail || `${newCustomerPhone}@tagamoa-care.eg`,
        address: newCustomerAddress,
      } : undefined,
      vehicleMode,
      vehicleId: selectedVehicleId,
      newVehicle: vehicleMode === 'new' ? {
        plateNumber: newPlateNumber.toUpperCase(),
        vin: newVin || `VIN-${Date.now().toString().slice(-8)}`,
        make: newMake,
        model: newModel,
        year: Number(newYear),
        color: newColor,
      } : undefined,
      mileageIn: Number(mileageIn),
      complaint: complaint.trim(),
      priority,
      advisorId,
      preExistingDamage: selectedDamages,
      fuelLevel,
    };

    const res = receiveVehicle(payload);
    if (res.success && res.serviceOrder) {
      setCreatedOrder(res.serviceOrder);
    } else {
      setErrorMsg(res.error || 'فشل استلام السيارة.');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Sparkles className="w-6 h-6 text-blue-500" />
            <span>الاستقبال السريع وتسجيل السيارات (Fast Vehicle Intake)</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            تسجيل دخول فوري للمركبات بمركز صيانة التجمع الخامس، فتح كارت الشغل، وتوثيق الفحص الظاهري في دقيقة واحدة
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customer & Vehicle Identification (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Customer Section */}
          <div className={`border rounded-2xl p-5 space-y-4 ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>بيانات العميل</h3>
              </div>
              <div className={`flex items-center p-0.5 rounded-xl text-xs font-bold border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setCustomerMode('existing')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    customerMode === 'existing'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  عميل مسجل
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode('new')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    customerMode === 'new'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  + عميل جديد
                </button>
              </div>
            </div>

            {customerMode === 'existing' ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-3" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="ابحث باسم العميل أو رقم هاتفه..."
                    className={`w-full ps-10 pe-4 py-2.5 rounded-xl border text-xs ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className={`max-h-48 overflow-y-auto space-y-1.5 border rounded-xl p-2 ${
                  isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
                }`}>
                  {filteredCustomers.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      لا يوجد عميل مطابق للبحث
                    </div>
                  ) : (
                    filteredCustomers.map((cust) => {
                      const isSelected = selectedCustomerId === cust.id;
                      return (
                        <div
                          key={cust.id}
                          onClick={() => setSelectedCustomerId(cust.id)}
                          className={`p-3 rounded-lg cursor-pointer border transition-colors flex items-center justify-between text-xs ${
                            isSelected
                              ? 'bg-blue-500/10 border-blue-500 text-blue-500 font-bold'
                              : isDark
                              ? 'bg-slate-900/60 border-transparent hover:border-slate-800 text-slate-300'
                              : 'bg-white border-transparent hover:border-slate-200 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {cust.nameAr || cust.name}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 font-mono" dir="ltr">
                              {cust.phone} · {cust.address}
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 font-mono">
                            {cust.customerNumber}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold">اسم العميل بالكامل *</label>
                  <input
                    type="text"
                    required
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="مثال: د. شريف منصور"
                    className={`w-full p-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold">رقم الهاتف المحمول *</label>
                  <input
                    type="text"
                    required
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="010xxxxxxxx"
                    className={`w-full p-2.5 rounded-xl border font-mono ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    placeholder="customer@email.com"
                    className={`w-full p-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold">العنوان أو المنطقة</label>
                  <input
                    type="text"
                    value={newCustomerAddress}
                    onChange={(e) => setNewCustomerAddress(e.target.value)}
                    placeholder="التجمع الخامس، القاهرة الجديدة"
                    className={`w-full p-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Vehicle Section */}
          <div className={`border rounded-2xl p-5 space-y-4 ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-500" />
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>بيانات السيارة والمركبة</h3>
              </div>
              <div className={`flex items-center p-0.5 rounded-xl text-xs font-bold border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setVehicleMode('existing')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    vehicleMode === 'existing'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  سيارة مسجلة
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleMode('new')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    vehicleMode === 'new'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  + تسجيل سيارة جديدة
                </button>
              </div>
            </div>

            {vehicleMode === 'existing' ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-3" />
                  <input
                    type="text"
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    placeholder="ابحث برقم اللوحة، الماركة، أو الشاسيه..."
                    className={`w-full ps-10 pe-4 py-2.5 rounded-xl border text-xs ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className={`max-h-48 overflow-y-auto space-y-1.5 border rounded-xl p-2 ${
                  isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
                }`}>
                  {filteredVehicles.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      لا توجد سيارة مطابقة
                    </div>
                  ) : (
                    filteredVehicles.map((veh) => {
                      const isSelected = selectedVehicleId === veh.id;
                      return (
                        <div
                          key={veh.id}
                          onClick={() => handleSelectVehicle(veh.id)}
                          className={`p-3 rounded-lg cursor-pointer border transition-colors flex items-center justify-between text-xs ${
                            isSelected
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 font-bold'
                              : isDark
                              ? 'bg-slate-900/60 border-transparent hover:border-slate-800 text-slate-300'
                              : 'bg-white border-transparent hover:border-slate-200 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {veh.make} {veh.model} ({veh.year})
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              اللوحة: {veh.plateNumber} · الشاسيه: {veh.vin}
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-400 tabular-nums font-mono">
                            {veh.currentMileage.toLocaleString()} كم
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold">رقم اللوحة المعدنية *</label>
                  <input
                    type="text"
                    required
                    value={newPlateNumber}
                    onChange={(e) => setNewPlateNumber(e.target.value)}
                    placeholder="مثال: س ر ق ٥٤٢١"
                    className={`w-full p-2.5 rounded-xl border font-mono ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold">الماركة / الشركة *</label>
                  <input
                    type="text"
                    required
                    value={newMake}
                    onChange={(e) => setNewMake(e.target.value)}
                    placeholder="مثال: مرسيدس / بي إم دبليو"
                    className={`w-full p-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold">الموديل / الفئة *</label>
                  <input
                    type="text"
                    required
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="مثال: C 200 AMG"
                    className={`w-full p-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold">سنة الصنع</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    min={2000}
                    max={2027}
                    className={`w-full p-2.5 rounded-xl border font-mono ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold">اللون</label>
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="مثال: أسود ميتاليك"
                    className={`w-full p-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold">رقم الشاسيه (VIN)</label>
                  <input
                    type="text"
                    value={newVin}
                    onChange={(e) => setNewVin(e.target.value)}
                    placeholder="17 حرف ورقم"
                    className={`w-full p-2.5 rounded-xl border font-mono ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Odometer, Complaint, Priority, Damage, Confirmation (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`border rounded-2xl p-5 space-y-4 ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className={`flex items-center gap-2 pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <FileText className="w-4 h-4 text-purple-500" />
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>تفاصيل الشكوى وأمر الشغل</h3>
            </div>

            {/* Odometer & Priority */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-400 font-bold">قراءة العداد (كم) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={mileageIn}
                  onChange={(e) => setMileageIn(Number(e.target.value))}
                  className={`w-full p-2.5 rounded-xl border font-mono font-bold tabular-nums ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-400 font-bold">درجة الأولوية *</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="normal">عادية (مجدولة)</option>
                  <option value="urgent">عاجلة (خلال اليوم)</option>
                  <option value="critical">حرجة (طوارئ وونش)</option>
                </select>
              </div>
            </div>

            {/* Customer Complaint */}
            <div className="text-xs space-y-1">
              <label className="block text-slate-400 font-bold">شكوى العميل والأعمال المطلوبة *</label>
              <textarea
                required
                rows={3}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="مثال: فحص دوري للمحرك، رعشة في الفرامل عند سرعة 100 كم، تغيير زيت وفلاتر..."
                className={`w-full p-2.5 rounded-xl border leading-relaxed ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            {/* Service Advisor assignment */}
            <div className="text-xs space-y-1">
              <label className="block text-slate-400 font-bold">مهندس / مستشار الاستقبال المسؤول</label>
              <select
                value={advisorId}
                onChange={(e) => setAdvisorId(e.target.value)}
                className={`w-full p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                {state.employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nameAr || emp.name} ({emp.jobTitleAr || emp.jobTitle})
                  </option>
                ))}
              </select>
            </div>

            {/* Fuel Level Gauge */}
            <div className="text-xs space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-slate-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-amber-500" />
                  <span>مستوى الوقود عند الاستلام</span>
                </span>
                <span className="font-mono text-white font-bold">{fuelLevel}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={fuelLevel}
                onChange={(e) => setFuelLevel(Number(e.target.value))}
                className="w-full accent-blue-600 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Pre-existing Damage Checklist */}
            <div className={`text-xs space-y-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <label className="block text-slate-400 font-bold">
                توثيق الملاحظات والخدوش الظاهرية السابقة
              </label>
              <div className="space-y-1.5">
                {commonDamagePoints.map((pt, i) => {
                  const checked = selectedDamages.includes(pt);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDamage(pt)}
                      className={`w-full text-start p-2.5 rounded-xl border text-[11px] transition-colors flex items-center justify-between cursor-pointer ${
                        checked
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-500 font-bold'
                          : isDark
                          ? 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span>{pt}</span>
                      {checked && <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Damage Input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={customDamage}
                  onChange={(e) => setCustomDamage(e.target.value)}
                  placeholder="ملاحظة ظاهرية أخرى..."
                  className={`flex-1 p-2 rounded-xl border text-xs ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddCustomDamage}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Confirmation CTA Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد استلام السيارة وفتح كارت الشغل</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Confirmation Success Dialog */}
      {createdOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4" dir="rtl">
          <div className={`w-full max-w-lg border rounded-2xl p-6 shadow-2xl text-center space-y-5 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl'
          }`}>
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                تم استلام السيارة وفتح أمر الشغل بنجاح!
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                تم حفظ بيانات المركبة والعميل محلياً وتوجيه كارت الشغل للورشة
              </p>
            </div>

            <div className={`p-4 rounded-xl border text-start space-y-2 text-xs ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between">
                <span className="text-slate-400">رقم أمر الشغل:</span>
                <span className="font-mono font-bold text-blue-500 text-sm">{createdOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">العميل:</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {state.customers.find((c) => c.id === createdOrder.customerId)?.nameAr ||
                   state.customers.find((c) => c.id === createdOrder.customerId)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">السيارة:</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {state.vehicles.find((v) => v.id === createdOrder.vehicleId)?.make}{' '}
                  {state.vehicles.find((v) => v.id === createdOrder.vehicleId)?.model} (
                  {state.vehicles.find((v) => v.id === createdOrder.vehicleId)?.plateNumber})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">العداد المسجل:</span>
                <span className={`tabular-nums font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{createdOrder.mileageIn.toLocaleString()} كم</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <button
                onClick={() => {
                  printDocument('reception_ticket', {
                    ...createdOrder,
                    customer: state.customers.find((c) => c.id === createdOrder.customerId),
                    vehicleMake: state.vehicles.find((v) => v.id === createdOrder.vehicleId)?.make,
                    vehicleModel: state.vehicles.find((v) => v.id === createdOrder.vehicleId)?.model,
                    plateNumber: state.vehicles.find((v) => v.id === createdOrder.vehicleId)?.plateNumber,
                  });
                }}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <Printer className="w-4 h-4 text-blue-500" />
                <span>طباعة إذن الاستلام</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('inspections');
                  setCreatedOrder(null);
                }}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-500 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>بدء الفحص الفني</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('service_orders');
                  setCreatedOrder(null);
                }}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md shadow-blue-600/30"
              >
                <span>متابعة أمر الشغل</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
