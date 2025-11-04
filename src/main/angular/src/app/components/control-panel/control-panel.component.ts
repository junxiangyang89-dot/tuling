import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-control-panel',
  imports: [],
  templateUrl: './control-panel.component.html',
  styleUrl: './control-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControlPanelComponent {
  @Input() symbolToWrite: string = '0';
  /** 发射移动和写入事件，真正的逻辑留给容器去做 */
  @Output() moveLeft = new EventEmitter<void>();
  @Output() moveRight = new EventEmitter<void>();
  @Output() writeSymbol = new EventEmitter<string>();

  /** 模板里绑定的方法 */
  onMoveLeft()    { this.moveLeft.emit(); }
  onMoveRight()   { this.moveRight.emit(); }
  onWriteSymbol() { this.writeSymbol.emit(this.symbolToWrite); }
}
