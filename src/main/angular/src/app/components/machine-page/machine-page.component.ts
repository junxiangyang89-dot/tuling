// src/main/angular/src/app/components/machine-page/machine-page.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { TuringMachineComponent } from '../turing-machine/turing-machine.component';

@Component({
  selector: 'app-machine-page',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    TuringMachineComponent
  ],
  template: `
    <div class="machine-page">
      <div class="header-bar">
        <button (click)="logout()" class="logout-button">退出登录</button>
      </div>
      
      <!-- 只使用图灵机组件 -->
      <app-turing-machine></app-turing-machine>
    </div>
  `,
  styles: [`
    .machine-page { 
      padding: 20px; 
      position: relative;
    }
    .header-bar { 
      display: flex; 
      justify-content: flex-end;
      margin-bottom: 20px; 
    }
    .logout-button { 
      padding: 10px 15px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      background-color: #f44336;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class MachinePageComponent {
  constructor(private router: Router) {}
  
  logout() {
    // 获取当前用户信息
    const currentUserInfo = localStorage.getItem('currentUserInfo');
    if (currentUserInfo) {
      try {
        const userInfo = JSON.parse(currentUserInfo);
        
        // 从登录用户列表中移除
        const loggedUsersString = localStorage.getItem('loggedUsers');
        if (loggedUsersString) {
          let loggedUsers = JSON.parse(loggedUsersString);
          const index = loggedUsers.indexOf(userInfo.username);
          if (index > -1) {
            loggedUsers.splice(index, 1);
            localStorage.setItem('loggedUsers', JSON.stringify(loggedUsers));
          }
        }
        
        // 删除该用户的信息
        localStorage.removeItem(`user_${userInfo.username}`);
        
        // 清除当前用户信息
        localStorage.removeItem('currentUserInfo');
      } catch (e) {
        console.error('解析用户信息失败', e);
      }
    }
    
    // 删除旧的token（兼容性考虑）
    localStorage.removeItem('token');
    
    // 导航回登录页
    this.router.navigate(['/login']);
  }
}