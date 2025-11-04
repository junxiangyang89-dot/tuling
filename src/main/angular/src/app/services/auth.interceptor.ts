// src/app/services/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(`AuthInterceptor: 开始拦截请求 ${request.url}`);
    console.log(`AuthInterceptor: 原始请求头:`, request.headers);
    console.log(`AuthInterceptor: 原始请求体:`, request.body);
    
    // 尝试从当前标签页的会话存储获取token
    let token = null;
    let username = null;
    const currentUserInfo = sessionStorage.getItem('currentUserInfo');
    
    if (currentUserInfo) {
      try {
        const userInfo = JSON.parse(currentUserInfo);
        token = userInfo.token;
        username = userInfo.username;
        console.log(`AuthInterceptor: 从sessionStorage获取到认证信息: token=${token?.substring(0, 15)}..., username=${username}`);
      } catch (e) {
        console.error('AuthInterceptor: 解析currentUserInfo失败', e);
      }
    } else {
      console.log(`AuthInterceptor: sessionStorage中无认证信息`);
    }
    
    let modifiedRequest = request;
    
    if (token) {
      // 在请求头中添加授权信息
      modifiedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-User-Name': username || ''
        }
      });
      
      // 如果是POST请求并且body是对象，尝试在body中也添加username
      if (request.method === 'POST' && request.body && typeof request.body === 'object' && !Array.isArray(request.body)) {
        const modifiedBody = { ...request.body, username: username };
        modifiedRequest = modifiedRequest.clone({
          body: modifiedBody
        });
        console.log(`AuthInterceptor: 在请求体中添加了username: ${username}`);
      }
      
      console.log(`AuthInterceptor: 已添加认证头到请求 ${request.url}`);
    } else {
      // 确保Content-Type存在
      if (!request.headers.has('Content-Type')) {
        modifiedRequest = request.clone({
          setHeaders: {
            'Content-Type': 'application/json'
          }
        });
        console.log(`AuthInterceptor: 添加了Content-Type头到请求 ${request.url}`);
      }
    }
    
    // 打印修改后的请求信息
    console.log(`AuthInterceptor: 修改后的请求头:`, modifiedRequest.headers);
    console.log(`AuthInterceptor: 修改后的请求体:`, modifiedRequest.body);
    
    return next.handle(modifiedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error(`AuthInterceptor: 请求 ${request.url} 认证失败，可能需要重新登录`, error);
        } else if (error.status === 403) {
          console.error(`AuthInterceptor: 请求 ${request.url} 权限不足，无法访问该资源`, error);
        } else if (error.status === 0) {
          console.error(`AuthInterceptor: 请求 ${request.url} 网络错误，服务器可能未运行`, error);
        } else {
          console.error(`AuthInterceptor: 请求 ${request.url} 失败，状态码: ${error.status}`, error);
        }
        return throwError(() => error);
      })
    );
  }
}