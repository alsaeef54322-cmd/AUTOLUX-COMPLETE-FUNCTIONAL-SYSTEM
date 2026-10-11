import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { RoleSwitcherModal } from './components/layout/RoleSwitcherModal';
import { NotificationsDrawer } from './components/layout/NotificationsDrawer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { PrintModal } from './components/common/PrintModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { QuickReceptionView } from './components/reception/QuickReceptionView';
import { ServiceOrdersView } from './components/serviceOrders/ServiceOrdersView';
import { WorkshopBoardView } from './components/workshopBoard/WorkshopBoardView';
import { InspectionsView } from './components/inspections/InspectionsView';
import { EstimatesView } from './components/estimates/EstimatesView';
import { CustomersView } from './components/customers/CustomersView';
import { VehiclesView } from './components/vehicles/VehiclesView';
import { DealershipView } from './components/dealership/DealershipView';
import { SparePartsView } from './components/inventory/SparePartsView';
import { StockMovementsView } from './components/inventory/StockMovementsView';
import { SuppliersAndPurchasingView } from './components/inventory/SuppliersAndPurchasingView';
import { InvoicesView } from './components/finance/InvoicesView';
import { PaymentsView } from './components/finance/PaymentsView';
import { CashManagementView } from './components/finance/CashManagementView';
import { ExpensesView } from './components/finance/ExpensesView';
import { FinancialReportsView } from './components/finance/FinancialReportsView';
import { EmployeesView } from './components/hr/EmployeesView';
import { UsersPermissionsView } from './components/admin/UsersPermissionsView';
import { AuditLogView } from './components/admin/AuditLogView';
import { SettingsView } from './components/admin/SettingsView';

import { LoginPage } from './components/auth/LoginPage';

const MainContent: React.FC = () => {
  const { activeTab, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'reception':
        return <QuickReceptionView />;
      case 'service_orders':
        return <ServiceOrdersView />;
      case 'inspections':
        return <InspectionsView />;
      case 'estimates':
        return <EstimatesView />;
      case 'workshop_board':
        return <WorkshopBoardView />;
      case 'customers':
        return <CustomersView />;
      case 'vehicles':
        return <VehiclesView />;
      case 'sales':
      case 'purchases':
      case 'rentals':
        return <DealershipView />;
      case 'spare_parts':
        return <SparePartsView />;
      case 'stock_movements':
        return <StockMovementsView />;
      case 'suppliers':
      case 'purchase_orders':
        return <SuppliersAndPurchasingView />;
      case 'invoices':
        return <InvoicesView />;
      case 'payments':
        return <PaymentsView />;
      case 'cash_management':
        return <CashManagementView />;
      case 'expenses':
        return <ExpensesView />;
      case 'financial_reports':
        return <FinancialReportsView />;
      case 'employees':
      case 'attendance':
      case 'payroll':
        return <EmployeesView />;
      case 'users_permissions':
        return <UsersPermissionsView />;
      case 'audit_log':
        return <AuditLogView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <AppShell>
      {renderActiveView()}
      <RoleSwitcherModal />
      <NotificationsDrawer />
      <GlobalSearchModal />
      <PrintModal />
    </AppShell>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
