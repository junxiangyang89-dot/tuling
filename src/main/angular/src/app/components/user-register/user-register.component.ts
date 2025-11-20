import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.css'
})
export class UserRegisterComponent implements OnInit {
  // 为登录和注册分别创建独立的数据模型
  login_data = {
    username: '',
    password: ''
    // 登录时不再选择角色（注册时已决定）
  };

  register_data = {
    username: '',
    password: '',
    email: '',
    phone: '',
    role: 'STUDENT'
  };

  reset_data = {
    username: '',
    newPassword: '',
    confirmPassword: ''
  };

  isLoggedIn: boolean = false;
  isLoginMode: boolean = true;
  isResetMode: boolean = false;
  isRegisterMode: boolean = false;
  password: string = '';
  loggedUsers: string[] = [];
  resetError: string = '';

  constructor(public http:HttpClient, private router: Router) { }

  // 加载已登录用户列表（用于多用户管理）
  private loadLoggedUsers(): void {
    try {
      const loggedUsersString = localStorage.getItem('loggedUsers');
      if (loggedUsersString) {
        this.loggedUsers = JSON.parse(loggedUsersString);

        // 验证所有用户信息是否完整
        this.loggedUsers = this.loggedUsers.filter(username => {
          const userInfo = localStorage.getItem(`user_${username}`);
          return !!userInfo;
        });

        // 更新localStorage
        localStorage.setItem('loggedUsers', JSON.stringify(this.loggedUsers));
      }
    } catch (e) {
      console.error('加载用户列表失败', e);
      this.loggedUsers = [];
      localStorage.setItem('loggedUsers', JSON.stringify(this.loggedUsers));
    }
  }
  
  ngOnInit() {
    // 加载已登录用户列表
    this.loadLoggedUsers();

    // 检查是否有当前登录用户
    const currentUserInfo = sessionStorage.getItem('currentUserInfo');
    if (currentUserInfo) {
      try {
        const userInfo = JSON.parse(currentUserInfo);
        if (userInfo && userInfo.username && userInfo.token) {
          this.isLoggedIn = true;
        }
      } catch (e) {
        console.error('解析用户信息失败', e);
      }
    }
  }

  login() {
    const url = environment.apiUrl + "/auth/login";  // 登录接口地址
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    this.http.post(url,
      {
        username: this.login_data.username,
        password: this.login_data.password,
      }, httpOptions).subscribe({
      next: (response: any) => {
        if (response.code == 200) {
          // 存储用户信息到本地存储
          if (response.data && response.data.token) {
            // 服务器会返回 token，并且（如果存在）返回 role；如果后端未返回则默认为 STUDENT
            const serverRole = response.data.role || 'STUDENT';

            // 创建一个包含用户所有信息的对象
            const userInfo: any = {
              username: this.login_data.username,
              token: response.data.token,
              role: serverRole,
              loginTime: new Date().toISOString()
            };

            // 将当前活跃用户信息保存到sessionStorage（仅当前标签页有效）
            sessionStorage.setItem('currentUserInfo', JSON.stringify(userInfo));

            // 同时将用户信息保存到localStorage中，以支持多用户
            localStorage.setItem(`user_${this.login_data.username}`, JSON.stringify(userInfo));
            localStorage.setItem('currentUserInfo', JSON.stringify(userInfo));

            // 保存所有已登录用户名列表
            if (!this.loggedUsers.includes(this.login_data.username)) {
              this.loggedUsers.push(this.login_data.username);
              localStorage.setItem('loggedUsers', JSON.stringify(this.loggedUsers));
            }

            // 更新登录状态
            this.isLoggedIn = true;

            window.alert('登录成功');

            // 登录成功后跳转到欢迎页面
            this.router.navigate(['/welcome']);
          }
        } else {
          window.alert(response.msg || '登录失败');
        }
      },
      error: (error: any) => {
        console.error(error);
        window.alert('服务器异常，请稍后再试');
      }
    });
  }

  register() {
    if (!this.validateRegisterForm()) {
      return;
    }

          const url = environment.apiUrl + "/auth/register";
    const httpOptions = {
      headers: new HttpHeaders({'Content-Type': 'application/json'}),
    };
    this.http.post(url,
      {
        username: this.register_data.username,
        password: this.register_data.password,
        email: this.register_data.email,
        phone: this.register_data.phone,
        role: this.register_data.role
      }, httpOptions).subscribe({
        next: (response: any) => {
          if (response.code == 200) {
            window.alert('注册成功，请登录');
            this.isLoginMode = true; // 切换到登录模式

            // 清空注册表单
            this.register_data = {
              username: '',
              password: '',
              email: '',
              phone: '',
              role: 'STUDENT'
            };
          } else {
            window.alert(response.msg);
          }
        },
        error: (error: any) => {
          console.error(error);
          window.alert('服务器异常，请稍后再试');
        }
      });
  }

  resetPassword() {
    if (!this.validateResetForm()) {
      return;
    }

          const url = environment.apiUrl + '/auth/reset-password';
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    this.http.post(url,
      {
        username: this.reset_data.username,
        newPassword: this.reset_data.newPassword
      },
      httpOptions
    ).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          window.alert('密码重置成功，请重新登录');
          // 切换回登录模式
          this.isResetMode = false;
          this.isLoginMode = true;
          // 清空表单
          this.reset_data = { username: '', newPassword: '', confirmPassword: '' };
        } else {
          window.alert(res.msg || '重置失败');
        }
      },
      error: (err: any) => {
        console.error(err);
        window.alert('服务器异常，请稍后再试');
      }
    });
  }
  
  // 验证注册表单
  private validateRegisterForm(): boolean {
    const uname = this.register_data.username;
    if (!uname) {
      window.alert('请输入用户名');
      return false;
    }
    if (!/^[A-Za-z0-9_]+$/.test(uname)) {
      window.alert('用户名只能包含字母、数字或下划线');
      return false;
    }
    if (!this.register_data.password) {
      window.alert('请输入密码');
      return false;
    }
    if (!this.register_data.email) {
      window.alert('请输入邮箱');
      return false;
    }
    if (!this.register_data.phone) {
      window.alert('请输入电话');
      return false;
    }
    return true;
  }

  private validateResetForm(): boolean {
    const { username, newPassword, confirmPassword } = this.reset_data;
    if (!username.trim()) {
      this.resetError = '用户名不能为空';
      return false;
    }
    if (newPassword.length < 6) {
      this.resetError = '新密码至少 6 位';
      return false;
    }
    if (newPassword !== confirmPassword) {
      this.resetError = '两次输入的密码不一致';
      return false;
    }
    this.resetError = '';
    return true;
  }

  toggleLoginMode() {
    this.isRegisterMode = !this.isRegisterMode;    
    this.isLoginMode = !this.isLoginMode;
    // 切换模式时清空表单
    this.password = '';
  }

  toggleResetMode() {
    this.isResetMode = !this.isResetMode;
    this.isLoginMode = !this.isLoginMode;
    // 清空错误和表单
    this.resetError = '';
    this.reset_data = { username: '', newPassword: '', confirmPassword: '' };
  }
  
  // 切换到其他已登录用户
  switchUser(username: string) {
    // 获取指定用户的信息
    const userInfo = localStorage.getItem(`user_${username}`);
    if (userInfo) {
      // 设置为当前用户（仅对当前标签页有效）
      sessionStorage.setItem('currentUserInfo', userInfo);
      this.isLoggedIn = true;

      // 跳转到欢迎页面
      this.router.navigate(['/welcome']);
    } else {
      console.error(`用户 ${username} 的信息不存在`);
      // 从已登录用户列表中移除不存在的用户
      this.loggedUsers = this.loggedUsers.filter(user => user !== username);
      localStorage.setItem('loggedUsers', JSON.stringify(this.loggedUsers));
    }
  }

  // 获取所有已登录用户列表
  getLoggedUsers(): string[] {
    return this.loggedUsers;
  }

  // 登出当前用户
  logout() {
    // 获取当前用户信息
    const currentUserInfo = sessionStorage.getItem('currentUserInfo');
    if (currentUserInfo) {
      try {
        const userInfo = JSON.parse(currentUserInfo);
        const username = userInfo.username;

        // 从已登录用户列表中移除当前用户
        this.loggedUsers = this.loggedUsers.filter(user => user !== username);
        localStorage.setItem('loggedUsers', JSON.stringify(this.loggedUsers));

        // 移除该用户的存储信息
        localStorage.removeItem(`user_${username}`);
        localStorage.removeItem('currentUserInfo');

        // 清除当前标签页的会话存储
        sessionStorage.removeItem('currentUserInfo');
        this.isLoggedIn = false;
      } catch (e) {
        console.error('登出失败', e);
      }
    }
  }

  // 导航到欢迎页面
  navigateToWelcome(): void {
    this.router.navigate(['/welcome']);
  }

  // 返回登录界面
  backToLogin(): void {
    this.isLoggedIn = false;
  }
}
