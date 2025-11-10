import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Tape } from '../../models/tape.model';

@Component({
  selector: 'app-input-handler',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './input-handler.component.html',
  styleUrls: ['./input-handler.component.css']
})
export class InputHandlerComponent {
  userInput: string = '';
  inputError: string = '';

  @Input() currentState: string = 'q0';
  @Input() currentSteps: number = 0;
  @Input() acceptState: string = 'qAccept';
  
  @Output() tapeUpdated = new EventEmitter<Tape>();

  loadUserInput() {
    const trimmed = this.userInput.trim();
    if (/^[01+* ]*$/.test(trimmed)) {
      const newTape = new Tape(' ', trimmed.split(''));
      this.tapeUpdated.emit(newTape);
      this.inputError = '';
    } else {
      this.inputError = '输入无效，请检查输入内容';
    }
  }
} 