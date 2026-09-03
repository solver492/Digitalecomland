import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { LandingPage } from '@/pages/LandingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProductLandingPage } from '@/pages/ProductLandingPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { WalletPage } from '@/pages/WalletPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { DashboardLayout } from '@/components/DashboardLayout';

import { AdminLayout } from '@/components/AdminLayout';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminProducts } from '@/pages/admin/AdminProducts';
import { AdminCategories } from '@/pages/admin/AdminCategories';
import { AdminSuppliers } from '@/pages/admin/AdminSuppliers';
import { AdminDeliveryAgencies } from '@/pages/admin/AdminDeliveryAgencies';
import { AdminAffiliates } from '@/pages/admin/AdminAffiliates';
import { AdminOrders } from '@/pages/admin/AdminOrders';
import { AuthPage } from '@/pages/AuthPage';
import { AuthProvider } from '@/components/AuthProvider';
import { AdminRoute, ProtectedRoute } from '@/components/ProtectedRoute';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />

      {/* Admin Routes */}
      <Route path="/admin">
        <AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>
      </Route>
      <Route path="/admin/products">
        <AdminRoute><AdminLayout><AdminProducts /></AdminLayout></AdminRoute>
      </Route>
      <Route path="/admin/categories">
        <AdminRoute><AdminLayout><AdminCategories /></AdminLayout></AdminRoute>
      </Route>
      <Route path="/admin/suppliers">
        <AdminRoute><AdminLayout><AdminSuppliers /></AdminLayout></AdminRoute>
      </Route>
      <Route path="/admin/delivery-agencies">
        <AdminRoute><AdminLayout><AdminDeliveryAgencies /></AdminLayout></AdminRoute>
      </Route>
      <Route path="/admin/affiliates">
        <AdminRoute><AdminLayout><AdminAffiliates /></AdminLayout></AdminRoute>
      </Route>
      <Route path="/admin/orders">
        <AdminRoute><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>
      </Route>

      {/* Dashboard Routes */}
      <Route path="/dashboard">
        <ProtectedRoute><DashboardLayout><DashboardPage /></DashboardLayout></ProtectedRoute>
      </Route>
      <Route path="/dashboard/products">
        <ProtectedRoute><DashboardLayout><ProductsPage /></DashboardLayout></ProtectedRoute>
      </Route>
      <Route path="/dashboard/products/:id">
        <ProtectedRoute><DashboardLayout><ProductLandingPage /></DashboardLayout></ProtectedRoute>
      </Route>
      <Route path="/dashboard/orders">
        <ProtectedRoute><DashboardLayout><OrdersPage /></DashboardLayout></ProtectedRoute>
      </Route>
      <Route path="/dashboard/analytics">
        <ProtectedRoute><DashboardLayout><AnalyticsPage /></DashboardLayout></ProtectedRoute>
      </Route>
      <Route path="/dashboard/wallet">
        <ProtectedRoute><DashboardLayout><WalletPage /></DashboardLayout></ProtectedRoute>
      </Route>
      <Route path="/dashboard/settings">
        <ProtectedRoute><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
