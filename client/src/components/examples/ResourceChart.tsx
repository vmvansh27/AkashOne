import { ResourceChart } from '../resource-chart';

const mockData = Array.from({ length: 12 }, (_, i) => ({
  time: `${i * 2}h`,
  value: Math.floor(Math.random() * 40) + 30,
}));

export default function ResourceChartExample() {
  return (
    <ResourceChart
      title="CPU Usage (24h)"
      data={mockData}
      color="hsl(var(--chart-1))"
    />
  );
}
