import WhiteLabel from '../../pages/whitelabel';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function WhiteLabelExample() {
  return (
    <TooltipProvider>
      <WhiteLabel />
    </TooltipProvider>
  );
}
