import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus, AlertCircle, CheckCircle, Cpu, HardDrive } from "lucide-react";

export default function GPUInstances() {
  const gpuTypes = [
    {
      name: "NVIDIA T4",
      memory: "16 GB GDDR6",
      cores: "2560 CUDA cores",
      performance: "8.1 TFLOPS FP32",
      useCases: ["Machine Learning Training", "Video Encoding", "Graphics Rendering"],
    },
    {
      name: "NVIDIA A100",
      memory: "40 GB HBM2",
      cores: "6912 CUDA cores",
      performance: "19.5 TFLOPS FP32",
      useCases: ["Large Language Models", "Deep Learning", "Scientific Computing"],
    },
    {
      name: "NVIDIA V100",
      memory: "32 GB HBM2",
      cores: "5120 CUDA cores",
      performance: "15.7 TFLOPS FP32",
      useCases: ["AI Research", "Data Analytics", "HPC Workloads"],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-8 w-8" />
            GPU Instances
          </h1>
          <p className="text-muted-foreground mt-1">
            High-performance NVIDIA GPU compute for AI, ML, and rendering workloads
          </p>
        </div>
        <Button data-testid="button-launch-gpu" disabled>
          <Plus className="h-4 w-4 mr-2" />
          Launch GPU Instance
        </Button>
      </div>

      <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100">GPU Hardware and CloudStack Configuration Required</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                This feature requires physical GPU servers in your CloudStack infrastructure. Configure GPU-enabled service offerings and ensure NVIDIA drivers and CUDA toolkit are installed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {gpuTypes.map((gpu) => (
          <Card key={gpu.name} data-testid={`card-gpu-${gpu.name.toLowerCase().replace(/\s/g, '-')}`}>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Zap className="h-8 w-8 text-primary" />
                <Badge variant="secondary" data-testid={`badge-status-${gpu.name.toLowerCase().replace(/\s/g, '-')}`}>
                  Not Available
                </Badge>
              </div>
              <CardTitle>{gpu.name}</CardTitle>
              <CardDescription>Professional GPU for compute workloads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Memory</span>
                  <span className="font-medium">{gpu.memory}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">CUDA Cores</span>
                  <span className="font-medium">{gpu.cores}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Performance</span>
                  <span className="font-medium">{gpu.performance}</span>
                </div>
              </div>

              <div className="pt-3 border-t">
                <p className="text-xs font-medium mb-2">Ideal For:</p>
                <div className="space-y-1">
                  {gpu.useCases.map((useCase) => (
                    <div key={useCase} className="text-xs text-muted-foreground">
                      • {useCase}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                className="w-full"
                variant="outline"
                disabled
                data-testid={`button-configure-${gpu.name.toLowerCase().replace(/\s/g, '-')}`}
              >
                Launch with {gpu.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Pre-installed Software
            </CardTitle>
            <CardDescription>GPU instances come with essential tools pre-configured</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>NVIDIA GPU drivers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>CUDA Toolkit and cuDNN</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Docker with NVIDIA Container Runtime</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>PyTorch, TensorFlow, and JAX</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Jupyter Notebook environment</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Implementation Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Frontend GPU management UI ready</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Physical GPU servers required in datacenter</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>CloudStack GPU-enabled service offerings setup</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>GPU driver and CUDA toolkit configuration</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>VM templates with ML frameworks preparation</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
