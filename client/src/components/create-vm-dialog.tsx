import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface CreateVMDialogProps {
  onCreateVM?: (data: any) => void;
}

export function CreateVMDialog({ onCreateVM }: CreateVMDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    template: "",
    zone: "",
    serviceOffering: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating VM:", formData);
    onCreateVM?.(formData);
    setOpen(false);
    setFormData({ name: "", template: "", zone: "", serviceOffering: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-vm">
          <Plus className="h-4 w-4 mr-2" />
          Create VM
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Virtual Machine</DialogTitle>
            <DialogDescription>
              Deploy a new virtual machine instance from a template.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="vm-name">VM Name</Label>
              <Input
                id="vm-name"
                placeholder="my-webserver-01"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-vm-name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template">Template</Label>
              <Select
                value={formData.template}
                onValueChange={(value) => setFormData({ ...formData, template: value })}
                required
              >
                <SelectTrigger id="template" data-testid="select-template">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ubuntu-22.04">Ubuntu 22.04 LTS</SelectItem>
                  <SelectItem value="centos-8">CentOS 8</SelectItem>
                  <SelectItem value="debian-11">Debian 11</SelectItem>
                  <SelectItem value="windows-2022">Windows Server 2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service-offering">Service Offering</Label>
              <Select
                value={formData.serviceOffering}
                onValueChange={(value) => setFormData({ ...formData, serviceOffering: value })}
                required
              >
                <SelectTrigger id="service-offering" data-testid="select-service-offering">
                  <SelectValue placeholder="Select compute resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (1 vCPU, 2GB RAM)</SelectItem>
                  <SelectItem value="medium">Medium (2 vCPU, 4GB RAM)</SelectItem>
                  <SelectItem value="large">Large (4 vCPU, 8GB RAM)</SelectItem>
                  <SelectItem value="xlarge">X-Large (8 vCPU, 16GB RAM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="zone">Zone</Label>
              <Select
                value={formData.zone}
                onValueChange={(value) => setFormData({ ...formData, zone: value })}
                required
              >
                <SelectTrigger id="zone" data-testid="select-zone">
                  <SelectValue placeholder="Select availability zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zone-1">Zone 1 (US-East)</SelectItem>
                  <SelectItem value="zone-2">Zone 2 (US-West)</SelectItem>
                  <SelectItem value="zone-3">Zone 3 (EU-Central)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" data-testid="button-submit-vm">Create VM</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
