import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TuringMachineService } from '../../services/turing-machine.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent implements OnInit {
  username: string = '';
  userRole: string | null = null;
  
  constructor(private router: Router, private turingService: TuringMachineService) {}
  
  ngOnInit(): void {
    // 获取用户信息
    this.getUserInfo();
  }
  
  private getUserInfo(): void {
    const userInfoStr = sessionStorage.getItem('currentUserInfo');
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        this.username = userInfo.username || '用户';
        this.userRole = userInfo.role || null;
        console.log('当前用户角色:', this.userRole);
      } catch (e) {
        console.error('解析用户信息失败', e);
        this.username = '用户';
        this.userRole = null;
      }
    } else {
      this.username = '用户';
      this.userRole = null;
    }
  }
  
  // 导航到自由模式
  navigateToFreeMode(): void {
    console.log('切换到自由模式');
    const currentMode = this.turingService.getCurrentMode();
    
    // 只有在模式真正发生变化时才清理缓存
    if (currentMode !== 'free-mode') {
      console.log('模式发生变化，从', currentMode, '切换到 free-mode');
      // 清理服务缓存（但不包括模式信息）
      this.turingService.clearCache();
    }
    
    // 设置新模式
    this.turingService.setCurrentMode('free-mode');
    // 导航并刷新页面
    this.router.navigate(['/free-mode']).then(() => {
      // 短暂延迟后刷新页面，确保路由完成
      setTimeout(() => {
        window.location.reload();
      }, 100);
    });
  }
  
  // 导航到学习模式
  navigateToLearningMode(): void {
    console.log('切换到学习模式');
    const currentMode = this.turingService.getCurrentMode();
    
    // 只有在模式真正发生变化时才清理缓存
    if (currentMode !== 'learning-mode') {
      console.log('模式发生变化，从', currentMode, '切换到 learning-mode');
      // 清理服务缓存（但不包括模式信息）
      this.turingService.clearCache();
    }
    
    // 设置新模式
    this.turingService.setCurrentMode('learning-mode');
    // 导航并刷新页面
    this.router.navigate(['/learning-mode']).then(() => {
      // 短暂延迟后刷新页面，确保路由完成
      setTimeout(() => {
        window.location.reload();
      }, 100);
    });
  }
  
  // 导航到挑战模式
  navigateToChallengeMode(): void {
    console.log('切换到挑战模式');
    const currentMode = this.turingService.getCurrentMode();
    
    // 只有在模式真正发生变化时才清理缓存
    if (currentMode !== 'challenge-mode') {
      console.log('模式发生变化，从', currentMode, '切换到 challenge-mode');
      // 清理服务缓存（但不包括模式信息）
      this.turingService.clearCache();
    }
    
    // 设置新模式
    this.turingService.setCurrentMode('challenge-mode');
    // 导航并刷新页面
    this.router.navigate(['/challenge-mode']).then(() => {
      // 短暂延迟后刷新页面，确保路由完成
      setTimeout(() => {
        window.location.reload();
      }, 100);
    });
  }
  
  // 返回登录页面
  to_login(): void {
    // 不删除localStorage中的内容，只是导航回登录页
    this.router.navigate(['/login']);
  }

  // 导航到作业审核页面（教师专用）
  navigateToAssignmentReview(): void {
    console.log('导航到作业审核页面');
    // 设置模式
    this.turingService.setCurrentMode('assignment-review');
    // 导航并刷新页面
    this.router.navigate(['/assignment-review']).then(() => {
      // 短暂延迟后刷新页面，确保路由完成
      setTimeout(() => {
        window.location.reload();
      }, 100);
    });
  }

  // 导航到优秀作业管理页面（教师专用）
  navigateToExcellentAssignments(): void {
    console.log('导航到优秀作业管理页面');
    // 设置模式
    this.turingService.setCurrentMode('excellent-assignments');
    // 导航并刷新页面
    this.router.navigate(['/teacher-excellent-assignments']).then(() => {
      // 短暂延迟后刷新页面，确保路由完成
      setTimeout(() => {
        window.location.reload();
      }, 100);
    });
  }

  // 判断是否为教师角色
  isTeacher(): boolean {
    return this.userRole?.toUpperCase() === 'TEACHER';
  }
}
