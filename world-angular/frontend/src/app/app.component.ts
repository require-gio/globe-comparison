import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<app-globe></app-globe>`,
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
