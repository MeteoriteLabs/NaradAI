import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/user-nav";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/useAuth";
import LandingPage from "@/pages/landing";
import OnboardingPage from "@/pages/onboarding";
import AgentsPage from "@/pages/agents";
import AgentDetailPage from "@/pages/agent-detail";
import LeadsPage from "@/pages/leads";
import DocsPage from "@/pages/docs";
import AccountPage from "@/pages/account";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import NotFound from "@/pages/not-found";
import { Skeleton } from "@/components/ui/skeleton";

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/agents" />
      </Route>
      <Route path="/agents" component={AgentsPage} />
      <Route path="/agents/:id" component={AgentDetailPage} />
      <Route path="/leads" component={LeadsPage} />
      <Route path="/docs" component={DocsPage} />
      <Route path="/account" component={AccountPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedLayout() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <UserNav />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <AuthenticatedRouter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 text-center">
        <Skeleton className="w-16 h-16 rounded-2xl mx-auto" />
        <Skeleton className="w-32 h-4 mx-auto" />
      </div>
    </div>
  );
}

function PublicRouter() {
  return (
    <Switch>
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/docs" component={DocsPage} />
      <Route component={LandingPage} />
    </Switch>
  );
}

function AppRouter() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location] = useLocation();

  const publicOnlyPaths = ["/privacy", "/terms"];
  const isPublicOnlyPath = publicOnlyPaths.some(path => location === path);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isPublicOnlyPath) {
    return <PublicRouter />;
  }

  if (!isAuthenticated) {
    return <PublicRouter />;
  }

  if (user && !user.onboardingCompleted) {
    return <OnboardingPage user={user} />;
  }

  return <AuthenticatedLayout />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AppRouter />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
