import { StatusBadge } from '../status-badge';

export default function StatusBadgeExample() {
  return (
    <div className="flex gap-2 flex-wrap p-4">
      <StatusBadge status="running" />
      <StatusBadge status="stopped" />
      <StatusBadge status="error" />
      <StatusBadge status="starting" />
    </div>
  );
}
