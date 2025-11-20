import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuringMachineService, TuringMachineInfo } from '../../services/turing-machine.service';
import { ToastService } from '../../services/toast.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-turing-machine-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './turing-machine-manager.component.html',
  styleUrls: ['./turing-machine-manager.component.css']
})
export class TuringMachineManagerComponent implements OnInit {
  machines: TuringMachineInfo[] = [];
  showSidebar: boolean = false;
  showCreateForm: boolean = false;
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

  constructor(private turingService: TuringMachineService, private toast: ToastService) { }

  ngOnInit(): void {
    this.loadMachines();
  }

  loadMachines(): void {
    this.turingService.getMachines().subscribe({
      next: (data) => {
        this.machines = data;
      },
      error: (error) => {
        console.error('获取图灵机列表失败:', error);
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

  onCreateButtonClicked(): void {
    const mode = this.turingService.getCurrentMode();
    if (mode !== 'free-mode') {
      this.toast.show('该操作仅在自由模式下可用。请切换到自由模式或在模式选择界面创建图灵机。', 'warn', 6000);
      return;
    }
    this.toggleCreateForm();
  }

  createMachine(): void {
    if (!this.newMachine.name) {
x      this.toast.show('请输入图灵机名称', 'warn', 4000);
      return;
    }

    this.turingService.createMachine(this.newMachine).subscribe({
      next: (response) => {
        console.log('创建成功:', response);
        this.toast.show('图灵机创建成功', 'success', 3000);
        this.loadMachines();
        this.toggleCreateForm();
      },
      error: (error) => {
        console.error('创建图灵机失败:', error);
        this.toast.show('创建图灵机失败: ' + (error?.error?.message || '未知错误'), 'error', 6000);
      }
    });
  }

  selectMachine(machine: TuringMachineInfo): void {
    this.turingService.setCurrentMachine(machine.id);
    this.showSidebar = false;
  }

  deleteMachine(machineId: number): void {
    if (!window.confirm('确定要删除该图灵机吗？')) return;
    this.turingService.deleteMachine(machineId).subscribe({
      next: (res: any) => {
        this.toast.show('删除成功', 'success', 3000);
        this.loadMachines(); // 重新加载列表
      },
      error: (err: any) => {
        this.toast.show('删除失败', 'error', 4000);
        console.error(err);
      }
    });
  }
} 