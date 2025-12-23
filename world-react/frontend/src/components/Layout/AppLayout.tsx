import { Globe } from '../Globe/Globe';
import { FPSMonitor } from '../Performance/FPSMonitor';

function AppLayout() {
  return (
    <div className="w-full h-screen bg-space-950 overflow-hidden">
      <div className="w-full h-full">
        <Globe />
      </div>
      <FPSMonitor />
    </div>
  );
}

export default AppLayout;
