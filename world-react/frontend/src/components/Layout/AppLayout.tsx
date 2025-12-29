import { Globe } from '../Globe/Globe';
import { FPSMonitor } from '../Performance/FPSMonitor';

function AppLayout() {
  return (
    <div className="w-full h-screen bg-space-950 overflow-hidden relative">
      {/* Tech name badge */}
      <div className="fixed top-4 left-4 z-10 rounded-lg bg-blue-500/20 border border-blue-400/50 px-3 py-1">
        <span className="text-sm font-semibold text-blue-400">React</span>
      </div>

      <div className="w-full h-full">
        <Globe />
      </div>
      <FPSMonitor />
    </div>
  );
}

export default AppLayout;
