import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Activity, User as UserIcon, Clock, Globe } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import type { UserActivity, User } from "@shared/schema";

export default function ActivityLogsPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>("all");

  // Fetch all users for filtering
  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  // Fetch activity logs with optional user filter
  const { data: activities = [], isLoading } = useQuery<UserActivity[]>({
    queryKey: selectedUserId === "all" 
      ? ["/api/activity-logs"] 
      : [`/api/activity-logs?userId=${selectedUserId}`],
  });

  // Get action badge variant based on action type
  const getActionVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
    if (action === "login") return "outline";
    if (action.includes("create")) return "default";
    if (action.includes("delete")) return "destructive";
    if (action.includes("start")) return "secondary";
    return "outline";
  };

  // Format action for display
  const formatAction = (action: string): string => {
    return action
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Activity Logs</h2>
          <p className="text-muted-foreground" data-testid="text-page-description">
            Track user actions and system events across your organization
          </p>
        </div>
        <Activity className="h-8 w-8 text-muted-foreground" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>
                View all user activities including logins and resource operations
              </CardDescription>
            </div>
            <div className="w-[200px]">
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger data-testid="select-user-filter">
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {currentUser && (
                    <SelectItem value={currentUser.id}>My Activities</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8" data-testid="loading-activities">
              <p className="text-sm text-muted-foreground">Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12" data-testid="empty-activities">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium">No activity logs found</p>
              <p className="text-sm text-muted-foreground">
                Start using the platform to see activity history
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Resource Name</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.id} data-testid={`row-activity-${activity.id}`}>
                      <TableCell className="font-mono text-xs" data-testid={`text-timestamp-${activity.id}`}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(activity.createdAt), "MMM dd, yyyy HH:mm:ss")}
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-username-${activity.id}`}>
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{activity.username}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionVariant(activity.action)} data-testid={`badge-action-${activity.id}`}>
                          {formatAction(activity.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize" data-testid={`text-resource-type-${activity.id}`}>
                        {activity.resourceType || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-xs" data-testid={`text-resource-name-${activity.id}`}>
                        {activity.resourceName || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-xs" data-testid={`text-ip-${activity.id}`}>
                        <div className="flex items-center gap-2">
                          {activity.ipAddress && <Globe className="h-3 w-3 text-muted-foreground" />}
                          {activity.ipAddress || "-"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">
        Showing {activities.length} {activities.length === 1 ? "activity" : "activities"}
      </div>
    </div>
  );
}
