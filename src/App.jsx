import { Toaster } from "@/components/ui/toaster"
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import OfflineIndicator from '@/components/OfflineIndicator'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
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
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import Security from '@/pages/Security';
import Contact from '@/pages/Contact';
import Pricing from '@/pages/Pricing';
import CheckoutSuccess from '@/pages/CheckoutSuccess';
import LeadPipeline from '@/pages/LeadPipeline';
import DownloadGuide from '@/pages/DownloadGuide';
import SEOAutomator from '@/pages/SEOAutomator';
import MobileApp from '@/pages/MobileApp';
import SEOResults from '@/pages/SEOResults';
import AdminOnly from '@/components/AdminOnly';
import AskRichy from '@/components/AskRichy';
import RequirePlan from '@/components/RequirePlan';

const PUBLIC_PATHS = ['/', '/pricing', '/contact', '/privacy', '/terms', '/security', '/mobile-app', '/checkout-success'];

// Known routes that require authentication. Unknown paths are intentionally NOT
// listed here so they fall through to the catch-all 404 page rather than silently
// redirecting an anonymous visitor to login (which served indexable 200 content).
const KNOWN_AUTH_ROUTES = new Set([
  '/dashboard', '/commands', '/prospects', '/widget-test', '/analytics', '/mobile',
  '/team', '/autopilot', '/deals', '/conversations', '/meeting-prep', '/playbooks',
  '/tests', '/crm-comms', '/call-analysis', '/conversation-context', '/email-engagement',
  '/linkedin-monitor', '/crm-adapter', '/sms', '/calendar-analytics', '/linkedin-messaging',
  '/actions', '/coaching', '/deal-physics', '/rep-dna', '/objection-preflight',
  '/readiness-pulse', '/quiet-monitor', '/forecasting', '/win-loss', '/leaderboard',
  '/email-studio', '/deal-rooms', '/lead-pipeline', '/download-guide',
  '/seo-automator', '/seo-results'
]);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

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
      // Only redirect to login for known authenticated routes. Unknown paths fall
      // through to the catch-all 404 page (with noindex) rather than silently
      // redirecting an anonymous visitor to login as indexable 200 content.
      if (KNOWN_AUTH_ROUTES.has(location.pathname)) {
        navigateToLogin();
        return null;
      }
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<RequirePlan><Dashboard /></RequirePlan>} />
      <Route path="/commands" element={<RequirePlan><CommandManagement /></RequirePlan>} />
      <Route path="/prospects" element={<RequirePlan><ProspectManagement /></RequirePlan>} />
      <Route path="/widget-test" element={<AdminOnly><WidgetTest /></AdminOnly>} />
      <Route path="/analytics" element={<AdminOnly><Analytics /></AdminOnly>} />
      <Route path="/mobile" element={<RequirePlan><MobileWidget /></RequirePlan>} />
      <Route path="/team" element={<AdminOnly><TeamView /></AdminOnly>} />
      <Route path="/autopilot" element={<AdminOnly><AutoPilot /></AdminOnly>} />
      <Route path="/deals" element={<AdminOnly><DealIntelligence /></AdminOnly>} />
      <Route path="/conversations" element={<AdminOnly><ConversationAnalytics /></AdminOnly>} />
      <Route path="/meeting-prep" element={<AdminOnly><MeetingCopilot /></AdminOnly>} />
      <Route path="/playbooks" element={<AdminOnly><PlaybookManager /></AdminOnly>} />
      <Route path="/tests" element={<AdminOnly><TestRunner /></AdminOnly>} />
      <Route path="/crm-comms" element={<AdminOnly><CRMAndCommsHub /></AdminOnly>} />
      <Route path="/call-analysis" element={<AdminOnly><CallAnalysisDashboard /></AdminOnly>} />
      <Route path="/conversation-context" element={<AdminOnly><ConversationContextManager /></AdminOnly>} />
      <Route path="/email-engagement" element={<AdminOnly><EmailEngagement /></AdminOnly>} />
      <Route path="/linkedin-monitor" element={<AdminOnly><LinkedInMonitor /></AdminOnly>} />
      <Route path="/crm-adapter" element={<AdminOnly><CRMAdapterSetup /></AdminOnly>} />
      <Route path="/sms" element={<AdminOnly><SMSThreads /></AdminOnly>} />
      <Route path="/calendar-analytics" element={<AdminOnly><CalendarAnalytics /></AdminOnly>} />
      <Route path="/linkedin-messaging" element={<AdminOnly><LinkedInMessaging /></AdminOnly>} />
      <Route path="/actions" element={<AdminOnly><ActionDashboard /></AdminOnly>} />
      <Route path="/coaching" element={<AdminOnly><CoachingCenter /></AdminOnly>} />
      <Route path="/deal-physics" element={<AdminOnly><DealPhysicsEngine /></AdminOnly>} />
      <Route path="/rep-dna" element={<AdminOnly><RepDNA /></AdminOnly>} />
      <Route path="/objection-preflight" element={<AdminOnly><ObjectionPreFlight /></AdminOnly>} />
      <Route path="/readiness-pulse" element={<AdminOnly><ProspectReadinessPulse /></AdminOnly>} />
      <Route path="/quiet-monitor" element={<AdminOnly><QuietPeriodMonitor /></AdminOnly>} />
      <Route path="/forecasting" element={<AdminOnly><RevenueForecasting /></AdminOnly>} />
      <Route path="/win-loss" element={<AdminOnly><WinLossAnalyzer /></AdminOnly>} />
      <Route path="/leaderboard" element={<AdminOnly><TeamLeaderboard /></AdminOnly>} />
      <Route path="/email-studio" element={<AdminOnly><EmailTemplateStudio /></AdminOnly>} />
      <Route path="/deal-rooms" element={<AdminOnly><DealCollaborationRooms /></AdminOnly>} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/security" element={<Security />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/checkout-success" element={<CheckoutSuccess />} />
      <Route path="/lead-pipeline" element={<AdminOnly><LeadPipeline /></AdminOnly>} />
      <Route path="/download-guide" element={<AdminOnly><DownloadGuide /></AdminOnly>} />
      <Route path="/seo-automator" element={<AdminOnly><SEOAutomator /></AdminOnly>} />
      <Route path="/mobile-app" element={<MobileApp />} />
      <Route path="/seo-results" element={<AdminOnly><SEOResults /></AdminOnly>} />
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
        <AskRichy />
        <PWAInstallPrompt />
        <OfflineIndicator />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App