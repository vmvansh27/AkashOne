import Login from '../../pages/login';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function LoginExample() {
  return (
    <TooltipProvider>
      <Login />
    </TooltipProvider>
  );
}
