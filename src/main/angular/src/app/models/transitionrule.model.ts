export interface TransitionRule {
  currentState: string;     // 当前状态
  inputSymbol: string;      // 当前读到的符号
  outputSymbol: string;     // 要写入的符号
  moveDirection: 'L' | 'R' | 'S';  // 纸带头移动方向
  nextState: string;        // 下一个状态
  
  // 兼容旧版本的属性
  iswrite?: boolean;
  //writeSymbol?: string; 
  //direction?: 'L' | 'R' | 'S';
}
