import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  text: string;
  type?: 'info' | 'success' | 'warn' | 'error';
  duration?: number; // ms
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private subject = new Subject<ToastMessage>();
  public messages$ = this.subject.asObservable();

  show(message: string, type: ToastMessage['type'] = 'info', duration = 4000) {
    this.subject.next({ text: message, type, duration });
  }
}
