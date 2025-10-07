import { MetricCard } from '../metric-card';
import { Server } from 'lucide-react';

export default function MetricCardExample() {
  return (
    <MetricCard
      title="Virtual Machines"
      value="24"
      icon={Server}
      trend="+3 from last week"
      trendUp={true}
    />
  );
}
