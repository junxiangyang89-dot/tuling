import { Routes } from '@angular/router';
import { UserRegisterComponent } from './components/user-register/user-register.component';
import { TuringMachineComponent } from './components/turing-machine/turing-machine.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { FreeModeComponent } from './components/free-mode/free-mode.component';
import { LearningModeComponent } from './components/learning-mode/learning-mode.component';
import { ChallengeModeComponent } from './components/challenge-mode/challenge-mode.component';
import { AssignmentReviewComponent } from './components/assignment-review/assignment-review.component';
import { TeacherExcellentAssignmentsComponent } from './components/teacher-excellent-assignments/teacher-excellent-assignments.component';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  // 无需登录的路由
  { path: 'login', component: UserRegisterComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 欢迎页面
  { path: 'welcome', component: WelcomeComponent, canActivate: [AuthGuard] },

  // 各模式路由
  {
    path: 'free-mode',
    canActivate: [AuthGuard],
    component: TuringMachineComponent,
    children: [
      { path: '', component: FreeModeComponent },
      { path: 'machine', component: TuringMachineComponent }
    ]
  },
  {
    path: 'learning-mode',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: LearningModeComponent },
      { path: 'machine', component: TuringMachineComponent }
    ]
  },
  {
    path: 'challenge-mode',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: ChallengeModeComponent },
      { path: 'machine', component: TuringMachineComponent }
    ]
  },

  // 教师专用的作业审核路由
  { 
    path: 'assignment-review', 
    component: AssignmentReviewComponent, 
    canActivate: [AuthGuard] 
  },
  
  // 教师专用的优秀作业管理路由
  { 
    path: 'teacher-excellent-assignments', 
    component: TeacherExcellentAssignmentsComponent, 
    canActivate: [AuthGuard] 
  },

  // 通配符路由
  { path: '**', redirectTo: 'welcome' }
];
