import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Dashboard from '@/pages/Dashboard';
import Landing from '@/pages/Landing';
import CommandManagement from '@/pages/CommandManagement';
import WidgetTest from '@/pages/WidgetTest';
import ProspectManagement from '@/pages/ProspectManagement';
import Analytics from '@/pages/Analytics';
import MobileWidget from '@/pages/MobileWidget';
import TeamView from '@/pages/TeamView';
import AutoPilot from '@/pages/AutoPilot';
import DealIntelligence from '@/pages/DealIntelligence';
import ConversationAnalytics from '@/pages/ConversationAnalytics';
import MeetingCopilot from '@/pages/MeetingCopilot';
import PlaybookManager from '@/pages/PlaybookManager';
import TestRunner from '@/pages/TestRunner';
import CRMAndCommsHub from '@/pages/CRMAndCommsHub';
import CallAnalysisDashboard from '@/pages/CallAnalysisDashboard';
import ConversationContextManager from '@/pages/ConversationContextManager';
import EmailEngagement from '@/pages/EmailEngagement';
import LinkedInMonitor from '@/pages/LinkedInMonitor';
import CRMAdapterSetup from '@/pages/CRMAdapterSetup';
import SMSThreads from '@/pages/SMSThreads';
import CalendarAnalytics from '@/pages/CalendarAnalytics';
import LinkedInMessaging from '@/pages/LinkedInMessaging';
import ActionDashboard from '@/pages/ActionDashboard';
import CoachingCenter from '@/pages/CoachingCenter';
import DealPhysicsEngine from '@/pages/DealPhysicsEngine';
import RepDNA from '@/pages/RepDNA';
import ObjectionPreFlight from '@/pages/ObjectionPreFlight';
import ProspectReadinessPulse from '@/pages/ProspectReadinessPulse';
import QuietPeriodMonitor from '@/pages/QuietPeriodMonitor';
import RevenueForecasting from '@/pages/RevenueForecasting';
import WinLossAnalyzer from '@/pages/WinLossAnalyzer';
import TeamLeaderboard from '@/pages/TeamLeaderboard';
import EmailTemplateStudio from '@/pages/EmailTemplateStudio';
import DealCollaborationRooms from '@/pages/DealCollaborationRooms';
import BillShield from '@/pages/BillShield';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import Security from '@/pages/Security';
import Contact from '@/pages/Contact';
import Pricing from '@/pages/Pricing';
import CheckoutSuccess from '@/pages/CheckoutSuccess';
import Ambassador from '@/pages/Ambassador';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/commands" element={<CommandManagement />} />
      <Route path="/prospects" element={<ProspectManagement />} />
      <Route path="/widget-test" element={<WidgetTest />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/mobile" element={<MobileWidget />} />
      <Route path="/team" element={<TeamView />} />
      <Route path="/autopilot" element={<AutoPilot />} />
      <Route path="/deals" element={<DealIntelligence />} />
      <Route path="/conversations" element={<ConversationAnalytics />} />
      <Route path="/meeting-prep" element={<MeetingCopilot />} />
      <Route path="/playbooks" element={<PlaybookManager />} />
      <Route path="/tests" element={<TestRunner />} />
      <Route path="/crm-comms" element={<CRMAndCommsHub />} />
      <Route path="/call-analysis" element={<CallAnalysisDashboard />} />
      <Route path="/conversation-context" element={<ConversationContextManager />} />
      <Route path="/email-engagement" element={<EmailEngagement />} />
      <Route path="/linkedin-monitor" element={<LinkedInMonitor />} />
      <Route path="/crm-adapter" element={<CRMAdapterSetup />} />
      <Route path="/sms" element={<SMSThreads />} />
      <Route path="/calendar-analytics" element={<CalendarAnalytics />} />
      <Route path="/linkedin-messaging" element={<LinkedInMessaging />} />
      <Route path="/actions" element={<ActionDashboard />} />
      <Route path="/coaching" element={<CoachingCenter />} />
      <Route path="/deal-physics" element={<DealPhysicsEngine />} />
      <Route path="/rep-dna" element={<RepDNA />} />
      <Route path="/objection-preflight" element={<ObjectionPreFlight />} />
      <Route path="/readiness-pulse" element={<ProspectReadinessPulse />} />
      <Route path="/quiet-monitor" element={<QuietPeriodMonitor />} />
      <Route path="/forecasting" element={<RevenueForecasting />} />
      <Route path="/win-loss" element={<WinLossAnalyzer />} />
      <Route path="/leaderboard" element={<TeamLeaderboard />} />
      <Route path="/email-studio" element={<EmailTemplateStudio />} />
      <Route path="/deal-rooms" element={<DealCollaborationRooms />} />
      <Route path="/billshield" element={<BillShield />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/security" element={<Security />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/checkout-success" element={<CheckoutSuccess />} />
      <Route path="/ambassador" element={<Ambassador />} />
      {/* Add your page Route elements here */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App