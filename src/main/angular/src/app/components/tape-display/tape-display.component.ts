import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tape-display',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './tape-display.component.html',
  styleUrls: ['./tape-display.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TapeDisplayComponent {
  contextRadius: number = 8;
  @Input() tape: string[] = [];
  
  /** 当用户点击某个格子时，发出该格子的索引 */
  @Output() cellClick = new EventEmitter<number>();

  onCellClick(idx: number) {
    this.cellClick.emit(idx);
  }
}