import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import Home from "@/pages/Home";
import Marketing from "@/pages/Marketing";
import Support from "@/pages/Support";
import Privacy from "@/pages/Privacy";
import NotFound from "@/pages/not-found";
import { PortalProvider } from "@/lib/portal-context";
import { PortalLayout } from "@/components/portal/PortalLayout";
import PortalDashboard from "@/pages/portal/Dashboard";
import PortalProfile from "@/pages/portal/Profile";
import PortalPlans from "@/pages/portal/Plans";
import PortalBilling from "@/pages/portal/Billing";
import PortalPromotions from "@/pages/portal/Promotions";
import PortalUsage from "@/pages/portal/Usage";
import PortalSupport from "@/pages/portal/Support";
import PortalSettings from "@/pages/portal/Settings";
import PortalCheckout from "@/pages/portal/Checkout";
import AdminInspect from "@/pages/portal/AdminInspect";

function PortalRoutes() {
  return (
    <PortalProvider>
      <PortalLayout>
        <Switch>
          <Route path="/portal/contractor" component={PortalDashboard} />
          <Route path="/portal/contractor/profile" component={PortalProfile} />
          <Route path="/portal/contractor/plans" component={PortalPlans} />
          <Route path="/portal/contractor/billing" component={PortalBilling} />
          <Route path="/portal/contractor/promotions" component={PortalPromotions} />
          <Route path="/portal/contractor/usage" component={PortalUsage} />
          <Route path="/portal/contractor/support" component={PortalSupport} />
          <Route path="/portal/contractor/settings" component={PortalSettings} />
          <Route path="/portal/contractor/checkout/:planId" component={PortalCheckout} />
          <Route path="/portal/contractor/admin" component={AdminInspect} />
          <Route component={NotFound} />
        </Switch>
      </PortalLayout>
    </PortalProvider>
  );
}

function PortalGate() {
  const [location] = useLocation();
  if (location.startsWith("/portal/")) {
    return <PortalRoutes />;
  }
  return null;
}

function Router() {
  const [location] = useLocation();

  if (location.startsWith("/portal/")) {
    return <PortalGate />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/asystent-remontu" component={Marketing} />
      <Route path="/pomoc" component={Support} />
      <Route path="/polityka-prywatnosci" component={Privacy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

export default App;
