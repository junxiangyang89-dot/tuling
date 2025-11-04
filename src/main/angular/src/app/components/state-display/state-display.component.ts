import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-state-display',
  standalone: true,
  templateUrl: './state-display.component.html',
  styleUrls: ['./state-display.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StateDisplayComponent {
  @Input() currentState: string = '';
  @Input() acceptState: string = '';
  @Input() currentSteps: number = 0;
}