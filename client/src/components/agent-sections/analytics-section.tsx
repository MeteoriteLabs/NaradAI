import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, GitBranch, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format, isValid, parseISO } from "date-fns";

function formatDate(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return "Unknown date";
  try {
    const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
    if (!isValid(date)) return "Unknown date";
    return format(date, "MMM d, yyyy 'at' h:mm a");
  } catch {
    return "Unknown date";
  }
}

interface AnalyticsSectionProps {
  agentId: string;
}

export function AnalyticsSection({ agentId }: AnalyticsSectionProps) {
  const { data: analytics, isLoading } = useQuery<any>({
    queryKey: ["/api/agents", agentId, "analytics"],
    enabled: !!agentId,
  });

  const stats = [
    {
      title: "Total Conversations",
      value: analytics?.total_conversations || 0,
      icon: MessageSquare,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Leads Captured",
      value: analytics?.total_leads || 0,
      icon: Users,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Flows Triggered",
      value: analytics?.total_flows_triggered || 0,
      icon: GitBranch,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Avg. Session Length",
      value: "2m 34s",
      icon: TrendingUp,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} data-testid={`card-stat-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <div className="text-3xl font-bold mt-2" data-testid={`stat-value-${index}`}>
                      {isLoading ? <Skeleton className="h-9 w-20" /> : stat.value}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
          <CardDescription>Latest interactions with your AI agent</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : analytics?.recent_conversations && analytics.recent_conversations.length > 0 ? (
            <div className="space-y-4">
              {analytics.recent_conversations.map((conversation: any, index: number) => (
                <Card key={conversation.id} className="hover-elevate" data-testid={`card-conversation-${index}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={conversation.lead_captured ? "default" : "secondary"}>
                            {conversation.lead_captured ? "Lead Captured" : "Conversation"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(conversation.created_at)}
                          </span>
                        </div>
                        {conversation.context?.url && (
                          <p className="text-sm text-muted-foreground font-mono break-all">
                            {conversation.context.url}
                          </p>
                        )}
                        {conversation.flows_triggered && conversation.flows_triggered.length > 0 && (
                          <div className="flex items-center gap-2">
                            <GitBranch className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {conversation.flows_triggered.length} flow(s) triggered
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{conversation.transcript?.length || 0} messages</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No conversations yet</h3>
              <p className="text-sm text-muted-foreground">
                Once visitors start interacting with your AI agent, you'll see their conversations here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
