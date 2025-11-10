import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransitionRule } from '../../models/transitionrule.model';

@Component({
  selector: 'app-add-rule',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-rule.component.html',
  styleUrl: './add-rule.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddRuleComponent {
  // 渲染"添加规则"表单、校验输入并提交新规则
  @Input() availableStates: string[] = [];
  @Output() addRule = new EventEmitter<TransitionRule>();
  @Output() addCustomState = new EventEmitter<string>();

  /** 用户在表单中构建的新规则 */
  newRule: Partial<TransitionRule & { customState_c?: string; customState_n?: string}> = {
    currentState: '',
    inputSymbol: '',
    outputSymbol: '',
    moveDirection: 'S',
    nextState: '',
    iswrite: true,
    customState_c: '',
    customState_n: '',
    // writeSymbol: '',
    // direction: 'S'  // 默认不动
  };
  ruleInputError: string = '';

  /** 当点击"添加规则"按钮时调用 */
  onAddRule(): void {
    const {
      currentState,
      inputSymbol,
      nextState,
      moveDirection,
      outputSymbol,
      iswrite,
      customState_c = '',
      customState_n = '',
    } = this.newRule;
    let state_c = this.newRule.currentState ?? '';
    let state_n = this.newRule.nextState ?? '';
    if (state_c === 'other') {
      if (!customState_c?.trim()) {
        this.ruleInputError = '请输入自定义状态名称！';
        return;
      }
      state_c = customState_c.trim();
    }
    if (!state_c) {
      this.ruleInputError = '请选择或输入当前状态！';
      return;
    }

    if (state_n === 'other') {
      if (!customState_n?.trim()) {
        this.ruleInputError = '请输入自定义状态名称！';
        return;
      }
      state_n = customState_n.trim();
    }
    if (!state_n) {
      this.ruleInputError = '请选择或输入当前状态！';
      return;
    }

    // 基本校验
    if (!currentState || !inputSymbol || !nextState || !['L', 'R', 'S'].includes(moveDirection as 'L' | 'R' | 'S')) {
      this.ruleInputError = '请输入完整且正确的规则 (状态和方向必填)';
      return;
    }
    if (iswrite && !['0', '1', ' ', '+', '*'].includes(outputSymbol as string)) {
      this.ruleInputError = '写符号必须是 0、1、+、*或 空格';
      return;
    }
    if (!['0', '1', ' ', '+', '*'].includes(inputSymbol)) {
      this.ruleInputError = '读符号必须是 0、1、+、*或 空格';
      return;
    }

    // 更新outputSymbol和moveDirection以保持兼容
    // 修复：当iswrite为true时，即使outputSymbol为空字符串也应保留它，不替换为inputSymbol
    this.newRule.outputSymbol = iswrite ? outputSymbol : inputSymbol;
    this.newRule.moveDirection = moveDirection as 'L' | 'R' | 'S';

    // 确保输出的rule对象同时包含新旧属性，完全兼容
    const ruleToEmit: TransitionRule = {
      currentState: state_c,
      inputSymbol: inputSymbol,
      outputSymbol: this.newRule.outputSymbol || '',
      moveDirection: this.newRule.moveDirection as 'L' | 'R' | 'S',
      nextState: state_n,
      iswrite: this.newRule.iswrite!
    };

    // 如果使用了自定义状态，通知父组件添加到可用状态列表
    if (this.newRule.currentState === 'other') {
      this.addCustomState.emit(customState_c.trim());
    }
    if (this.newRule.nextState === 'other') {
      this.addCustomState.emit(customState_n.trim());
    }
    
    // 校验通过，发射事件并重置表单
    this.addRule.emit(ruleToEmit);
    this.clearForm();
  }

  /** 清空表单 */
  clearForm(): void {
    this.newRule = {
      currentState: '',
      inputSymbol: '',
      outputSymbol: '',
      moveDirection: 'S',
      nextState: '',
      iswrite: true,
      customState_c: '',
    };
    this.ruleInputError = '';
  }
}
