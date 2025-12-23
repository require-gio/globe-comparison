class PerformanceMonitor {
  private frames: number = 0;
  private lastTime: number = performance.now();
  private fps: number = 0;
  private isRunning: boolean = false;
  private rafId: number | null = null;
  private callback: ((fps: number) => void) | null = null;
  
  start(callback: (fps: number) => void) {
    this.callback = callback;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.frames = 0;
    this.loop();
  }
  
  stop() {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  private loop = () => {
    if (!this.isRunning) return;
    
    this.frames++;
    const now = performance.now();
    const elapsed = now - this.lastTime;
    
    // Update FPS every second
    if (elapsed >= 1000) {
      this.fps = Math.round((this.frames * 1000) / elapsed);
      this.frames = 0;
      this.lastTime = now;
      
      if (this.callback) {
        this.callback(this.fps);
      }
    }
    
    this.rafId = requestAnimationFrame(this.loop);
  };
  
  getFPS(): number {
    return this.fps;
  }
}

export const performanceMonitor = new PerformanceMonitor();
