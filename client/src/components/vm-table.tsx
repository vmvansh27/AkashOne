import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge, VMStatus } from "@/components/status-badge";
import { Play, Square, RotateCw, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface VirtualMachine {
  id: string;
  name: string;
  status: VMStatus;
  ip: string;
  template: string;
  cpu: string;
  memory: string;
  zone: string;
}

interface VMTableProps {
  vms: VirtualMachine[];
  onAction?: (action: string, vmId: string) => void;
}

export function VMTable({ vms, onAction }: VMTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Template</TableHead>
            <TableHead>CPU/Memory</TableHead>
            <TableHead>Zone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vms.map((vm) => (
            <TableRow key={vm.id} className="hover-elevate">
              <TableCell className="font-medium" data-testid={`vm-name-${vm.id}`}>{vm.name}</TableCell>
              <TableCell>
                <StatusBadge status={vm.status} />
              </TableCell>
              <TableCell className="font-mono text-sm">{vm.ip}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{vm.template}</TableCell>
              <TableCell className="text-sm">{vm.cpu} / {vm.memory}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{vm.zone}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {vm.status === "stopped" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onAction?.("start", vm.id)}
                      data-testid={`button-start-${vm.id}`}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  {vm.status === "running" && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onAction?.("stop", vm.id)}
                        data-testid={`button-stop-${vm.id}`}
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onAction?.("restart", vm.id)}
                        data-testid={`button-restart-${vm.id}`}
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" data-testid={`button-more-${vm.id}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onAction?.("console", vm.id)}>
                        Open Console
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAction?.("snapshot", vm.id)}>
                        Create Snapshot
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAction?.("migrate", vm.id)}>
                        Migrate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onAction?.("delete", vm.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
