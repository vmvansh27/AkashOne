import { CreateVMDialog } from '../create-vm-dialog';

export default function CreateVMDialogExample() {
  return (
    <CreateVMDialog 
      onCreateVM={(data) => console.log('Creating VM:', data)}
    />
  );
}
