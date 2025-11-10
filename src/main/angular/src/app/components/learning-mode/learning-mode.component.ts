import {Component, OnInit, AfterViewInit, ViewEncapsulation} from '@angular/core';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TuringMachineComponent } from '../turing-machine/turing-machine.component';
import { TuringMachineService, TuringMachineInfo } from '../../services/turing-machine.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-learning-mode',
  standalone: true,
  imports: [
    // TuringMachineComponent,
    CommonModule,
    FormsModule,
    RouterOutlet
  ],
  templateUrl: './learning-mode.component.html',
  styleUrl: './learning-mode.component.css',
  encapsulation: ViewEncapsulation.None
})
export class LearningModeComponent implements OnInit, AfterViewInit {
  machines: TuringMachineInfo[] = [];
  mode: string = 'learning-mode';
  showCreate: boolean = false;
  currentUsername: string | null = null;
  currentUserRole: string | null = null;
  newMachine = {
    name: 'SampleMachine',
    description: '',
    mode: 'free-mode',
    username: '',
    configuration: {
      initialState: 'q0',
      acceptingStates: ['qAccept'],
      tape: '1010',
      rules: []
    }
  };
  // 存放已提交的优秀作业（临时展示）
  excellentSubmissions: TuringMachineInfo[] = [];

  constructor(
    private turingService: TuringMachineService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('LearningModeComponent ngOnInit - 开始初始化');
    console.log('组件模式:', this.mode);
    console.log('服务当前模式:', this.turingService.getCurrentMode());
    
    // 确保当前模式正确设置为learning-mode
    this.turingService.setCurrentMode(this.mode);
    console.log('已设置模式为:', this.mode);
    
    this.getCurrentUser();
    // 加载此模式下的图灵机
    this.loadMachines();
  }
  ngAfterViewInit(): void {
    this.turingService.setCurrentMode(this.mode); // 每次视图渲染后再次设置模式
  }

  // 获取当前用户信息
  getCurrentUser(): void {
    this.currentUsername = this.turingService.getCurrentUsername();
    console.log('当前用户:', this.currentUsername);
    if (this.currentUsername) {
      this.newMachine.username = this.currentUsername;
    }
    // 尝试读取角色信息
    try {
      const currentUserInfo = sessionStorage.getItem('currentUserInfo');
      if (currentUserInfo) {
        const info = JSON.parse(currentUserInfo);
        this.currentUserRole = info.role || null;
        console.log('当前用户角色:', this.currentUserRole);
      }
    } catch (e) {
      console.error('解析 currentUserInfo 失败', e);
    }
  }

  // 学生点击“优秀作业申请”提交当前作业到 challenge-mode（服务器会保存为新的题目）
  submitExcellentAssignment(machine?: TuringMachineInfo): void {
    // 仅学生可提交（前端判断）
    if (this.currentUserRole !== 'STUDENT') {
      alert('仅学生可以申请优秀作业');
      return;
    }
    // 强制要求传入已存在的图灵机，不允许从创建表单直接提交
    if (!machine) {
      alert('请选择已创建的图灵机，然后点击“提交为优秀作业”进行申请。');
      return;
    }

    const payload: any = { ...machine };
    // 标记为优秀作业来源
    payload.title = payload.name || '优秀作业';
    payload.isExcellentSubmission = true;

    this.turingService.createMachineInMode('challenge-mode', payload).subscribe({
      next: (res: any) => {
        alert('优秀作业提交成功，已发送给教师审阅');
        // 将提交加入本地展示列表（如果服务器返回了新 id，可使用）
        if (res && res.data) {
          const newId = res.data;
          const info: TuringMachineInfo = { id: newId, name: payload.title, description: payload.description || '', createTime: new Date().toISOString(), mode: 'challenge-mode', username: this.currentUsername || '' };
          this.excellentSubmissions.unshift(info);
        }
      },
      error: (err: any) => {
        console.error('提交优秀作业失败', err);
        alert('提交失败，请稍后重试或联系教师');
      }
    });
  }

  loadMachines(): void {
    console.log(`开始加载${this.mode}模式下的图灵机`);
    this.turingService.debugCurrentState(); // 调试当前状态
    
    this.turingService.getMachinesByMode(this.mode).subscribe({
      next: (data) => {
        this.machines = data;
        console.log(`成功加载${this.mode}模式下的图灵机:`, this.machines.length, '台');
        console.log('图灵机详情:', this.machines);
      },
      error: (error) => {
        console.error(`获取${this.mode}模式图灵机列表失败:`, error);
      }
    });
  }

  selectMachine(machine: TuringMachineInfo): void {
    // 设置当前图灵机，然后导航到该模式下的图灵机页面
    this.turingService.setCurrentMachine(machine.id);
    this.router.navigate(['machine'], { relativeTo: this.route });
  }

  toggleCreateForm(): void {
    this.showCreate = !this.showCreate;
  }

  createMachine(): void {
    if (!this.newMachine.name) {
      alert('请输入图灵机名称');
      return;
    }

    // 确保创建时包含当前用户名
    if (this.currentUsername) {
      this.newMachine.username = this.currentUsername;
    }

    this.turingService.createMachineInMode(this.mode, this.newMachine).subscribe({
      next: (response) => {
        console.log('创建成功:', response);
        this.loadMachines();
        this.toggleCreateForm();

        // 如果创建成功，导航到新创建的图灵机页面
        if (response && response.data) {
          const machineId = response.data;
          this.turingService.setCurrentMachine(machineId);
          this.router.navigate(['machine'], { relativeTo: this.route });
        }
      },
      error: (error) => {
        console.error('创建图灵机失败:', error);
      }
    });
  }

  deleteMachine(machineId: number, event: Event): void {
    event.stopPropagation(); // 阻止事件冒泡，避免触发选择图灵机

    if (!confirm('确定要删除该图灵机吗？')) return;
    this.turingService.deleteMachineInMode(this.mode, machineId).subscribe({
      next: (res: any) => {
        alert('删除成功');
        this.loadMachines(); // 重新加载列表
      },
      error: (err: any) => {
        alert('删除失败');
        console.error(err);
      }
    });
  }

  // 返回欢迎页面
  navigateToWelcome(): void {
    console.log('从学习模式返回欢迎页面');
    // 清除当前模式和相关缓存
    sessionStorage.removeItem('currentMode');
    this.turingService.setCurrentMode('free-mode'); // 重置为默认模式
    this.turingService.setCurrentMachine(null); // 清除当前选中的图灵机
    this.router.navigate(['/welcome']);
  }
  to_login(): void {
    // 不删除localStorage中的内容，只是导航回登录页
    this.router.navigate(['/login']);
  }
  // 退出登录
  logout(): void {
    // 获取当前用户信息
    const currentUserInfo = sessionStorage.getItem('currentUserInfo');
    if (currentUserInfo) {
      try {
        const userInfo = JSON.parse(currentUserInfo);

        // 清除当前标签页的会话存储
        sessionStorage.removeItem('currentUserInfo');
        console.log(`用户 ${userInfo.username} 已退出登录`);
      } catch (e) {
        console.error('解析用户信息失败', e);
      }
    }

    // 导航回登录页
    this.router.navigate(['/login']);
  }
}
