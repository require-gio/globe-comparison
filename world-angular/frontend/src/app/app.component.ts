import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <!-- Tech name badge -->
    <div class="fixed top-4 left-4 z-10 rounded-lg bg-red-500/20 border border-red-400/50 px-3 py-1">
      <span class="text-sm font-semibold text-red-400">Angular</span>
    </div>
    <app-globe></app-globe>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100vh;
      }
    `,
  ],
  standalone: false
})
export class AppComponent {
  title = '3D Interactive Globe';
}
