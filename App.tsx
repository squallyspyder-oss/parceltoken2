import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ConsumerDashboard from "./pages/ConsumerDashboard";
import MerchantDashboard from "./pages/MerchantDashboard";
import Checkout from "./pages/Checkout";
import TransactionHistory from "./pages/TransactionHistory";
import Simulation from "./pages/Simulation";
import MerchantAnalytics from "./pages/MerchantAnalytics";
import ApiDocs from "./pages/ApiDocsNew";
import AdminDashboard from "./pages/AdminDashboard";
import PrivacySettings from "./pages/PrivacySettings";
import ReferralProgram from "./pages/ReferralProgram";
import SDKDocumentation from "./pages/SDKDocumentation";
import Integrations from "./pages/Integrations";
import WebhooksDashboard from "@/pages/WebhooksDashboard";
import WebhookManagement from "@/pages/WebhookManagement";
import FraudDashboard from "./pages/FraudDashboard";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import AML from "./pages/AML";
import BillingDashboard from "./pages/BillingDashboard";
import PaymentOrchestratorDashboard from "./pages/PaymentOrchestratorDashboard";
import SmartQRDashboard from "./pages/SmartQRDashboard";
import ParcelTokenManagement from "./pages/ParcelTokenManagement";
import AdvancedAdminDashboard from "./pages/AdvancedAdminDashboard";
import Notifications from "./pages/Notifications";
import NotificationSettings from "./pages/NotificationSettings";
import WebhookConfiguration from "./pages/WebhookConfiguration";
import Achievements from "./pages/Achievements";
import CreditScore from "./pages/CreditScore";
import OpenFinance from "./pages/OpenFinance";
import FAQ from "./pages/FAQ";
import InvestorPage from "./pages/InvestorPage";
import StatusPage from "./pages/StatusPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={ConsumerDashboard} />
      <Route path="/merchant" component={MerchantDashboard} />
      <Route path="/checkout/:qrId?" component={Checkout} />
      <Route path="/history" component={TransactionHistory} />
      <Route path="/simulation" component={Simulation} />
      <Route path="/analytics" component={MerchantAnalytics} />
      <Route path="/api-docs" component={ApiDocs} />
      <Route path="/api" component={ApiDocs} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/privacy" component={PrivacySettings} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/settings/notifications" component={NotificationSettings} />
      <Route path="/webhooks" component={WebhookConfiguration} />
      <Route path={"/achievements"} component={Achievements} />
      <Route path={"/credit-score"} component={CreditScore} />
      <Route path="/open-finance" component={OpenFinance} />
      <Route path="/faq" component={FAQ} />
      <Route path="/investor" component={InvestorPage} />
      <Route path="/status" component={StatusPage} />
      <Route path="/referral" component={ReferralProgram} />
      <Route path="/sdk" component={SDKDocumentation} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/fraud" component={FraudDashboard} />
      <Route path="/billing" component={BillingDashboard} />
      <Route path="/orchestrator" component={PaymentOrchestratorDashboard} />
      <Route path="/smartqr" component={SmartQRDashboard} />
      <Route path="/tokens" component={ParcelTokenManagement} />
      <Route path="/admin-advanced" component={AdvancedAdminDashboard} />
      <Route path="/webhook-management" component={WebhookManagement} />
      <Route path="/privacy-policy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/aml" component={AML} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
