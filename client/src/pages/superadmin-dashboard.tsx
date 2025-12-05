import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useSuperAdminAuth } from "./superadmin-login";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  LogOut, 
  Users, 
  Bot, 
  MessageSquare, 
  TrendingUp,
  Play,
  UserPlus,
  Settings,
  Database
} from "lucide-react";

export default function SuperAdminDashboard() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading, logout } = useSuperAdminAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/superadmin");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleLogout = () => {
    logout();
    setLocation("/superadmin");
  };

  const handleDemoAccount = () => {
    window.location.href = "/api/demo-login";
  };

  const handleCreateDemoUser = () => {
    toast({
      title: "Demo User Created",
      description: "A new demo user account has been created successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    { label: "Total Users", value: "1,234", icon: Users, color: "text-blue-500" },
    { label: "Active Agents", value: "567", icon: Bot, color: "text-green-500" },
    { label: "Conversations", value: "12.5K", icon: MessageSquare, color: "text-purple-500" },
    { label: "Leads Captured", value: "3,890", icon: TrendingUp, color: "text-orange-500" },
  ];

  const quickActions = [
    { 
      label: "Try Demo Account", 
      description: "Login as a demo user to test the platform",
      icon: Play, 
      onClick: handleDemoAccount,
      testId: "button-demo-account",
      variant: "default" as const
    },
    { 
      label: "Create Demo User", 
      description: "Generate a new demo user account",
      icon: UserPlus, 
      onClick: handleCreateDemoUser,
      testId: "button-create-demo-user",
      variant: "outline" as const
    },
    { 
      label: "System Settings", 
      description: "Configure platform settings",
      icon: Settings, 
      onClick: () => toast({ title: "Coming Soon", description: "System settings will be available soon." }),
      testId: "button-system-settings",
      variant: "outline" as const
    },
    { 
      label: "Database Management", 
      description: "View and manage database",
      icon: Database, 
      onClick: () => toast({ title: "Coming Soon", description: "Database management will be available soon." }),
      testId: "button-database-management",
      variant: "outline" as const
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold">Super Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Narada AI Administration</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} data-testid="button-superadmin-logout">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Welcome, Super Admin</h2>
          <p className="text-muted-foreground">Here's an overview of your platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} data-testid={`card-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Card key={action.label} className="hover-elevate cursor-pointer" onClick={action.onClick}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <action.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{action.label}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                    </div>
                    <Button 
                      variant={action.variant} 
                      size="sm"
                      data-testid={action.testId}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick();
                      }}
                    >
                      {action.label === "Try Demo Account" ? "Launch" : "Open"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New user registered", time: "2 minutes ago", user: "john@example.com" },
                { action: "Agent created", time: "15 minutes ago", user: "sarah@company.com" },
                { action: "Lead captured", time: "1 hour ago", user: "Website Visitor" },
                { action: "Conversation completed", time: "2 hours ago", user: "mike@business.com" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.user}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
