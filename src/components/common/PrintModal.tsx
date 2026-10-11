import React from 'react';
import { useApp } from '../../context/AppContext';
import { Printer, X, ShieldCheck } from 'lucide-react';

export const PrintModal: React.FC = () => {
  const { activePrintDoc, closePrintDoc, state, t } = useApp();

  if (!activePrintDoc) return null;

  const { docType, data } = activePrintDoc;
  const settings = state.settings;

  const handlePrint = () => {
    window.print();
  };

  const getDocTitle = () => {
    switch (docType) {
      case 'invoice':
        return 'فاتورة صيانة ضريبية معتمدة';
      case 'reception_ticket':
        return 'إذن استلام مركبة وتفويض صيانة';
      case 'job_card':
        return 'أمر عمل فني وبطاقة فحص الورشة';
      case 'employees_report':
        return 'كشف فريق العمل والمهندسين والفنيين';
      case 'users_report':
        return 'كشف حسابات المستخدمين والصلاحيات';
      case 'customer_statement':
        return 'كشف حساب وبيانات عميل';
      case 'vehicle_sheet':
        return 'بطاقة بيانات وفحص مركبة';
      case 'payslip':
        return 'مسير راتب موظف';
      case 'sale_contract':
        return 'عقد بيع وفاتورة سيارة';
      case 'purchase_voucher':
        return 'سند شراء وتوريد مركبة';
      case 'rental_agreement':
        return 'عقد تأجير مركبة';
      case 'audit_report':
        return 'تقرير سجل الرقابة وتتبع العمليات';
      default:
        return 'مستند رسمي - مركز صيانة التجمع الخامس';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-8 border border-slate-200">
        {/* Top Control Bar (Hidden during actual print) */}
        <div className="no-print flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm">{getDocTitle()}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة المستند</span>
            </button>
            <button
              onClick={closePrintDoc}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="p-8 md:p-10 bg-white min-h-[650px] text-slate-900 font-sans" id="printable-area">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">
                {settings.workshopName || 'مركز صيانة التجمع الخامس'}
              </h1>
              <p className="text-xs text-slate-700 font-semibold mt-1">
                {settings.branch || 'الفرع الرئيسي - القاهرة الجديدة'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {settings.address || 'المنطقة الصناعية لخدمات وصيانة السيارات، التجمع الخامس، القاهرة الجديدة'}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                هاتف: {settings.phone} · البريد: {settings.email}
              </p>
            </div>
            <div className="text-start">
              <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded-lg font-bold text-xs text-slate-800">
                {getDocTitle()}
              </span>
              <div className="mt-3 text-xs text-slate-600 space-y-0.5">
                <div>رقم المستند: <span className="font-mono font-bold text-slate-900">{data.invoiceNumber || data.orderNumber || data.employeeNumber || data.customerNumber || data.id || 'DOC-2026-01'}</span></div>
                <div>تاريخ التحرير: <span className="font-medium text-slate-900">{data.issueDate || data.createdAt?.substring(0, 10) || new Date().toISOString().substring(0, 10)}</span></div>
                <div>البطاقة الضريبية: <span className="font-medium text-slate-900">{settings.taxNumber}</span></div>
                <div>السجل التجاري: <span className="font-medium text-slate-900">{settings.commercialReg}</span></div>
              </div>
            </div>
          </div>

          {/* Invoice Document */}
          {docType === 'invoice' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200">
                <div>
                  <div className="font-bold text-slate-500 uppercase text-[10px]">العميل / الطرف الثاني</div>
                  <div className="font-bold text-slate-950 text-sm mt-0.5">{data.customerName || data.customer?.name}</div>
                  <div className="text-slate-600 mt-1">{data.customerAddress || 'التجمع الخامس، القاهرة الجديدة'}</div>
                  <div className="text-slate-600">رقم الهاتف: {data.customerPhone || '010XXXXXXXX'}</div>
                </div>
                <div>
                  <div className="font-bold text-slate-500 uppercase text-[10px]">بيانات السيارة / الجهاز</div>
                  <div className="font-bold text-slate-950 text-sm mt-0.5">{data.vehicleInfo || `${data.vehicleMake || ''} ${data.vehicleModel || ''}`}</div>
                  <div className="text-slate-700 font-mono mt-1">رقم اللوحة: {data.plateNumber || data.vehiclePlate || '-'}</div>
                  <div className="text-slate-600">رقم أمر الشغل: {data.orderNumber || '-'}</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 text-start font-bold text-slate-800">بيان الأعمال وقطع الغيار</th>
                      <th className="py-2.5 px-4 text-center font-bold text-slate-800">الكمية</th>
                      <th className="py-2.5 px-4 text-end font-bold text-slate-800">سعر الوحدة (ج.م)</th>
                      <th className="py-2.5 px-4 text-end font-bold text-slate-800">الإجمالي (ج.م)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data.lineItems || []).map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="py-2.5 px-4 text-slate-800 font-medium">{item.description}</td>
                        <td className="py-2.5 px-4 text-center font-mono">{item.quantity}</td>
                        <td className="py-2.5 px-4 text-end font-mono">{Number(item.unitPrice || 0).toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-end font-mono font-bold text-slate-900">{Number(item.total || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                    {(!data.lineItems || data.lineItems.length === 0) && (
                      <tr>
                        <td className="py-2.5 px-4 text-slate-800 font-medium">أعمال صيانة وإصلاح وفحص ميكانيكي شامل</td>
                        <td className="py-2.5 px-4 text-center font-mono">1</td>
                        <td className="py-2.5 px-4 text-end font-mono">{Number(data.totalAmount || 0).toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-end font-mono font-bold">{Number(data.totalAmount || 0).toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-start text-xs">
                <div className="w-72 space-y-2 border-t border-slate-200 pt-3">
                  <div className="flex justify-between text-slate-600">
                    <span>المجموع الفرعي:</span>
                    <span className="font-mono font-bold">{Number(data.subtotal || data.totalAmount || 0).toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>ضريبة القيمة المضافة ({data.taxRate || 14}%):</span>
                    <span className="font-mono font-bold">{Number(data.taxAmount || 0).toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-950 pt-2 border-t border-slate-300">
                    <span>إجمالي الفاتورة:</span>
                    <span className="font-mono text-base text-blue-900">{Number(data.totalAmount || 0).toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>المدفوع نقداً/بنك:</span>
                    <span className="font-mono text-emerald-700 font-bold">{Number(data.paidAmount || 0).toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>المتبقي المطلوب سداده:</span>
                    <span className="font-mono text-rose-700 font-bold">{Number(data.balanceDue || data.remainingBalance || 0).toLocaleString()} ج.م</span>
                  </div>
                </div>
              </div>

              {/* Warranty Notice */}
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-900">
                <span className="font-bold">شروط الضمان: </span>
                الضمان يسري لمدة 30 يوماً أو 1,000 كم (أيهما أقرب) على المصنعيات وقطع الغيار الأصلية الموردة بمعرفة مركز صيانة التجمع الخامس.
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-10 border-t border-slate-300 text-xs text-center">
                <div>
                  <div className="border-b border-slate-400 pb-8 mb-2"></div>
                  <div className="font-bold text-slate-800">توقيع العميل المستلم</div>
                </div>
                <div>
                  <div className="border-b border-slate-400 pb-8 mb-2"></div>
                  <div className="font-bold text-slate-800">ختم المركز والمدير المالي</div>
                </div>
              </div>
            </div>
          )}

          {/* Job Card Document */}
          {(docType === 'job_card' || docType === 'reception_ticket') && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200">
                <div>
                  <div className="font-bold text-slate-500 uppercase text-[10px]">بيانات العميل</div>
                  <div className="font-bold text-slate-950 text-sm mt-0.5">{data.customerName || data.customer?.name}</div>
                  <div className="text-slate-600 mt-1">الهاتف: {data.customerPhone || data.customer?.phone}</div>
                </div>
                <div>
                  <div className="font-bold text-slate-500 uppercase text-[10px]">بيانات المركبة والمستشار</div>
                  <div className="font-bold text-slate-950 text-sm mt-0.5">{data.vehicleMake} {data.vehicleModel}</div>
                  <div className="text-slate-700 font-mono mt-1">رقم اللوحة: {data.plateNumber} · العداد: {data.mileageIn?.toLocaleString()} كم</div>
                  <div className="text-slate-600">مهندس الاستقبال: {data.advisorName || 'م. أحمد السيد'}</div>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl text-xs space-y-2">
                <div className="font-bold text-slate-800">الشكوى المسجلة والفحص المبدئي:</div>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {data.complaint || data.customerComplaint || 'فحص وصيانة دورية شاملة للمحرك والمكابح'}
                </p>
                <div className="pt-2 text-slate-600 flex items-center justify-between">
                  <span>الأولوية: <span className="font-bold text-slate-900">{data.priority === 'urgent' ? 'عاجلة جداً' : 'عادية'}</span></span>
                  <span>الحالة: <span className="font-bold text-blue-700">{data.status || 'قيد الفحص'}</span></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-10 border-t border-slate-300 text-xs text-center">
                <div>
                  <div className="border-b border-slate-400 pb-8 mb-2"></div>
                  <div className="font-bold text-slate-800">توقيع العميل بالموافقة على الفحص</div>
                </div>
                <div>
                  <div className="border-b border-slate-400 pb-8 mb-2"></div>
                  <div className="font-bold text-slate-800">مهندس استلام الورشة</div>
                </div>
              </div>
            </div>
          )}

          {/* Employees Report */}
          {docType === 'employees_report' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 text-start font-bold">كود</th>
                      <th className="py-2 px-3 text-start font-bold">الاسم الكامل</th>
                      <th className="py-2 px-3 text-start font-bold">الوظيفة / التخصص</th>
                      <th className="py-2 px-3 text-start font-bold">الهاتف</th>
                      <th className="py-2 px-3 text-end font-bold">الراتب</th>
                      <th className="py-2 px-3 text-center font-bold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data.employees || []).map((emp: any) => (
                      <tr key={emp.id}>
                        <td className="py-2 px-3 font-mono">{emp.employeeNumber}</td>
                        <td className="py-2 px-3 font-bold">{emp.nameAr || emp.name}</td>
                        <td className="py-2 px-3">{emp.jobTitleAr || emp.jobTitle}</td>
                        <td className="py-2 px-3 font-mono" dir="ltr">{emp.phone}</td>
                        <td className="py-2 px-3 text-end font-mono">{emp.monthlySalary?.toLocaleString()} ج.م</td>
                        <td className="py-2 px-3 text-center">{emp.status === 'active' ? 'على رأس العمل' : 'إجازة'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-slate-600 font-bold">
                إجمالي الموظفين المدرجين: {data.totalCount || data.employees?.length}
              </div>
            </div>
          )}

          {/* Users Report */}
          {docType === 'users_report' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 text-start font-bold">اسم المستخدم</th>
                      <th className="py-2 px-3 text-start font-bold">اسم الدخول (Username)</th>
                      <th className="py-2 px-3 text-start font-bold">الدور والصلاحية</th>
                      <th className="py-2 px-3 text-start font-bold">الهاتف</th>
                      <th className="py-2 px-3 text-center font-bold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data.users || []).map((u: any) => (
                      <tr key={u.id}>
                        <td className="py-2 px-3 font-bold">{u.nameAr || u.name}</td>
                        <td className="py-2 px-3 font-mono text-blue-700">{u.username}</td>
                        <td className="py-2 px-3">{u.role}</td>
                        <td className="py-2 px-3 font-mono" dir="ltr">{u.phone || '-'}</td>
                        <td className="py-2 px-3 text-center">{u.isActive !== false ? 'نشط' : 'موقوف'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-slate-600 font-bold">
                إجمالي الحسابات: {data.totalCount || data.users?.length}
              </div>
            </div>
          )}

          {/* Audit Report */}
          {docType === 'audit_report' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 text-start font-bold">التوقيت</th>
                      <th className="py-2 px-3 text-start font-bold">المستخدم</th>
                      <th className="py-2 px-3 text-start font-bold">الإجراء</th>
                      <th className="py-2 px-3 text-start font-bold">الكيان</th>
                      <th className="py-2 px-3 text-start font-bold">التفاصيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data.logs || []).slice(0, 30).map((log: any) => (
                      <tr key={log.id}>
                        <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap">{log.timestamp}</td>
                        <td className="py-2 px-3 font-bold">{log.userName}</td>
                        <td className="py-2 px-3 font-mono text-[11px]">{log.action}</td>
                        <td className="py-2 px-3 text-slate-600">{log.entity}</td>
                        <td className="py-2 px-3 text-slate-800">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-slate-600 font-bold">
                إجمالي السجلات: {data.logs?.length || 0}
              </div>
            </div>
          )}

          {/* Footer stamp */}
          <div className="mt-12 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>مستند إلكتروني رسمي صادر من مركز صيانة التجمع الخامس · معتمد وموثق</span>
            </div>
            <div>صفحة 1 من 1</div>
          </div>
        </div>
      </div>
    </div>
  );
};
