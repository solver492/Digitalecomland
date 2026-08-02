import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { LandingPage } from '@/pages/LandingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { WalletPage } from '@/pages/WalletPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { DashboardLayout } from '@/components/DashboardLayout';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      
      {/* Dashboard Routes wrapped in Layout */}
      <Route path="/dashboard">
        <DashboardLayout><DashboardPage /></DashboardLayout>
      </Route>
      <Route path="/dashboard/products">
        <DashboardLayout><ProductsPage /></DashboardLayout>
      </Route>
      <Route path="/dashboard/orders">
        <DashboardLayout><OrdersPage /></DashboardLayout>
      </Route>
      <Route path="/dashboard/analytics">
        <DashboardLayout><AnalyticsPage /></DashboardLayout>
      </Route>
      <Route path="/dashboard/wallet">
        <DashboardLayout><WalletPage /></DashboardLayout>
      </Route>
      <Route path="/dashboard/settings">
        <DashboardLayout><SettingsPage /></DashboardLayout>
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
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
