import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tape } from '../../models/tape.model';
import { TransitionRule } from '../../models/transitionrule.model';
import { SAMPLE_RULES, BinaryIncrement, EvenorOddCheck, BinaryPalindrome, BinaryMultiply, DivisableBy3 } from '../../data/learning';
import { HttpClientModule } from '@angular/common/http';

import { TapeDisplayComponent } from '../tape-display/tape-display.component';
import { ControlPanelComponent } from '../control-panel/control-panel.component';
import { SimulationComponent } from '../simulation/simulation.component';
import { StateDisplayComponent } from '../state-display/state-display.component';
import { TransitionRulesComponent } from '../transition-rules/transition-rules.component';
import { AddRuleComponent } from '../add-rule/add-rule.component';
import { ConflictDialogComponent } from '../conflict-dialog/conflict-dialog.component';
import { InputHandlerComponent } from '../input-handler/input-handler.component';
import { IndexedDBService } from '../../service/indexeddb.service';
import { TuringMachineService, TuringMachineInfo } from '../../services/turing-machine.service';
import { ChatRoomComponent } from '../chat-room/chat-room.component';
import { StateEditorComponent } from '../state-editor/state-editor.component';
import { ChatAssistantComponent } from '../chat-assistant/chat-assistant.component';
import { ViewChild } from '@angular/core';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-turing-machine',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    TapeDisplayComponent,
    ControlPanelComponent,
    SimulationComponent,
    // StateDisplayComponent,
    TransitionRulesComponent,
    AddRuleComponent,
    ConflictDialogComponent,
    InputHandlerComponent,
    ChatRoomComponent,
    StateEditorComponent,
    ChatAssistantComponent
  ],
  templateUrl: './turing-machine.component.html',
  styleUrls: ['./turing-machine.component.css']
})
export class TuringMachineComponent implements OnInit {
  // 纸带模型及可视窗口
  tape: Tape = new Tape(' ', ['1', '1', '1', '1']);
  visible: string[] = [];
  contextRadius: number = 8;

  // 写入符号
  symbolToWrite: string = '0';

  // 模拟状态
  isRunning: boolean = false;
  currentState: string = 'q0';
  steps: number = 0;
  private intervalId: any;

  // 本地规则管理
  rulename: string = '';
  allRuleNames: string[] = [];

  // 状态机转移规则
  transitionRules: TransitionRule[] = [];
  availableStates: string[] = ['q0', 'q1', 'q2', 'qAccept'];  // 其他, 'other'

  // 冲突检测相关
  showConflictDialog: boolean = false;
  conflictingRule: TransitionRule | null = null;
  pendingRule: TransitionRule | null = null;
  username: string = "";

  // 图灵机管理
  currentMachineId: number | null = null;
  hasMachine: boolean = false;
  machine: any = null;

  testCases:any = null;
  showTestDialog:boolean = false;
  challengeDescription:string = "";

  // 图灵机管理器功能
  machines: TuringMachineInfo[] = [];
  showSidebar: boolean = false;
  showCreateForm: boolean = false;
  debugInfo: string = '等待加载...';
  newMachine = {
    name: '',
    description: '',
    configuration: {
      initialState: 'q0',
      acceptingStates: ['qAccept'],
      tape: '',
      rules: []
    }
  };
  currentMode = "free-mode"
  // 状态编辑器相关
  showStateEditor = false;
  @ViewChild(StateEditorComponent) stateEditor!: StateEditorComponent;

  constructor(
    private db: IndexedDBService,
    private route: ActivatedRoute,
    private router: Router,
    private turingService: TuringMachineService
  ) {}

  async ngOnInit() {
    // 从本地存储获取用户信息
    this.getUserInfoFromStorage();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this.allRuleNames = [];
        console.log("current mode " + this.currentMode);
        if (this.currentMode == "learning-mode"){
          this.rulename = 'SampleMachine';
        }
        this.loadAllRuleNames();
        this.loadRules();
      });


    await this.ensureSampleRulesExist();
    await this.loadAllRuleNames();
    await this.loadRules();
    this.refreshView();

    // 加载图灵机列表
    this.loadMachines();
    this.updateStateEditor();

    // 监听当前选中的图灵机变化
    this.turingService.currentMachineId$.subscribe(id => {
      if (id) {
        this.currentMachineId = id;
        this.hasMachine = true;
        this.loadMachineData(id);
      }
    });
  }

  // 从本地存储中获取用户信息
  private getUserInfoFromStorage() {
    // 先尝试从currentUserInfo获取
    const currentUserInfo = sessionStorage.getItem('currentUserInfo');
    if (currentUserInfo) {
      try {
        const userInfo = JSON.parse(currentUserInfo);
        if (userInfo.username) {
          this.username = userInfo.username;
          console.log('从currentUserInfo获取的用户名:', this.username);
          return;
        }
      } catch (e) {
        console.error('解析currentUserInfo失败', e);
      }
    }

    // 如果没有找到，尝试从JWT令牌解析
    this.getUserInfoFromToken();
  }

  // 从JWT令牌中解析用户信息
  private getUserInfoFromToken() {
    try {
      // 先尝试从currentUserInfo获取token
      let token = null;
      const currentUserInfo = sessionStorage.getItem('currentUserInfo');
      if (currentUserInfo) {
        try {
          const userInfo = JSON.parse(currentUserInfo);
          token = userInfo.token;
        } catch (e) {
          console.error('解析currentUserInfo失败', e);
        }
      }

      if (token) {
        // 解析JWT令牌
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));

        // JWT令牌中通常使用sub字段存储用户名
        if (decodedPayload && decodedPayload.sub) {
          this.username = decodedPayload.sub;
          console.log('从JWT解析的用户名:', this.username);
          return;
        }
      }
    } catch (e) {
      console.error('解析JWT令牌失败', e);
    }

    // 如果仍然没有用户名，设置一个默认值
    if (!this.username) {
      this.username = '访客' + Math.floor(Math.random() * 1000);
      console.log('使用默认用户名:', this.username);
    }
  }

  private async ensureSampleRulesExist(): Promise<void> {
    const rulePairs: [string, typeof SAMPLE_RULES][] = [
      ['SampleMachine', SAMPLE_RULES],
      ['BinaryIncrement', BinaryIncrement],
      ['EvenorOddCheck', EvenorOddCheck],
      ['BinaryPalindrome', BinaryPalindrome],
      ['BinaryMultiply', BinaryMultiply],
      ['DivisableBy3', DivisableBy3]
    ];
    for (const [name, rules] of rulePairs) {
      const existing = await this.db.getRulesByMachineName(name);
      if (!existing || existing.length === 0) {
        await this.db.addTransitionRules(name, rules);
        console.log(`初次写入 ${name} 到 IndexedDB`);
      } else {
        console.log(`${name} 已存在，跳过初始写入`);
      }
    }
  }

  async loadRules() {
    const rules = await this.db.getRulesByMachineName(this.rulename);
    this.transitionRules = rules ?? [];
  }

  async loadAllRuleNames() {
    try {
      const all = await this.db.getAllTransitionRules();
      const excludeNames = ['BinaryIncrement', 'EvenorOddCheck','BinaryPalindrome','BinaryMultiplication','BinaryMultiply','DivisableBy3']; // 要排除的规则名

      if (this.currentMode === 'learning-mode') {
        console.log("learning-mode rules");
        this.allRuleNames = all
          .filter(entry => excludeNames.includes(entry.machineName))
          .map(entry => entry.machineName);
      } else {
        console.log("other-mode rules");
        this.allRuleNames = all
          .filter(entry => !excludeNames.includes(entry.machineName))
          .map(entry => entry.machineName);
      }

      console.log('Loaded rule names:', this.allRuleNames);
    } catch (error) {
      console.error('Failed to load rule names from DB:', error);
    }
  }

  /** 可视窗口刷新 */
  private refreshView(): void {
    this.visible = Array.from(
      { length: 2 * this.contextRadius + 1 },
      (_, i) => this.tape.readOffset(i - this.contextRadius)
    );
  }

  /** 处理子组件事件 */
  onMove(direction: 'L' | 'R'): void {
    direction === 'L' ? this.tape.headLeft() : this.tape.headRight();
    this.refreshView();

    // 如果有选中的图灵机，同步状态到服务器
    if (this.hasMachine) {
      this.syncMachineState();
    }
  }

  moveRight(): void {
    this.tape.headRight();
    this.refreshView();
  }

  moveLeft(): void {
    this.tape.headLeft();
    this.refreshView();
  }

  onCellClick(offsetIdx: number): void {
    // 点击格子将头移至该位置
    const moveSteps = offsetIdx - this.contextRadius;
    this.tape.moveHeadBy(moveSteps);

    // 弹窗让用户输入新符号，默认是当前位置的旧符号
    const oldSym = this.tape.read();
    const newSym = window.prompt(
      '请输入单个符号（0、1、+、*或 空格）：',
      oldSym === ' ' ? '' : oldSym
    );

    // 校验并写入
    if (newSym !== null) {
      const sym = newSym === '' ? ' ' : newSym;
      if (['0', '1', ' ', '+', '*'].includes(sym)) {
        this.tape.write(sym);
      } else {
        window.alert('无效符号，仅支持 0、1、+、*或留空（空格）');
      }
    }
    this.refreshView();

    // 同步状态
    if (this.hasMachine) {
      this.syncMachineState();
    }
  }

  onWriteSymbol(symbol: string): void {
    if (['0', '1'].includes(symbol)) {
      this.tape.write(symbol);
      this.refreshView();

      // 同步状态
      if (this.hasMachine) {
        this.syncMachineState();
      }
    }
  }

  onStart(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.intervalId = setInterval(() => this.onStep(), 1000);
    }
  }

  onPause(): void {
    if (this.isRunning) {
      this.isRunning = false;
      clearInterval(this.intervalId);
    }
  }

  onReset(): void {
    this.onPause();
    this.steps = 0;
    this.currentState = 'q0';

    // 重置纸带到初始状态
    if (this.machine?.configuration?.tape) {
      const tapeContent = this.machine.configuration.tape.split('');
      this.tape = new Tape(' ', tapeContent);
    } else if (this.machine?.tape) {
      const tapeContent = this.machine.tape.split('');
      this.tape = new Tape(' ', tapeContent);
    } else {
      // 默认示例纸带
      this.tape = new Tape(' ', ['1', '1', '1', '1']);
    }

    this.refreshView();

    // 同步状态
    if (this.hasMachine) {
      this.syncMachineState();
    }
  }

  quiteonStep(): void {
    // 查找与当前状态和读到的符号匹配的规则
    const symbolRead = this.tape.read();
    console.log("read:  " + symbolRead)
    const matchingRule = this.transitionRules.find(
      rule => rule.currentState === this.currentState && rule.inputSymbol === symbolRead
    );
    console.log(matchingRule);
    if (matchingRule) {

      // 应用规则：写入符号
      if(matchingRule.iswrite){
        this.tape.write(matchingRule.outputSymbol);
        console.log("writing")
      }

      // 获取移动方向（优先使用moveDirection，向后兼容direction）
      const moveDirection = matchingRule.moveDirection;// || matchingRule.direction

      // 移动读写头
      if (moveDirection === 'L') {
        this.tape.headLeft();
      } else if (moveDirection === 'R') {
        this.tape.headRight();
      } else if (moveDirection === 'S') {
        // 'S' 表示Stay，保持不动，不需要移动读写头
        console.log('保持读写头位置不变 (S)');
      }

      // 状态转换
      this.currentState = matchingRule.nextState;
      this.steps++;

      // 更新视图
      this.refreshView();

      // 同步状态
      if (this.hasMachine) {
        this.syncMachineState();
      }

      // 如果达到了接受状态，停止执行
      if (this.currentState === 'qAccept') {
        this.onPause();
      }
    } else {
      this.onPause();
    }
  }

  onStep(): void {
    // 查找与当前状态和读到的符号匹配的规则
    const symbolRead = this.tape.read();
    const matchingRule = this.transitionRules.find(
      rule => rule.currentState === this.currentState && rule.inputSymbol === symbolRead
    );

    if (matchingRule) {

      // 应用规则：写入符号
      if(matchingRule.iswrite){
        this.tape.write(matchingRule.outputSymbol);
      }

      // 获取移动方向（优先使用moveDirection，向后兼容direction）
      const moveDirection = matchingRule.moveDirection;// || matchingRule.direction

      // 移动读写头
      if (moveDirection === 'L') {
        this.tape.headLeft();
      } else if (moveDirection === 'R') {
        this.tape.headRight();
      } else if (moveDirection === 'S') {
        // 'S' 表示Stay，保持不动，不需要移动读写头
        console.log('保持读写头位置不变 (S)');
      }

      // 状态转换
      this.currentState = matchingRule.nextState;
      this.steps++;

      // 更新视图
      this.refreshView();

      // 同步状态
      if (this.hasMachine) {
        this.syncMachineState();
      }

      // 如果达到了接受状态，停止执行
      if (this.currentState === 'qAccept') {
        this.onPause();
        setTimeout(() => {
          window.alert('图灵机已达到接受状态！');
        }, 100);
      }
    } else {
      this.onPause();
      setTimeout(() => {
        window.alert(`没有匹配的规则 - 当前状态:${this.currentState}, 输入符号:"${symbolRead}"`);
      }, 100);
    }
  }

  onAddRule(newRule: TransitionRule): void {
    // 检查冲突：同一状态和输入符号只能有一个规则
    const conflictingRule = this.checkRuleConflict(newRule);
    const sameRule = this.checkRuleSame(newRule);
    if (sameRule) {
      window.alert('该规则已存在，不需要重复添加');
      return;
    }
    if (conflictingRule) {
      this.conflictingRule = conflictingRule;
      this.pendingRule = newRule;
      this.showConflictDialog = true;
    } else {
      this.transitionRules.push(newRule);
      // 同步到服务器
      this.saveRulesFromChild();
    }
  }

  private checkRuleConflict(r: TransitionRule): TransitionRule | null {
    return this.transitionRules.find(
      existingRule =>
        existingRule.currentState === r.currentState &&
        existingRule.inputSymbol === r.inputSymbol &&
        (existingRule.outputSymbol !== r.outputSymbol ||
          (existingRule.moveDirection) !== (r.moveDirection) ||
          existingRule.nextState !== r.nextState)
    ) || null;
  }

  private checkRuleSame(r: TransitionRule): TransitionRule | null {
    return this.transitionRules.find(
      existingRule =>
        existingRule.currentState === r.currentState &&
        existingRule.inputSymbol === r.inputSymbol &&
        existingRule.outputSymbol === r.outputSymbol &&
        (existingRule.moveDirection) === (r.moveDirection) &&
        existingRule.nextState === r.nextState
    ) || null;
  }

  confirmOverride(): void {
    if (this.pendingRule && this.conflictingRule) {
      const index = this.transitionRules.indexOf(this.conflictingRule);
      if (index !== -1) {
        this.transitionRules[index] = this.pendingRule;
      }
    }
    this.closeConflictDialog();
  }

  cancelOverride(): void {
    this.closeConflictDialog();
  }

  private closeConflictDialog(): void {
    this.showConflictDialog = false;
    this.conflictingRule = null;
    this.pendingRule = null;
  }

  toggleTestDialog() {
    this.showTestDialog = !this.showTestDialog;
  }

  runTest(test: any) {
    const output = this.simulateTuringMachine(test.input); 
    if (output.endsWith(' ')) {
      test.userOutput = output.slice(0, -1);
    } else{
      test.userOutput = output;
    }
    console.log('用户输出:', JSON.stringify(test.userOutput));
    console.log('期望输出:', JSON.stringify(test.expected));
    test.userOutput = test.userOutput.replace(/ /g,'␣');
    test.expected = test.expected.replace(/ /g,'␣');
    test.evaluation = (test.userOutput === test.expected);
  }

  simulateTuringMachine(input: string): string{
    this.onReset();
    const tapeContent = input.split('');
    this.tape = new Tape(' ', tapeContent);
    const MAX_STEPS = 100;
    let simulatestep = 0;
    while (this.currentState !== 'qAccept' && simulatestep < MAX_STEPS) {
      this.quiteonStep();
      simulatestep += 1;
    }
    return this.tape.getContent().join('');
  }

  // 图灵机管理器相关方法

  loadMachines(): void {
    this.currentMode = this.turingService.getCurrentMode();
    console.log(`开始加载${this.currentMode}模式下的图灵机列表...`);
    this.debugInfo = `正在加载${this.currentMode}模式图灵机列表...`;

    this.turingService.getMachinesByMode(this.currentMode).subscribe({
      next: (data) => {
        console.log(`成功获取${this.currentMode}模式下的图灵机列表:`, data);

        try {
          // 确保data是数组
          if (Array.isArray(data)) {
            this.machines = data;
            this.debugInfo = `加载了 ${data.length} 台${this.currentMode}模式的图灵机`;
          } else {
            console.error('服务器返回的data不是数组:', data);
            this.debugInfo = '错误: 服务器返回的数据格式不正确';
            this.machines = [];
          }
          this.loadAllRuleNames().then(() => {
            this.loadRules();
          });
        } catch (error) {
          console.error('处理图灵机列表数据时出错:', error);
          this.debugInfo = `错误: ${error instanceof Error ? error.message : '未知错误'}`;
          this.machines = [];
        }

        // 确保视图更新
        setTimeout(() => {
          console.log(`当前${this.currentMode}模式下图灵机列表包含`, this.machines.length, '个项目');
          if (this.machines.length === 0) {
            console.log('图灵机列表为空，可能是数据格式问题');
            // 记录列表为空的原因
            this.debugInfo += ' | 列表为空，检查是否存在过滤问题';
          } else {
            console.log('图灵机列表第一项:', this.machines[0]);
          }
        }, 0);
      },
      error: (error) => {
        console.error(`获取${this.currentMode}模式下的图灵机列表失败:`, error);
        this.debugInfo = `获取失败: ${error instanceof Error ? error.message : '未知错误'}`;
        this.machines = [];
      }
    });
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      // 重置表单
      this.newMachine = {
        name: '',
        description: '',
        configuration: {
          initialState: 'q0',
          acceptingStates: ['qAccept'],
          tape: '',
          rules: []
        }
      };
    }
  }

  createMachine(): void {
    if (!this.newMachine.name) {
      alert('请输入图灵机名称');
      return;
    }

    // 获取当前用户名
    const username = this.turingService.getCurrentUsername();
    if (!username) {
      console.error('未能获取当前用户名，请确保已登录');
      alert('创建失败：未能获取用户信息，请重新登录');
      return;
    }

    // 添加当前用户的信息到机器配置
    const configuration = {
      ...this.newMachine,
      username: username
    };

    console.log('准备创建的图灵机配置:', configuration);

    this.turingService.createMachine(configuration).subscribe({
      next: (response) => {
        console.log('创建成功，服务器响应:', response);

        // 先关闭创建表单
        this.toggleCreateForm();

        if (!response || !response.data) {
          console.error('创建成功但返回数据格式不正确');
          alert('创建成功，但返回数据异常');
          // 无论如何重新加载列表
          this.loadMachines();
          return;
        }

        // 获取新创建的图灵机ID
        const newMachineId = parseInt(response.data.toString());
        if (isNaN(newMachineId)) {
          console.error('无法解析图灵机ID:', response.data);
          alert('创建成功，但无法获取新图灵机ID');
          this.loadMachines();
          return;
        }

        console.log('新创建的图灵机ID:', newMachineId);

        // 重新加载列表
        this.loadMachines();

        // 延迟一下再加载图灵机数据，确保列表已更新
        setTimeout(() => {
          // 设置当前图灵机ID
          this.currentMachineId = newMachineId;
          this.hasMachine = true;
          this.turingService.setCurrentMachine(newMachineId);

          // 加载图灵机数据
          this.loadMachineData(newMachineId);

          // 再次延迟刷新列表，确保后端数据已经完全准备好
          setTimeout(() => {
            console.log('再次刷新图灵机列表，确保显示最新数据');
            this.loadMachines();
          }, 1000);
        }, 100);
      },
      error: (error) => {
        console.error('创建图灵机失败:', error);

        if (error.status === 401) {
          alert('创建失败：认证失败，请重新登录');
        } else if (error.status === 400) {
          alert('创建失败：请求格式错误，请检查输入');
        } else {
          alert('创建失败：' + (error.error?.message || '未知错误'));
        }
      }
    });
  }

  selectMachine(machine: TuringMachineInfo): void {
    console.log('选择图灵机:', machine);
    this.turingService.setCurrentMachine(machine.id);
    this.currentMachineId = machine.id;
    this.hasMachine = true;
    this.loadMachineData(machine.id);
    this.showSidebar = false; // 选择后关闭侧边栏
  }

  deleteMachine(machineId: number): void {
    if (!confirm('确定要删除该图灵机吗？')) return;
    this.turingService.deleteMachine(machineId).subscribe({
      next: (res: any) => {
        alert('删除成功');
        this.loadMachines(); // 重新加载列表

        // 如果删除的是当前选中的图灵机，重置状态
        if (this.currentMachineId === machineId) {
          this.hasMachine = false;
          this.currentMachineId = null;
          this.machine = null;
          this.resetToDefault();
        }
      },
      error: (err: any) => {
        alert('删除失败');
        console.error(err);
      }
    });
  }

  private getTapeContent(): string {
    return this.tape.getContent().join('');
  }

  private syncMachineState(): void {
    if (!this.currentMachineId) {
      console.log('没有当前图灵机ID，无法同步状态');
      return;
    }

    const tapeContent = this.getTapeContent();
    const state = {
      currentState: this.currentState,
      tape: tapeContent,
      headPosition: this.tape.getHeadPosition(),
      steps: this.steps,
      rules: this.transitionRules,
      isCompleted: this.currentState === 'qAccept',
      configuration: {
        ...this.machine?.configuration,
        tape: tapeContent
      }
    };

    console.log('准备同步的图灵机状态:', state);
    console.log('当前图灵机ID:', this.currentMachineId);
    console.log('当前模式:', this.turingService.getCurrentMode());

    this.turingService.updateState(this.currentMachineId, state).subscribe({
      next: (response) => {
        console.log('图灵机状态已同步，服务器响应:', response);
      },
      error: (error) => {
        console.error('同步图灵机状态失败:', error);
        if (error.status === 401) {
          console.error('认证失败，可能需要重新登录');
        } else if (error.status === 400) {
          console.error('请求格式错误:', error.error);
        }
      }
    });
  }

  loadMachineData(machineId: number): void {
    console.log(`开始加载图灵机 ID:${machineId} 的数据`);

    this.turingService.getMachine(machineId).subscribe({
      next: (response) => {
        console.log('服务器响应:', response);

        if (!response || !response.data) {
          console.error('服务器返回的数据格式不正确或为空');
          this.hasMachine = false;
          return;
        }

        const machineData = response.data;
        if (machineData) {
          this.machine = machineData;
          console.log(`machineData: ${JSON.stringify(machineData)}`);

          this.hasMachine = true;

          // 设置当前图灵机ID
          this.currentMachineId = machineId;

          // 初始化纸带 - 从configuration中读取tape数据
          const tapeData = machineData.configuration?.tape || machineData.tape;

          if (tapeData) {
            console.log('加载纸带:', tapeData);
            const tapeContent = tapeData.split('');
            this.tape = new Tape(' ', tapeContent);
            if (machineData.headPosition !== undefined && machineData.headPosition !== null) {
              console.log('设置读写头位置:', machineData.headPosition);
              this.tape.setHeadPosition(machineData.headPosition);
            }
          } else {
            console.log('无纸带数据，使用默认值');
            this.tape = new Tape(' ', ['1', '1', '1', '1']);
          }

          // 加载规则
          if (machineData.rules && machineData.rules.length > 0) {
            console.log(`加载 ${machineData.rules.length} 条规则`);
            this.transitionRules = machineData.rules;
          } else {
            console.log('无规则数据，使用本地规则');
            this.loadRules(); // 加载本地规则
          }

          // 设置状态
          if (machineData.currentState) {
            console.log('设置当前状态:', machineData.currentState);
            this.currentState = machineData.currentState;
          } else {
            this.currentState = 'q0';
          }

          // 设置步数
          if (machineData.steps !== undefined && machineData.steps !== null) {
            console.log('设置步数:', machineData.steps);
            this.steps = machineData.steps;
          } else {
            this.steps = 0;
          }

          if (machineData.testcase) {
            console.log('加载案例');

            this.testCases = machineData.testcase.map((val: any, index: number) => ({
              title: `测试用例 ${index + 1}`,
              description:val.description,
              input: val.input,
              expected: val.answer,
              userOutput: '',
              evaluation: null
            }));

          } else {
            console.log('没有案例');
            this.testCases = [];
          }


          this.refreshView();
        }
      },
      error: (error) => {
        console.error('加载图灵机数据失败:', error);
        if (error.status === 401) {
          console.error('认证失败，可能需要重新登录');
        } else if (error.status === 404) {
          console.error('找不到请求的图灵机，可能已被删除');
        }
        this.hasMachine = false;
      }
    });
  }

  resetToDefault(): void {
    // 重置到默认状态
    this.tape = new Tape(' ', ['1', '1', '1', '1']);
    this.currentState = 'q0';
    this.steps = 0;
    this.transitionRules = [];
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.loadRules(); // 加载示例规则
    this.refreshView();
  }

  async clearRulesFromChild() {
    try {
      await this.db.clearTransitionRules(this.rulename);
      this.transitionRules = [];
      console.log('规则已清除：', this.rulename);

      // 同步到服务器
      if (this.hasMachine && this.currentMachineId) {
        const state = {
          rules: []
        };
        this.turingService.updateState(this.currentMachineId, state).subscribe({
          next: (response) => {
            console.log('已将空规则集同步到服务器');
          },
          error: (error) => {
            console.error('同步失败:', error);
          }
        });
      }
    } catch (error) {
      console.error('清除规则失败：', error);
    }
  }

  async saveRulesFromChild() {
    try {
      // 不需要先清除规则，addTransitionRules方法现在会自动处理同名规则集
      // 保存当前规则集
      await this.db.addTransitionRules(this.rulename, this.transitionRules);
      console.log(`已保存 ${this.transitionRules.length} 条规则到 "${this.rulename}"`);

      // 同步到服务器
      if (this.hasMachine && this.currentMachineId) {
        const state = {
          rules: this.transitionRules
        };
        this.turingService.updateState(this.currentMachineId, state).subscribe({
          next: (response) => {
            console.log('已同步规则到服务器');
          },
          error: (error) => {
            console.error('同步失败:', error);
          }
        });
      }
    } catch (error) {
      console.error('保存规则失败：', error);
    }
  }

  async onNewRuleCreated(name: string) {
    // 机器名称为空则返回
    if (!name) return;

    // 检查是否已经存在同名规则集
    const exists = await this.db.checkMachineNameExists(name);

    // 保存当前规则集到新名称
    try {
      // 如果已存在同名规则集，我们已经在IndexedDBService中处理了删除操作
      if (exists) {
        console.log(`规则集"${name}"已存在，将被覆盖`);
      }

      await this.db.addTransitionRules(name, this.transitionRules);
      console.log(`已保存规则集 "${name}"`);
      this.rulename = name;
      await this.loadAllRuleNames();
    } catch (error) {
      console.error('创建新规则集失败：', error);
    }
  }

  async loadRulesFromDB(name: string): Promise<void> {
    try {
      const rules = await this.db.getRulesByMachineName(name);
      if (rules && rules.length > 0) {
        this.transitionRules = rules;
        this.rulename = name;
        console.log(`已加载 ${rules.length} 条规则从 "${name}"`);

        // 同步到服务器
        if (this.hasMachine && this.currentMachineId) {
          const state = { rules: this.transitionRules };
          this.turingService.updateState(this.currentMachineId, state).subscribe();
        }
      } else {
        console.warn(`未找到规则集 "${name}" 或为空`);
      }
    } catch (error) {
      console.error(`加载规则集 "${name}" 失败:`, error);
    }
  }

  onTapeUpdated(newTape: Tape): void {
    this.tape = newTape;
    this.refreshView();

    // 同步到服务器
    if (this.hasMachine) {
      this.syncMachineState();
    }
  }

  // 导航到欢迎界面
  navigateToWelcome(): void {
    this.router.navigate(['/welcome']);
  }
  
  navigateToHelp(): void {
    window.open('https://ycnic6uum7sg.feishu.cn/wiki/NfScwvBLmivPbykeeQQc7ifhnnc?from=from_copylink', '_blank'); 
  }

  // 返回登录界面（不清除登录信息）
  to_login(): void {
    // 不清除登录状态，直接导航到登录页面
    this.router.navigate(['/login']);
  }

  // 退出登录
  logout(): void {
    // 获取当前用户信息
    const currentUserInfo = sessionStorage.getItem('currentUserInfo');
    if (currentUserInfo) {
      try {
        const userInfo = JSON.parse(currentUserInfo);
        const username = userInfo.username;

        // 从登录用户列表中移除当前用户
        let loggedUsers = [];
        const loggedUsersString = localStorage.getItem('loggedUsers');
        if (loggedUsersString) {
          loggedUsers = JSON.parse(loggedUsersString);
          loggedUsers = loggedUsers.filter((user: string) => user !== username);
          localStorage.setItem('loggedUsers', JSON.stringify(loggedUsers));
        }

        // 移除该用户的存储信息
        localStorage.removeItem(`user_${username}`);

        // 清除当前标签页的会话存储
        sessionStorage.removeItem('currentUserInfo');
      } catch (e) {
        console.error('登出失败', e);
      }
    }

    // 导航回登录页
    this.router.navigate(['/login']);
  }

  // 删除单条规则
  deleteRule(index: number): void {
    // 从规则数组中删除指定索引的规则
    if (index >= 0 && index < this.transitionRules.length) {
      this.transitionRules.splice(index, 1);
      console.log(`已删除规则索引 ${index}`);

      // 如果有图灵机ID，同步更改到服务器
      if (this.hasMachine && this.currentMachineId) {
        const state = { rules: this.transitionRules };
        this.turingService.updateState(this.currentMachineId, state).subscribe({
          next: () => console.log('已同步删除规则到服务器'),
          error: (error) => console.error('同步删除规则失败:', error)
        });
      }
    }
  }

  // 一键删除SampleRules
  async deleteSampleRules(): Promise<void> {
    if (confirm('确定要删除SampleMachine规则集吗？此操作不可恢复！')) {
      try {
        const result = await this.db.deleteSampleRules();
        if (result) {
          console.log('成功删除SampleMachine规则集');
          alert('成功删除SampleMachine规则集');
          // 重新加载规则名列表
          await this.loadAllRuleNames();

          // 如果当前选中的是SampleMachine，需要重置
          if (this.rulename === 'SampleMachine') {
            this.transitionRules = [];
            this.rulename = this.allRuleNames.length > 0 ? this.allRuleNames[0] : '';
          }
        } else {
          console.log('未找到SampleMachine规则集或删除失败');
          alert('未找到SampleMachine规则集或删除失败');
        }
      } catch (error) {
        console.error('删除SampleMachine时出错:', error);
        alert(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }
  }

  // 清空所有规则
  async clearAllRules(): Promise<void> {
    if (confirm('确定要删除所有规则集吗？此操作将清空数据库中的所有规则，且不可恢复！')) {
      try {
        const result = await this.db.clearAllRules();
        if (result) {
          console.log('成功清空所有规则集');
          alert('成功清空所有规则集');
          // 重新加载规则名列表
          this.allRuleNames = [];
          this.transitionRules = [];
          this.rulename = '';
        } else {
          console.log('清空规则失败');
          alert('清空规则失败');
        }
      } catch (error) {
        console.error('清空规则时出错:', error);
        alert(`清空失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }
  }

  toggleStateEditor() {
    this.showStateEditor = !this.showStateEditor;
    if (this.showStateEditor) {
      setTimeout(() => this.updateStateEditor(), 0);
    }
  }

  updateStateEditor() {// 当状态或规则变化时更新编辑器
    if (this.showStateEditor && this.stateEditor) {
      // 更新当前状态
      console.log('更新状态图');
      this.stateEditor.currentState = this.currentState;

      // 更新可用状态列表（确保包含所有规则中提到的状态）
      const allStates = new Set(this.availableStates);
      this.transitionRules.forEach(rule => {
        allStates.add(rule.currentState);
        allStates.add(rule.nextState);
      });
      this.stateEditor.availableStates = Array.from(allStates);

      // 更新转移规则
      this.stateEditor.transitionRules = this.transitionRules;

      // 触发状态编辑器更新
      this.stateEditor.updateGraph();
    }
  }

  onAddState(newState: string) {
    if (!this.availableStates.includes(newState)) {
      this.availableStates.push(newState);
      this.updateStateEditor();
    }
  }


  /** 控制聊天弹窗显示/隐藏 */
  showChat = false;

  toggleChat(): void {
    this.showChat = !this.showChat;
  }
}
