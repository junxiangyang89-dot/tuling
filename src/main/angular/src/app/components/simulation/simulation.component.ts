import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simulation',
  imports: [CommonModule],
  templateUrl: './simulation.component.html',
  styleUrl: './simulation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimulationComponent {
  @Input() isRunning: boolean = false;
  @Output() start = new EventEmitter<void>();
  @Output() pause = new EventEmitter<void>();
  @Output() step = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  /** 模板里绑定的方法 */
  onStart()    { this.start.emit(); }
  onPause()    { this.pause.emit(); }
  onStep()     { this.step.emit(); }
  onReset()    { this.reset.emit(); }
}
