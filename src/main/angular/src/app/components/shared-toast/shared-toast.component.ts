import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';
@Component({
  selector: 'app-shared-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      <div *ngFor="let m of messages" class="toast-item" [ngClass]="m.type">
        {{ m.text }}
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    }
    .toast-item {
      pointer-events: auto;
      background: rgba(0,0,0,0.75);
      color: #fff;
      padding: 10px 14px;
      border-radius: 6px;
      min-width: 220px;
      max-width: 420px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.12);
      font-size: 14px;
    }
    .toast-item.info { background: rgba(0,0,0,0.75); }
    .toast-item.success { background: #2ecc71; }
    .toast-item.warn { background: #f39c12; }
    .toast-item.error { background: #e74c3c; }
  `]
})
export class SharedToastComponent implements OnInit {
  messages: ToastMessage[] = [];

  constructor(private toast: ToastService) {}

  ngOnInit(): void {
    this.toast.messages$.subscribe(m => {
      if (!m) return;
      this.messages.push(m);
      const idx = this.messages.length - 1;
      setTimeout(() => {
        this.messages.splice(idx, 1);
      }, m.duration || 4000);
    });
  }
}
