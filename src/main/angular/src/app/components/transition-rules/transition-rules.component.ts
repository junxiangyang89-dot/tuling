import {Component, Input, ChangeDetectionStrategy, EventEmitter, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransitionRule } from '../../models/transitionrule.model';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-transition-rules',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transition-rules.component.html',
  styleUrls: ['./transition-rules.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransitionRulesComponent {
  @Input() rulename: string = "";
  @Input() rules: TransitionRule[] = [];
  @Input() ruleNames: string[] = [];
  @Input() currentMode: string = "";

  @Output() clearRulesClicked = new EventEmitter<void>();
  @Output() saveRulesClicked = new EventEmitter<void>();
  @Output() newRuleCreated = new EventEmitter<string>();
  @Output() loadRulesRequested = new EventEmitter<string>();
  @Output() deleteRuleClicked = new EventEmitter<number>();
  @Output() deleteSampleRulesClicked = new EventEmitter<void>();
  @Output() clearAllRulesClicked = new EventEmitter<void>();

  onSelectRule(name: string) {
    this.loadRulesRequested.emit(name);
  }

  clearRules() {
    console.log('触发清空');
    const choice = confirm('是否清除该规则');
    if (choice){
      this.clearRulesClicked.emit();
    }
  }

  saveRulesToDB() {
    if (this.rulename && !this.ruleNames.includes(this.rulename)) {
      this.ruleNames.push(this.rulename);
      console.log(`添加新规则名 '${this.rulename}' 到下拉框`);
    }
    this.saveRulesClicked.emit();
  }

  showNewRulePrompt() {
    const name = prompt('请输入新规则的名称');
    if (!name) {
      return; // 用户取消或输入为空
    }
    
    // 检查名称是否已存在
    if (this.ruleNames.includes(name)) {
      // 如果规则已存在，询问用户是否覆盖现有规则
      const confirmOverwrite = confirm(`规则"${name}"已存在。是否覆盖现有规则？`);
      if (!confirmOverwrite) {
        return; // 用户选择不覆盖
      }
      console.log(`用户确认覆盖现有规则：${name}`);
    }
    
    // 发送事件给父组件
    this.newRuleCreated.emit(name);
  }
  
  // 删除单条规则
  deleteRule(index: number) {
    // 直接删除，不显示确认框
    this.deleteRuleClicked.emit(index);
  }
  
  // 删除Sample规则
  deleteSampleRules() {
    this.deleteSampleRulesClicked.emit();
  }
  
  // 清空所有规则
  clearAllRules() {
    this.clearAllRulesClicked.emit();
  }
}
