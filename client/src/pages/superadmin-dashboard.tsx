import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useSuperAdminAuth } from "./superadmin-login";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { 
  Shield, 
  LogOut, 
  Users, 
  Bot, 
  MessageSquare, 
  TrendingUp,
  Play,
  Sparkles,
  Settings,
  Database,
  Loader2,
  Home,
  Mail,
  Calendar
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { User } from "@shared/schema";

type PageType = "home" | "users";

function SuperAdminSidebar({ 
  currentPage, 
  onPageChange 
}: { 
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}) {
  const menuItems = [
    { title: "Home", icon: Home, page: "home" as PageType },
    { title: "Users", icon: Users, page: "users" as PageType },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => onPageChange(item.page)}
                    isActive={currentPage === item.page}
                    data-testid={`nav-${item.page}`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function HomePage({ 
  onDemoLogin, 
  onNaradaAILogin, 
  loginLoading 
}: { 
  onDemoLogin: () => void;
  onNaradaAILogin: () => void;
  loginLoading: string | null;
}) {
  const { toast } = useToast();
  
  const stats = [
    { label: "Total Users", value: "1,234", icon: Users, color: "text-blue-500" },
    { label: "Active Agents", value: "567", icon: Bot, color: "text-green-500" },
    { label: "Conversations", value: "12.5K", icon: MessageSquare, color: "text-purple-500" },
    { label: "Leads Captured", value: "3,890", icon: TrendingUp, color: "text-orange-500" },
  ];

  const quickActions = [
    { 
      label: "Login as NaradaAI", 
      description: "Access the NaradaAI demo account with the landing page widget",
      icon: Sparkles, 
      onClick: onNaradaAILogin,
      testId: "button-naradaai-account",
      variant: "default" as const,
      loading: loginLoading === "naradaai"
    },
    { 
      label: "Login as Demo User", 
      description: "Access the generic demo account for testing",
      icon: Play, 
      onClick: onDemoLogin,
      testId: "button-demo-account",
      variant: "outline" as const,
      loading: loginLoading === "demo"
    },
    { 
      label: "System Settings", 
      description: "Configure platform settings",
      icon: Settings, 
      onClick: () => toast({ title: "Coming Soon", description: "System settings will be available soon." }),
      testId: "button-system-settings",
      variant: "outline" as const,
      loading: false
    },
    { 
      label: "Database Management", 
      description: "View and manage database",
      icon: Database, 
      onClick: () => toast({ title: "Coming Soon", description: "Database management will be available soon." }),
      testId: "button-database-management",
      variant: "outline" as const,
      loading: false
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Welcome, Super Admin</h2>
        <p className="text-muted-foreground">Here's an overview of your platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} data-testid={`card-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-2">
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
            <Card 
              key={action.label} 
              className={`hover-elevate cursor-pointer ${action.loading ? 'opacity-75' : ''}`} 
              onClick={action.loading ? undefined : action.onClick}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {action.loading ? (
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    ) : (
                      <action.icon className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold">{action.label}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                  </div>
                  <Button 
                    variant={action.variant} 
                    size="sm"
                    data-testid={action.testId}
                    disabled={action.loading}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!action.loading) {
                        action.onClick();
                      }
                    }}
                  >
                    {action.loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : action.label.includes("Login") ? "Launch" : "Open"}
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
              <div key={index} className="flex items-center justify-between gap-2 py-2 border-b last:border-0 flex-wrap">
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
    </div>
  );
}

function UsersPage() {
  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ["/api/superadmin/users"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Failed to load users. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Users</h2>
        <p className="text-muted-foreground">Manage all platform users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            All Users ({users?.length || 0})
          </CardTitle>
          <CardDescription>View and manage registered users</CardDescription>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                    <TableCell className="font-mono text-sm max-w-[120px] truncate">{user.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        {user.email || "-"}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.firstName || user.lastName 
                        ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                        : "-"
                      }
                    </TableCell>
                    <TableCell>{user.companyName || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Active</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading, logout } = useSuperAdminAuth();
  const { toast } = useToast();
  const [loginLoading, setLoginLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>("home");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/superadmin");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleLogout = () => {
    logout();
    setLocation("/superadmin");
  };

  const handleDemoAccountLogin = async () => {
    setLoginLoading("demo");
    try {
      const response = await fetch("/api/demo-login", {
        method: "GET",
        headers: {
          "X-SuperAdmin-Auth": "narada-superadmin-authorized",
        },
        redirect: "follow",
      });
      
      if (response.redirected) {
        window.location.href = response.url;
      } else if (response.ok) {
        window.location.href = "/";
      } else {
        throw new Error("Failed to login as Demo user");
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Failed to login as Demo user. Please try again.",
        variant: "destructive",
      });
      setLoginLoading(null);
    }
  };

  const handleNaradaAILogin = async () => {
    setLoginLoading("naradaai");
    try {
      const response = await fetch("/api/naradaai-login", {
        method: "GET",
        headers: {
          "X-SuperAdmin-Auth": "narada-superadmin-authorized",
        },
        redirect: "follow",
      });
      
      if (response.redirected) {
        window.location.href = response.url;
      } else if (response.ok) {
        window.location.href = "/";
      } else {
        throw new Error("Failed to login as NaradaAI user");
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Failed to login as NaradaAI user. Please try again.",
        variant: "destructive",
      });
      setLoginLoading(null);
    }
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

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex min-h-screen w-full">
        <SuperAdminSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <div className="flex flex-col flex-1">
          <header className="border-b bg-card h-14 flex items-center justify-between gap-2 px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h1 className="font-semibold text-sm">Super Admin</h1>
                  <p className="text-xs text-muted-foreground">Narada AI</p>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} data-testid="button-superadmin-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {currentPage === "home" && (
              <HomePage 
                onDemoLogin={handleDemoAccountLogin}
                onNaradaAILogin={handleNaradaAILogin}
                loginLoading={loginLoading}
              />
            )}
            {currentPage === "users" && <UsersPage />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
