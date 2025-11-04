import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';

import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface TuringMachineInfo {
  id: number;
  name: string;
  description?: string;
  createTime?: string;
  isCompleted?: boolean;
  mode?: string;
  username?: string; // 添加创建者用户名字段
}

@Injectable({
  providedIn: 'root'
})

export class TuringMachineService {
  private apiUrl = environment.apiUrl + '/machine';
  private currentMachineIdSubject = new BehaviorSubject<number | null>(null);
  private currentModeSubject = new BehaviorSubject<string>(this.getInitialMode()); // 从存储中获取初始模式
  
  public currentMachineId$ = this.currentMachineIdSubject.asObservable();
  public currentMode$ = this.currentModeSubject.asObservable();
  
  constructor(private http: HttpClient) { 
    console.log('🔧 TuringMachineService - Environment API URL:', environment.apiUrl);
    console.log('🔧 TuringMachineService - Final API URL:', this.apiUrl);
    console.log('🔧 TuringMachineService - 初始模式:', this.getInitialMode());
  }
  
  // 获取初始模式（从sessionStorage或URL路径推断）
  private getInitialMode(): string {
    // 首先尝试从sessionStorage获取
    const storedMode = sessionStorage.getItem('currentMode');
    if (storedMode) {
      console.log('从sessionStorage恢复模式:', storedMode);
      return storedMode;
    }
    
    // 如果没有存储的模式，从当前URL路径推断
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/learning-mode')) {
        console.log('从URL路径推断模式: learning-mode');
        return 'learning-mode';
      } else if (currentPath.includes('/challenge-mode')) {
        console.log('从URL路径推断模式: challenge-mode');
        return 'challenge-mode';
      } else if (currentPath.includes('/free-mode')) {
        console.log('从URL路径推断模式: free-mode');
        return 'free-mode';
      }
    }
    
    // 默认为自由模式
    console.log('使用默认模式: free-mode');
    return 'free-mode';
  }
  
  // 获取认证头
  private getHeaders(): HttpHeaders {
    let token = null;
    let username = null;
    // 从当前标签页的会话存储获取
    const currentUserInfo = sessionStorage.getItem('currentUserInfo');
    
    if (currentUserInfo) {
      try {
        const userInfo = JSON.parse(currentUserInfo);
        token = userInfo.token;
        username = userInfo.username;
      } catch (e) {
        console.error('解析currentUserInfo失败', e);
      }
    }
    
    // 构建基础头信息
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    // 如果有用户名，添加用户名头
    if (username) {
      headers = headers.set('X-User-Name', username);
    }
    
    // 如果有令牌，添加授权头
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }
  
  // 获取当前登录用户的用户名
  getCurrentUsername(): string | null {
    // 从当前标签页的会话存储获取
    const currentUserInfo = sessionStorage.getItem('currentUserInfo');
    if (currentUserInfo) {
      try {
        const userInfo = JSON.parse(currentUserInfo);
        return userInfo.username;
      } catch (e) {
        console.error('解析currentUserInfo失败', e);
      }
    }
    return null;
  }
  
  // 获取所有已登录用户
  getAllLoggedUsers(): string[] {
    try {
      const loggedUsersString = localStorage.getItem('loggedUsers');
      if (loggedUsersString) {
        return JSON.parse(loggedUsersString);
      }
    } catch (e) {
      console.error('获取已登录用户列表失败', e);
    }
    return [];
  }
  
  // 切换到指定用户
  switchToUser(username: string): boolean {
    // 获取指定用户的信息
    const userInfo = localStorage.getItem(`user_${username}`);
    if (userInfo) {
      // 设置为当前用户（仅对当前标签页有效）
      sessionStorage.setItem('currentUserInfo', userInfo);
      return true;
    }
    return false;
  }
  
  // 获取所有图灵机列表（根据当前模式）
  getMachines(): Observable<TuringMachineInfo[]> {
    // 使用当前模式而不是'all'
    const currentMode = this.getCurrentMode();
    return this.getMachinesByMode(currentMode);
  }
  
  // 获取特定模式下的图灵机列表
  getMachinesByMode(mode: string): Observable<TuringMachineInfo[]> {
    const headers = this.getHeaders();
    const currentUser = this.getCurrentUsername();
    console.log(`开始获取${mode}模式下的图灵机列表，当前用户: ${currentUser}`);
    
    return this.http.get<any>(`${this.apiUrl}/${mode}/list`, { headers }).pipe(
      map(response => {
        console.log('图灵机列表API响应:', response);
        
        if (!response || !response.data) {
          console.error('API返回数据格式不正确或为空');
          return [];
        }
        
        const allMachines = response.data || [];
        console.log('从响应中获取到的所有图灵机:', allMachines);
        
        // 不再按用户名过滤，直接返回服务器返回的所有图灵机
        // 服务器端应该已经按用户ID过滤了正确的数据
        return allMachines;
      })
    );
  }
  
  // 创建新图灵机（兼容旧接口）
  createMachine(configuration: any): Observable<any> {
    return this.createMachineInMode('free-mode', configuration);
  }
  
  // 在特定模式下创建新图灵机
  createMachineInMode(mode: string, configuration: any): Observable<any> {
    const headers = this.getHeaders();
    // 确保配置中包含模式信息
    const config = { ...configuration, mode };
    return this.http.post<any>(`${this.apiUrl}/${mode}/create`, config, { headers });
  }
  
  // 获取特定图灵机（兼容旧接口）
  getMachine(machineId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}/${machineId}`, { headers });
  }
  
  // 获取特定模式下的特定图灵机
  getMachineInMode(mode: string, machineId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}/${mode}/${machineId}`, { headers });
  }
  
  // 执行单步操作（兼容旧接口）
  executeStep(machineId: number): Observable<any> {
    const mode = this.getCurrentMode();
    return this.executeStepInMode(mode, machineId);
  }
  
  // 在特定模式下执行单步操作
  executeStepInMode(mode: string, machineId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.apiUrl}/${mode}/${machineId}/step`, {}, { headers });
  }
  
  // 执行完整运行（兼容旧接口）
  executeAll(machineId: number): Observable<any> {
    const mode = this.getCurrentMode();
    return this.executeAllInMode(mode, machineId);
  }
  
  // 在特定模式下执行完整运行
  executeAllInMode(mode: string, machineId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.apiUrl}/${mode}/${machineId}/run`, {}, { headers });
  }
  
  // 重置图灵机状态（兼容旧接口）
  resetMachine(machineId: number): Observable<any> {
    const mode = this.getCurrentMode();
    return this.resetMachineInMode(mode, machineId);
  }
  
  // 在特定模式下重置图灵机状态
  resetMachineInMode(mode: string, machineId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.apiUrl}/${mode}/${machineId}/reset`, {}, { headers });
  }
  
  // 获取当前状态（兼容旧接口）
  getMachineState(machineId: number): Observable<any> {
    const mode = this.getCurrentMode();
    return this.getMachineStateInMode(mode, machineId);
  }
  
  // 在特定模式下获取当前状态
  getMachineStateInMode(mode: string, machineId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}/${mode}/${machineId}/state`, { headers });
  }
  
  // 设置输入带（兼容旧接口）
  setInput(machineId: number, input: string): Observable<any> {
    const mode = this.getCurrentMode();
    return this.setInputInMode(mode, machineId, input);
  }
  
  // 在特定模式下设置输入带
  setInputInMode(mode: string, machineId: number, input: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.apiUrl}/${mode}/${machineId}/input`, input, { headers });
  }
  
  // 切换当前选中的图灵机
  setCurrentMachine(machineId: number | null) {
    this.currentMachineIdSubject.next(machineId);
  }
  
  // 设置当前模式
  setCurrentMode(mode: string) {
    console.log('设置当前模式:', mode);
    // 保存到sessionStorage以在页面刷新时保持状态
    sessionStorage.setItem('currentMode', mode);
    // 更新BehaviorSubject
    this.currentModeSubject.next(mode);
  }
  
  // 获取当前选中的图灵机ID
  getCurrentMachineId(): number | null {
    return this.currentMachineIdSubject.value;
  }
  
  // 获取当前模式
  getCurrentMode(): string {
    return this.currentModeSubject.value;
  }

  // 更新图灵机状态（兼容旧接口）
  updateState(machineId: number, state: any): Observable<any> {
    const mode = this.getCurrentMode();
    return this.updateStateInMode(mode, machineId, state);
  }
  
  // 在特定模式下更新图灵机状态
  updateStateInMode(mode: string, machineId: number, state: any): Observable<any> {
    const headers = this.getHeaders();
    // 确保状态对象能被正确序列化
    const sanitizedState = JSON.parse(JSON.stringify(state));
    return this.http.post<any>(`${this.apiUrl}/${mode}/${machineId}/state`, sanitizedState, { headers });
  }

  // 删除图灵机（兼容旧接口）
  deleteMachine(machineId: number): Observable<any> {
    const mode = this.getCurrentMode();
    return this.deleteMachineInMode(mode, machineId);
  }
  
  // 在特定模式下删除图灵机
  deleteMachineInMode(mode: string, machineId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${this.apiUrl}/${mode}/${machineId}`, { headers });
  }

  // 清理缓存和重置状态
  clearCache(): void {
    console.log('清理TuringMachineService缓存');
    // 清除当前选中的图灵机
    this.currentMachineIdSubject.next(null);
    // 清除会话存储中的机器ID缓存，但保留模式信息
    sessionStorage.removeItem('currentMachineId');
    // 注意：不清除currentMode，因为用户可能正在同一模式下操作
  }
  
  // 强制刷新数据
  forceRefresh(): void {
    console.log('强制刷新TuringMachineService数据');
    this.clearCache();
    // 可以在这里添加其他需要刷新的数据逻辑
  }
  
  // 调试方法：打印当前状态
  debugCurrentState(): void {
    console.log('=== TuringMachineService 当前状态 ===');
    console.log('当前模式(BehaviorSubject):', this.currentModeSubject.value);
    console.log('当前模式(sessionStorage):', sessionStorage.getItem('currentMode'));
    console.log('当前机器ID:', this.currentMachineIdSubject.value);
    console.log('当前URL:', window.location.pathname);
    console.log('===============================');
  }
} 