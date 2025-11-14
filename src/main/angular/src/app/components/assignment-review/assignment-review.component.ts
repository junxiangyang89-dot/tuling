import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TuringMachineService, TuringMachineInfo } from '../../services/turing-machine.service';
import { ToastService } from '../../services/toast.service';
import { SharedToastComponent } from '../shared-toast/shared-toast.component';

@Component({
  selector: 'app-assignment-review',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SharedToastComponent],
  templateUrl: './assignment-review.component.html',
  styleUrl: './assignment-review.component.css'
})
export class AssignmentReviewComponent implements OnInit, AfterViewInit {
  pendingAssignments: any[] = [];
  selectedAssignment: any = null;
  currentUsername: string | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private turingService: TuringMachineService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.getCurrentUser();
    this.loadPendingAssignments();
  }

  ngAfterViewInit(): void {
    // 视图初始化后的处理
  }

  // 获取当前用户信息
  getCurrentUser(): void {
    this.currentUsername = this.turingService.getCurrentUsername();
    console.log('当前用户:', this.currentUsername);
  }

  // 加载所有待审核的优秀作业
  loadPendingAssignments(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.turingService.getPendingAssignments().subscribe({
      next: (resp) => {
        this.isLoading = false;
        // 后端 Result.success 使用 code=200，前端应以 200 作为成功判定
        if (resp && resp.code === 200 && resp.data && Array.isArray(resp.data)) {
          // 只显示状态为 PENDING 的待审核作业
          this.pendingAssignments = resp.data.filter((assignment: any) => assignment.status === 'PENDING');
          console.log('待审核作业数量:', this.pendingAssignments.length);
        } else {
          this.pendingAssignments = [];
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = '加载待审核作业失败';
        console.error('加载待审核作业错误:', error);
        this.toast.show('加载待审核作业失败', 'error');
      }
    });
  }

  // 查看作业详情
  viewAssignmentDetails(assignment: any): void {
    this.selectedAssignment = assignment;
    // 可以在这里加载更多的作业详情信息
  }

  // 审批通过作业
  approveAssignment(assignmentId: number): void {
    if (confirm('确定要审批通过这个优秀作业吗？审批通过后将发布到挑战模式题目中。')) {
      this.turingService.approveAssignment(assignmentId).subscribe({
        next: (resp) => {
          // 后端 Result.success 使用 code=200，前端应以 200 作为成功判定
          if (resp && resp.code === 200) {
            this.toast.show('作业已审批通过', 'success');
            // 重新加载待审核作业列表
            this.loadPendingAssignments();
            // 清除选中的作业
            this.selectedAssignment = null;
          } else {
            this.toast.show(resp?.msg || '审批失败', 'error');
          }
        },
        error: (error) => {
          console.error('审批作业错误:', error);
          this.toast.show('审批作业失败', 'error');
        }
      });
    }
  }

  // 拒绝作业
  rejectAssignment(assignmentId: number): void {
    if (confirm('确定要拒绝这个优秀作业吗？')) {
      this.turingService.rejectAssignment(assignmentId).subscribe({
        next: (resp) => {
          // 后端成功返回 code=200
          if (resp && resp.code === 200) {
            this.toast.show('作业已拒绝', 'success');
            // 重新加载待审核作业列表
            this.loadPendingAssignments();
            // 清除选中的作业
            this.selectedAssignment = null;
          } else {
            this.toast.show(resp?.msg || '拒绝失败', 'error');
          }
        },
        error: (error) => {
          console.error('拒绝作业错误:', error);
          this.toast.show('拒绝作业失败', 'error');
        }
      });
    }
  }

  // 关闭详情面板
  closeDetails(): void {
    this.selectedAssignment = null;
  }

  // 返回欢迎页面
  navigateToWelcome(): void {
    window.location.href = '/welcome';
  }

  // 退出登录
  logout(): void {
    sessionStorage.removeItem('currentUserInfo');
    localStorage.removeItem('token');
    localStorage.removeItem('currentUserInfo');
    window.location.href = '/login';
  }

  // 格式化JSON数据以便显示
  formatTestcaseJson(jsonStr: string): string {
    try {
      const parsed = JSON.parse(jsonStr);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      console.error('JSON解析失败:', e);
      return jsonStr;
    }
  }
}