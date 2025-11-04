import { Component, OnInit, AfterViewInit } from '@angular/core';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {ActivatedRoute, Router, RouterOutlet} from '@angular/router';
import {TuringMachineInfo, TuringMachineService} from '../../services/turing-machine.service';
import {FormsModule} from '@angular/forms';
import { CHALLENGE_TESTCASES } from '../../data/challenge';
@Component({
  selector: 'app-challenge-mode',
  imports: [
    NgIf,
    RouterOutlet,
    FormsModule,
    DatePipe,
    NgForOf
  ],
  templateUrl: './challenge-mode.component.html',
  styleUrl: './challenge-mode.component.css'
})

export class ChallengeModeComponent implements OnInit, AfterViewInit {
  machines: TuringMachineInfo[] = [];
  mode: string = 'challenge-mode';
  showCreate: boolean = false;
  currentUsername: string | null = null;
  newMachine = {
    name: '',
    description: '',
    mode: 'free-mode',
    username: '',
    testcase:{},
    configuration: {
      initialState: 'q0',
      acceptingStates: ['qAccept'],
      tape: '',
      rules: []
    }
  };
  selectedTestId: string | null = null;
  testCases = CHALLENGE_TESTCASES;

  constructor(
    private turingService: TuringMachineService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('ChallengeModeComponent ngOnInit - 开始初始化');
    console.log('组件模式:', this.mode);
    console.log('服务当前模式:', this.turingService.getCurrentMode());
    
    // 确保当前模式正确设置为challenge-mode
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
  }

  // 返回欢迎页面
  navigateToWelcome(): void {
    console.log('从挑战模式返回欢迎页面');
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

  selectedTestTitle(): string {
    const match = this.testCases.find(test => test.id === this.selectedTestId);
    return match ? match.title : '';
  }

  selectedTestCase(): void {
    const match = this.testCases.find(test => test.id === this.selectedTestId);
    if (match) {
      this.newMachine.name = match.title;
      this.newMachine.testcase = match.testcase || [];  // 默认 []
      this.newMachine.description = match.description;
    }
  }

  createMachine(): void {
    this.newMachine.name = this.selectedTestTitle();
    this.selectedTestCase();
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
}
