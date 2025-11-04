import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuringMachineService, TuringMachineInfo } from '../../services/turing-machine.service';
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

  constructor(private turingService: TuringMachineService) { }

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

  createMachine(): void {
    if (!this.newMachine.name) {
      alert('请输入图灵机名称');
      return;
    }

    this.turingService.createMachine(this.newMachine).subscribe({
      next: (response) => {
        console.log('创建成功:', response);
        this.loadMachines();
        this.toggleCreateForm();
      },
      error: (error) => {
        console.error('创建图灵机失败:', error);
      }
    });
  }

  selectMachine(machine: TuringMachineInfo): void {
    this.turingService.setCurrentMachine(machine.id);
    this.showSidebar = false;
  }

  deleteMachine(machineId: number): void {
    if (!confirm('确定要删除该图灵机吗？')) return;
    this.turingService.deleteMachine(machineId).subscribe({
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
} 