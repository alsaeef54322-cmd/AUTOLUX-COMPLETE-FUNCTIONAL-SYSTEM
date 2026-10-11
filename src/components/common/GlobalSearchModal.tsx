import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, Car, User, FileText, Wrench, Package, UserCheck } from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchModalOpen, setIsSearchModalOpen, state, setActiveTab, t } = useApp();
  const [query, setQuery] = useState('');

  if (!isSearchModalOpen) return null;

  const q = query.trim().toLowerCase();

  // Search across customers
  const matchingCustomers = q
    ? state.customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.nameAr && c.nameAr.toLowerCase().includes(q)) ||
          c.phone.includes(q) ||
          c.customerNumber.toLowerCase().includes(q)
      )
    : [];

  // Search across vehicles
  const matchingVehicles = q
    ? state.vehicles.filter(
        (v) =>
          v.plateNumber.toLowerCase().includes(q) ||
          (v.plateNumberArabic && v.plateNumberArabic.includes(q)) ||
          v.vin.toLowerCase().includes(q) ||
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q)
      )
    : [];

  // Search across service orders
  const matchingOrders = q
    ? state.serviceOrders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerComplaint.toLowerCase().includes(q) ||
          o.advisorName.toLowerCase().includes(q)
      )
    : [];

  // Search across spare parts
  const matchingParts = q
    ? state.spareParts.filter(
        (p) =>
          p.sku.toLowerCase().includes(q) ||
          p.partNumber.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          (p.nameAr && p.nameAr.includes(q))
      )
    : [];

  // Search across invoices
  const matchingInvoices = q
    ? state.invoices.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q)
      )
    : [];

  // Search across employees
  const matchingEmployees = q
    ? state.employees.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.nameAr && e.nameAr.toLowerCase().includes(q)) ||
          e.phone.includes(q) ||
          e.jobTitle.toLowerCase().includes(q) ||
          (e.jobTitleAr && e.jobTitleAr.toLowerCase().includes(q))
      )
    : [];

  const hasResults =
    matchingCustomers.length > 0 ||
    matchingVehicles.length > 0 ||
    matchingOrders.length > 0 ||
    matchingParts.length > 0 ||
    matchingInvoices.length > 0 ||
    matchingEmployees.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-xs p-4" dir="rtl">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باسم العميل، الموبايل، رقم اللوحة، الشاسيه، أمر الشغل، أو اسم الموظف..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg cursor-pointer"
          >
            إغلاق
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!q ? (
            <div className="py-12 text-center text-xs text-slate-400">
              اكتب كلمة البحث للوصول الفوري للعملاء، السيارات، أوامر الشغل، قطع الغيار، أو فريق العمل
            </div>
          ) : !hasResults ? (
            <div className="py-12 text-center text-xs text-slate-400">
              لا توجد نتائج مطابقة لـ "{query}"
            </div>
          ) : (
            <>
              {/* Service Orders */}
              {matchingOrders.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    أوامر الصيانة وبطاقات العمل
                  </div>
                  <div className="space-y-1.5">
                    {matchingOrders.slice(0, 4).map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          setActiveTab('service_orders');
                          setIsSearchModalOpen(false);
                        }}
                        className="w-full text-start p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Wrench className="w-4 h-4 text-blue-500" />
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {o.orderNumber} · {o.advisorName}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-md">
                              {o.customerComplaint}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 font-bold">
                          {o.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Vehicles */}
              {matchingVehicles.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    السيارات والمركبات
                  </div>
                  <div className="space-y-1.5">
                    {matchingVehicles.slice(0, 4).map((v) => (
                      <button
                        key={v.id}
                        onClick={() => {
                          setActiveTab('vehicles');
                          setIsSearchModalOpen(false);
                        }}
                        className="w-full text-start p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Car className="w-4 h-4 text-emerald-500" />
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {v.make} {v.model} ({v.year})
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {v.plateNumber} · {v.plateNumberArabic}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          {v.currentMileage.toLocaleString()} كم
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers */}
              {matchingCustomers.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    قاعدة العملاء
                  </div>
                  <div className="space-y-1.5">
                    {matchingCustomers.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setActiveTab('customers');
                          setIsSearchModalOpen(false);
                        }}
                        className="w-full text-start p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <User className="w-4 h-4 text-purple-500" />
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {c.nameAr || c.name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {c.phone} · {c.customerNumber}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400">{c.address}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Employees */}
              {matchingEmployees.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    فريق العمل والمهندسين
                  </div>
                  <div className="space-y-1.5">
                    {matchingEmployees.slice(0, 4).map((e) => (
                      <button
                        key={e.id}
                        onClick={() => {
                          setActiveTab('employees');
                          setIsSearchModalOpen(false);
                        }}
                        className="w-full text-start p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <UserCheck className="w-4 h-4 text-cyan-500" />
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {e.nameAr || e.name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {e.jobTitleAr || e.jobTitle} · {e.phone}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-medium">
                          {e.status === 'active' ? 'نشط' : 'إجازة'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Parts */}
              {matchingParts.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    قطع الغيار والمستودع
                  </div>
                  <div className="space-y-1.5">
                    {matchingParts.slice(0, 4).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActiveTab('spare_parts');
                          setIsSearchModalOpen(false);
                        }}
                        className="w-full text-start p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Package className="w-4 h-4 text-amber-500" />
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {p.nameAr || p.name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              كود: {p.sku} · الرف: {p.binLocation}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-blue-500 tabular-nums">
                          {p.sellingPrice.toLocaleString()} {t.currencySymbol}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices */}
              {matchingInvoices.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    الفواتير الضريبية
                  </div>
                  <div className="space-y-1.5">
                    {matchingInvoices.slice(0, 4).map((i) => (
                      <button
                        key={i.id}
                        onClick={() => {
                          setActiveTab('invoices');
                          setIsSearchModalOpen(false);
                        }}
                        className="w-full text-start p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-emerald-500" />
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {i.invoiceNumber} · {i.customerName}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {i.issueDate}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-500 tabular-nums">
                          {i.totalAmount.toLocaleString()} {t.currencySymbol}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
