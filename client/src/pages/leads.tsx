import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Mail, Phone, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format, isValid, parseISO } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function formatDate(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return "Unknown";
  try {
    const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
    if (!isValid(date)) return "Unknown";
    return format(date, "MMM d, yyyy");
  } catch {
    return "Unknown";
  }
}

export default function LeadsPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");

  const { data: agents } = useQuery<any[]>({
    queryKey: ["/api/agents"],
  });

  const { data: leads, isLoading } = useQuery<any[]>({
    queryKey: ["/api/agents", selectedAgentId, "leads"],
    enabled: !!selectedAgentId,
  });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground mt-1">
          View and manage captured leads from your AI agent
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
            <SelectTrigger data-testid="select-agent">
              <SelectValue placeholder="Choose an agent" />
            </SelectTrigger>
            <SelectContent>
              {agents?.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedAgentId && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Captured Leads</CardTitle>
                <CardDescription>
                  {leads?.length || 0} leads from visitor interactions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : leads && leads.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead, index) => (
                      <TableRow key={lead.id} data-testid={`row-lead-${index}`}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {lead.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                <a
                                  href={`mailto:${lead.email}`}
                                  className="text-primary hover:underline"
                                  data-testid={`link-email-${index}`}
                                >
                                  {lead.email}
                                </a>
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="text-primary hover:underline"
                                  data-testid={`link-phone-${index}`}
                                >
                                  {lead.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.context?.url ? (
                            <div className="flex items-center gap-2">
                              <Globe className="w-3 h-3 text-muted-foreground" />
                              <span className="text-sm font-mono text-muted-foreground">
                                {lead.context.url}
                              </span>
                            </div>
                          ) : (
                            <Badge variant="secondary">Unknown</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(lead.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No leads captured yet</h3>
                <p className="text-sm text-muted-foreground">
                  When visitors provide their contact information through your AI agent, they'll appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
