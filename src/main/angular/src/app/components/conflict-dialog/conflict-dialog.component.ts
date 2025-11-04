import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransitionRule } from '../../models/transitionrule.model';

@Component({
  selector: 'app-conflict-dialog',
  imports: [CommonModule],
  templateUrl: './conflict-dialog.component.html',
  styleUrl: './conflict-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConflictDialogComponent {
  @Input() existingRule: TransitionRule | null = null;
  @Input() newRule: TransitionRule | null = null;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  /** 模板里绑定的方法 */
  onConfirm()    { this.confirm.emit(); }
  onCancel()    { this.cancel.emit(); }
}
