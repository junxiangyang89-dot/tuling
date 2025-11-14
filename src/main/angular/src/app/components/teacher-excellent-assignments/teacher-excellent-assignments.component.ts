import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TuringMachineService } from '../../services/turing-machine.service';
import { ToastService } from '../../services/toast.service';
import { SharedToastComponent } from '../shared-toast/shared-toast.component';

export interface ExcellentAssignment {
  id: number;
  title: string;
  description: string;
  creatorUsername: string;
  createTime: string;
  status: string;
  testcaseJson: string;
  score?: number;
  comment?: string;
  isSample?: boolean;
}

@Component({
  selector: 'app-teacher-excellent-assignments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SharedToastComponent],
  templateUrl: './teacher-excellent-assignments.component.html',
  styleUrl: './teacher-excellent-assignments.component.css'
})
export class TeacherExcellentAssignmentsComponent implements OnInit {
  assignments: ExcellentAssignment[] = [];
  filteredAssignments: ExcellentAssignment[] = [];
  selectedAssignment: ExcellentAssignment | null = null;
  currentUsername: string | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  // 筛选条件
  filters = {
    status: 'ALL',
    searchKeyword: '',
    sortBy: 'createTime',
    sortOrder: 'desc'
  };

  // 评分和评语
  evaluation = {
    score: 0,
    comment: ''
  };

  constructor(
    private turingService: TuringMachineService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.getCurrentUser();
    this.loadExcellentAssignments();
  }

  // 获取当前用户信息
  getCurrentUser(): void {
    this.currentUsername = this.turingService.getCurrentUsername();
    console.log('当前用户:', this.currentUsername);
  }

  // 加载所有优秀作业
  loadExcellentAssignments(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.turingService.getAllAssignments().subscribe({
      next: (resp) => {
        this.isLoading = false;
        if (resp && resp.code === 200 && resp.data && Array.isArray(resp.data)) {
          this.assignments = resp.data;
          this.applyFilters();
          console.log('优秀作业数量:', this.assignments.length);
        } else {
          this.assignments = [];
          this.filteredAssignments = [];
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = '加载优秀作业失败';
        console.error('加载优秀作业错误:', error);
        this.toast.show('加载优秀作业失败', 'error');
      }
    });
  }

  // 应用筛选条件
  applyFilters(): void {
    this.filteredAssignments = this.assignments.filter(assignment => {
      // 状态筛选
      if (this.filters.status !== 'ALL' && assignment.status !== this.filters.status) {
        return false;
      }
      
      // 关键词搜索
      if (this.filters.searchKeyword) {
        const keyword = this.filters.searchKeyword.toLowerCase();
        return (
          assignment.title.toLowerCase().includes(keyword) ||
          assignment.description.toLowerCase().includes(keyword) ||
          assignment.creatorUsername.toLowerCase().includes(keyword)
        );
      }
      
      return true;
    });
    
    // 排序
    this.filteredAssignments.sort((a, b) => {
      let comparison = 0;
      const sortField = this.filters.sortBy;
      
      if (sortField === 'createTime') {
        comparison = new Date(a.createTime).getTime() - new Date(b.createTime).getTime();
      } else if (sortField === 'score') {
        comparison = (a.score || 0) - (b.score || 0);
      }
      
      return this.filters.sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  // 重置筛选条件
  resetFilters(): void {
    this.filters = {
      status: 'ALL',
      searchKeyword: '',
      sortBy: 'createTime',
      sortOrder: 'desc'
    };
    this.applyFilters();
  }

  // 查看作业详情
  viewAssignmentDetails(assignment: ExcellentAssignment): void {
    this.selectedAssignment = assignment;
    // 初始化评分和评语
    this.evaluation.score = assignment.score || 0;
    this.evaluation.comment = assignment.comment || '';
  }

  // 关闭详情面板
  closeDetails(): void {
    this.selectedAssignment = null;
  }

  // 保存评分和评语
  saveEvaluation(assignmentId: number): void {
    if (!this.selectedAssignment) return;
    
    this.turingService.updateAssignmentEvaluation(
      assignmentId,
      this.evaluation.score,
      this.evaluation.comment
    ).subscribe({
      next: (resp) => {
        // 更新本地数据
        const assignmentIndex = this.assignments.findIndex(a => a.id === assignmentId);
        if (assignmentIndex !== -1) {
          this.assignments[assignmentIndex].score = this.evaluation.score;
          this.assignments[assignmentIndex].comment = this.evaluation.comment;
          this.applyFilters();
        }
        
        this.toast.show('评分和评语已保存', 'success');
      },
      error: (error) => {
        console.error('保存评分和评语失败:', error);
        this.toast.show('保存评分和评语失败', 'error');
      }
    });
  }

  // 标记为优秀作业
  markAsExcellent(assignmentId: number): void {
    if (!this.selectedAssignment) return;
    
    this.turingService.updateAssignmentSampleStatus(
      assignmentId,
      true
    ).subscribe({
      next: (resp) => {
        // 更新本地数据
        const assignmentIndex = this.assignments.findIndex(a => a.id === assignmentId);
        if (assignmentIndex !== -1) {
          this.assignments[assignmentIndex].isSample = true;
          this.applyFilters();
        }
        
        this.toast.show('已标记为优秀作业', 'success');
      },
      error: (error) => {
        console.error('标记优秀作业失败:', error);
        this.toast.show('标记优秀作业失败', 'error');
      }
    });
  }

  // 设置为范例（与标记优秀作业功能合并，因为后端使用isSample字段表示）
  setAsSample(assignmentId: number): void {
    // 直接调用标记优秀作业的方法，因为它们在后端使用相同的字段
    this.markAsExcellent(assignmentId);
  }

  /**
   * Save the evaluation for the currently selected assignment
   */
  saveCurrentAssignmentEvaluation(): void {
    if (this.selectedAssignment) {
      this.saveEvaluation(this.selectedAssignment.id);
    }
  }

  /**
   * Mark the currently selected assignment as excellent
   */
  markCurrentAssignmentAsExcellent(): void {
    if (this.selectedAssignment) {
      this.markAsExcellent(this.selectedAssignment.id);
    }
  }

  /**
   * Set the currently selected assignment as sample
   */
  setCurrentAssignmentAsSample(): void {
    if (this.selectedAssignment) {
      this.setAsSample(this.selectedAssignment.id);
    }
  }

  /**
   * Getter to ensure selectedAssignment is not null when accessed in template
   * Since we have *ngIf="selectedAssignment" protecting the template, this assertion is safe
   */
  get currentSelectedAssignment(): ExcellentAssignment {
    return this.selectedAssignment as ExcellentAssignment;
  }
  
  // Getter 方法：获取待审核作业数量
  get pendingAssignmentsCount(): number {
    return this.assignments.filter(a => a.status === 'PENDING').length;
  }
  
  // Getter 方法：获取已审核作业数量
  get approvedAssignmentsCount(): number {
    return this.assignments.filter(a => a.status === 'APPROVED').length;
  }
  
  // Getter 方法：获取拒绝作业数量
  get rejectedAssignmentsCount(): number {
    return this.assignments.filter(a => a.status === 'REJECTED').length;
  }
  
  // Getter 方法：获取优秀作业数量
  get sampleAssignmentsCount(): number {
    return this.assignments.filter(a => a.isSample).length;
  }

  // 下载作业
  downloadAssignment(assignment: ExcellentAssignment): void {
    try {
      const config = JSON.parse(assignment.testcaseJson);
      const dataStr = JSON.stringify(config, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${assignment.title}-${assignment.creatorUsername}-${assignment.id}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      this.toast.show('作业已下载', 'success');
    } catch (error) {
      console.error('下载作业失败:', error);
      this.toast.show('下载作业失败', 'error');
    }
  }

  // 返回欢迎页面
  navigateToWelcome(): void {
    console.log('从优秀作业管理返回欢迎页面');
    this.turingService.setCurrentMode('free-mode');
    this.turingService.setCurrentMachine(null);
    window.location.href = '/welcome';
  }

  // 退出登录
  logout(): void {
    const currentUserInfo = sessionStorage.getItem('currentUserInfo');
    if (currentUserInfo) {
      try {
        const userInfo = JSON.parse(currentUserInfo);
        sessionStorage.removeItem('currentUserInfo');
        console.log(`用户 ${userInfo.username} 已退出登录`);
      } catch (e) {
        console.error('解析用户信息失败', e);
      }
    }
    window.location.href = '/login';
  }

  // 格式化JSON显示
  formatTestcaseJson(jsonString: string): string {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return jsonString;
    }
  }
}