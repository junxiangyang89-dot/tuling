import { Component, OnInit } from '@angular/core';
import { TuringMachineService } from '../../services/turing-machine.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-excellent-assignments',
  templateUrl: './excellent-assignments.component.html',
  styleUrls: ['./excellent-assignments.component.css']
})
export class ExcellentAssignmentsComponent implements OnInit {
  assignments: any[] = [];
  selectedAssignment: any = null;
  isDetailView = false;
  score: number = 0;
  comment: string = '';
  isSample: boolean = false;
  loading: boolean = false;

  constructor(
    private turingMachineService: TuringMachineService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAssignments();
  }

  loadAssignments(): void {
    this.loading = true;
    this.turingMachineService.getAllAssignments().subscribe(
      (response: any) => {
        this.assignments = response.data;
        this.loading = false;
      },
      (error) => {
        console.error('加载作业列表失败:', error);
        this.loading = false;
      }
    );
  }

  viewAssignmentDetail(assignment: any): void {
    this.selectedAssignment = assignment;
    this.score = assignment.score || 0;
    this.comment = assignment.comment || '';
    this.isSample = assignment.isSample || false;
    this.isDetailView = true;
  }

  backToList(): void {
    this.isDetailView = false;
    this.selectedAssignment = null;
  }

  updateEvaluation(): void {
    if (!this.selectedAssignment) return;

    this.turingMachineService.updateAssignmentEvaluation(
      this.selectedAssignment.id,
      this.score,
      this.comment
    ).subscribe(
      (response: any) => {
        alert('评分和评语已更新');
        this.loadAssignments(); // 重新加载列表以更新数据
      },
      (error) => {
        console.error('更新评分和评语失败:', error);
        alert('更新失败，请重试');
      }
    );
  }

  toggleSampleStatus(): void {
    if (!this.selectedAssignment) return;

    this.turingMachineService.updateAssignmentSampleStatus(
      this.selectedAssignment.id,
      !this.isSample
    ).subscribe(
      (response: any) => {
        alert('优秀作业状态已更新');
        this.isSample = !this.isSample;
        this.loadAssignments(); // 重新加载列表以更新数据
      },
      (error) => {
        console.error('更新优秀作业状态失败:', error);
        alert('更新失败，请重试');
      }
    );
  }

  logout(): void {
    // 清除本地存储的用户信息
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // 重定向到登录页面
    this.router.navigate(['/login']);
  }
}