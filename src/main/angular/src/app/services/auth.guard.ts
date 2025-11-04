import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private router: Router) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // 检查用户是否已登录
    const isAuthenticated = this.checkIfUserIsAuthenticated();
    
    if (!isAuthenticated) {
      // 如果未登录，重定向到登录页面
      this.router.navigate(['/login']);
      return false;
    }
    
    return true;
  }
  
  private checkIfUserIsAuthenticated(): boolean {
    // 检查是否有当前用户信息
    const currentUserInfo = localStorage.getItem('currentUserInfo');
    if (currentUserInfo) {
      try {
        const userInfo = JSON.parse(currentUserInfo);
        // 确认有效的token
        return !!userInfo.token;
      } catch (e) {
        console.error('解析currentUserInfo失败', e);
      }
    }
    
    // 检查旧版本的token（兼容旧代码）
    const token = localStorage.getItem('token');
    return !!token;
  }
} 