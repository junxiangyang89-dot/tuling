import { TransitionRule } from '../models/transitionrule.model';

export const SAMPLE_RULES: TransitionRule[] = [
    { currentState: "q0", inputSymbol: "1", outputSymbol: "1", moveDirection: "R", nextState: "q1", iswrite: true },
    { currentState: "q0", inputSymbol: "0", outputSymbol: "0", moveDirection: "R", nextState: "q0", iswrite: false },
    { currentState: "q1", inputSymbol: "1", outputSymbol: "1", moveDirection: "R", nextState: "q0", iswrite: true },
    { currentState: "q1", inputSymbol: "0", outputSymbol: "1", moveDirection: "R", nextState: "q2", iswrite: true },
    { currentState: "q2", inputSymbol: "1", outputSymbol: "1", moveDirection: "R", nextState: "q2", iswrite: true },
    { currentState: "q2", inputSymbol: "0", outputSymbol: "0", moveDirection: "R", nextState: "q1", iswrite: true },
    { currentState: "q2", inputSymbol: " ", outputSymbol: " ", moveDirection: "R", nextState: "qAccept", iswrite: true }
]
  
export const BinaryIncrement: TransitionRule[] = [
    { currentState: "q0", inputSymbol: "0", outputSymbol: "", moveDirection: "R", nextState: "q0", iswrite: false },
    { currentState: "q0", inputSymbol: "1", outputSymbol: "", moveDirection: "R", nextState: "q0", iswrite: false },
    { currentState: "q0", inputSymbol: " ", outputSymbol: "",  moveDirection: "L", nextState: "q1", iswrite: false },
  
    { currentState: "q1", inputSymbol: "1", outputSymbol: "0", moveDirection: "L", nextState: "q1", iswrite: true },
    { currentState: "q1", inputSymbol: "0", outputSymbol: "1", moveDirection: "S", nextState: "qAccept", iswrite: true },
    { currentState: "q1", inputSymbol: " ", outputSymbol: "1", moveDirection: "S", nextState: "qAccept", iswrite: true }
];
  
export const EvenorOddCheck: TransitionRule[] = [
    { currentState: "q0", inputSymbol: "0", nextState: "q0", moveDirection: "R", outputSymbol: "", iswrite: false },
    { currentState: "q0", inputSymbol: "1", nextState: "q0", moveDirection: "R", outputSymbol: "", iswrite: false },
    { currentState: "q0", inputSymbol: " ", nextState: "q1", moveDirection: "L", outputSymbol: "", iswrite: false },
    { currentState: "q1", inputSymbol: "0", nextState: "qEven", moveDirection: "S", outputSymbol: "", iswrite: false },
    { currentState: "q1", inputSymbol: "1", nextState: "qOdd", moveDirection: "S", outputSymbol: "", iswrite: false },
    { currentState: "qEven", inputSymbol: "0", nextState: "qAccept", moveDirection: "S", outputSymbol: "", iswrite: false },
    { currentState: "qOdd", inputSymbol: "1", nextState: "qAccept", moveDirection: "S", outputSymbol: "", iswrite: false }
]
    
export const BinaryPalindrome: TransitionRule[] = [
    // --- q0: 取左端第一个字符 ---
    { currentState: "q0", inputSymbol: "0", outputSymbol: " ", moveDirection: "R", nextState: "have0", iswrite: true },
    { currentState: "q0", inputSymbol: "1", outputSymbol: " ", moveDirection: "R", nextState: "have1", iswrite: true },
    { currentState: "q0", inputSymbol: " ", outputSymbol: "", moveDirection: "R", nextState: "qAccept", iswrite: false },
  
    // --- have0: 向右扫描到末尾，准备匹配 "0" ---
    { currentState: "have0", inputSymbol: "0", outputSymbol: "", moveDirection: "R", nextState: "have0", iswrite: false },
    { currentState: "have0", inputSymbol: "1", outputSymbol: "", moveDirection: "R", nextState: "have0", iswrite: false },
    { currentState: "have0", inputSymbol: " ", outputSymbol: "", moveDirection: "L", nextState: "match0", iswrite: false },
  
    // --- have1: 向右扫描到末尾，准备匹配 "1" ---
    { currentState: "have1", inputSymbol: "0", outputSymbol: "", moveDirection: "R", nextState: "have1", iswrite: false },
    { currentState: "have1", inputSymbol: "1", outputSymbol: "", moveDirection: "R", nextState: "have1", iswrite: false },
    { currentState: "have1", inputSymbol: " ", outputSymbol: "", moveDirection: "L", nextState: "match1", iswrite: false },
  
    // --- match0: 在最右端检查是否为 "0" ---
    { currentState: "match0", inputSymbol: "0", outputSymbol: " ", moveDirection: "L", nextState: "back", iswrite: true },
    { currentState: "match0", inputSymbol: "1", outputSymbol: "", moveDirection: "R", nextState: "qReject", iswrite: false },
    { currentState: "match0", inputSymbol: " ", outputSymbol: "", moveDirection: "S", nextState: "qAccept", iswrite: false },
  
    // --- match1: 在最右端检查是否为 "1" ---
    { currentState: "match1", inputSymbol: "1", outputSymbol: " ", moveDirection: "L", nextState: "back", iswrite: true },
    { currentState: "match1", inputSymbol: "0", outputSymbol: "", moveDirection: "R", nextState: "qReject", iswrite: false },
    { currentState: "match1", inputSymbol: " ", outputSymbol: "", moveDirection: "S", nextState: "qAccept", iswrite: false },
  
    // --- back: 返回左端下一个未处理字符 ---
    { currentState: "back", inputSymbol: "0", outputSymbol: "", moveDirection: "L", nextState: "back", iswrite: false },
    { currentState: "back", inputSymbol: "1", outputSymbol: "", moveDirection: "L", nextState: "back", iswrite: false },
    { currentState: "back", inputSymbol: " ", outputSymbol: "", moveDirection: "R", nextState: "q0", iswrite: false },
  
];
  
export const BinaryMultiply: TransitionRule[] = [
    // --- q0: 扫描到最左端空白，准备写入 "+" 前缀 ---
    { currentState: "q0", inputSymbol: "0", outputSymbol: "", moveDirection: "L", nextState: "init", iswrite: false },
    { currentState: "q0", inputSymbol: "1", outputSymbol: "", moveDirection: "L", nextState: "init", iswrite: false },
  
    // --- init: 在左端空白写入 "+" 并转到 right ---
    { currentState: "init", inputSymbol: " ", outputSymbol: "+", moveDirection: "R", nextState: "right", iswrite: true },
  
    // --- right: 向右扫到输入末尾（空白），然后进入读乘数最后一位 ---
    { currentState: "right", inputSymbol: "0", outputSymbol: "", moveDirection: "R", nextState: "right", iswrite: false },
    { currentState: "right", inputSymbol: "1", outputSymbol: "", moveDirection: "R", nextState: "right", iswrite: false },
    { currentState: "right", inputSymbol: "*", outputSymbol: "", moveDirection: "R", nextState: "right", iswrite: false },
    { currentState: "right", inputSymbol: " ", outputSymbol: "", moveDirection: "L", nextState: "readB", iswrite: false },
  
    // --- readB: 阅读并擦除乘数的最后一位 ---
    { currentState: "readB", inputSymbol: "0", outputSymbol: " ", moveDirection: "L", nextState: "doubleL", iswrite: true },
    { currentState: "readB", inputSymbol: "1", outputSymbol: " ", moveDirection: "L", nextState: "addA", iswrite: true },
  
    // --- addA: 如果读到 1，则进入加法器，将被加数加到累积和 ---
    { currentState: "addA", inputSymbol: "0", outputSymbol: "", moveDirection: "L", nextState: "addA", iswrite: false },
    { currentState: "addA", inputSymbol: "1", outputSymbol: "", moveDirection: "L", nextState: "addA", iswrite: false },
    { currentState: "addA", inputSymbol: "*", outputSymbol: "", moveDirection: "L", nextState: "read", iswrite: false },
  
    // --- doubleL: 双倍被加数（在末尾追加一个 0） ---
    { currentState: "doubleL", inputSymbol: "0", outputSymbol: "", moveDirection: "L", nextState: "doubleL", iswrite: false },
    { currentState: "doubleL", inputSymbol: "1", outputSymbol: "", moveDirection: "L", nextState: "doubleL", iswrite: false },
    { currentState: "doubleL", inputSymbol: "*", outputSymbol: "0", moveDirection: "R", nextState: "shift", iswrite: true },
  
    // --- double: 从加法器返回后，也要双倍被加数（在末尾追加 0） ---
    { currentState: "double", inputSymbol: "0", outputSymbol: "", moveDirection: "R", nextState: "double", iswrite: false },
    { currentState: "double", inputSymbol: "1", outputSymbol: "", moveDirection: "R", nextState: "double", iswrite: false },
    { currentState: "double", inputSymbol: "+", outputSymbol: "", moveDirection: "R", nextState: "double", iswrite: false },
    { currentState: "double", inputSymbol: "*", outputSymbol: "0", moveDirection: "R", nextState: "shift", iswrite: true },
  
    // --- shift: 将乘数整体右移一格，为下次迭代腾出低位 ---
    { currentState: "shift", inputSymbol: "0", outputSymbol: "*", moveDirection: "R", nextState: "shift0", iswrite: true },
    { currentState: "shift", inputSymbol: "1", outputSymbol: "*", moveDirection: "R", nextState: "shift1", iswrite: true },
    { currentState: "shift", inputSymbol: " ", outputSymbol: "", moveDirection: "L", nextState: "tidy", iswrite: false },
  
    // --- shift0: 在已写 "*" 之后继续右移并复制 0/1 ---
    { currentState: "shift0", inputSymbol: "0", outputSymbol: "", moveDirection: "R", nextState: "shift0", iswrite: false },
    { currentState: "shift0", inputSymbol: "1", outputSymbol: "0", moveDirection: "R", nextState: "shift1", iswrite: true },
    { currentState: "shift0", inputSymbol: " ", outputSymbol: "0", moveDirection: "R", nextState: "right", iswrite: true },
  
    // --- shift1: 在已写 "*" 之后继续右移并复制 0/1 ---
    { currentState: "shift1", inputSymbol: "0", outputSymbol: "1", moveDirection: "R", nextState: "shift0", iswrite: true },
    { currentState: "shift1", inputSymbol: "1", outputSymbol: "", moveDirection: "R", nextState: "shift1", iswrite: false },
    { currentState: "shift1", inputSymbol: " ", outputSymbol: "1", moveDirection: "R", nextState: "right", iswrite: true },
  
    // --- tidy: 清理乘数标记和前缀 "+"，准备结束 ---
    { currentState: "tidy", inputSymbol: "0", outputSymbol: " ", moveDirection: "L", nextState: "tidy", iswrite: true },
    { currentState: "tidy", inputSymbol: "1", outputSymbol: " ", moveDirection: "L", nextState: "tidy", iswrite: true },
    { currentState: "tidy", inputSymbol: "+", outputSymbol: " ", moveDirection: "L", nextState: "qAccept", iswrite: true },
  
    // --- qAccept: 停机（接受） ---
    // --- 从 addA 跳转过来进入“读 (read)”阶段，对被加数执行逐位加法 ----
    { currentState: "read", inputSymbol: "0", outputSymbol: "c", moveDirection: "L", nextState: "have0", iswrite: true },
    { currentState: "read", inputSymbol: "1", outputSymbol: "c", moveDirection: "L", nextState: "have1", iswrite: true },
    { currentState: "read", inputSymbol: "+", outputSymbol: "", moveDirection: "L", nextState: "rewrite", iswrite: false },

    // --- have0 和 have1: 根据读到的位不同进入不同加法子状态 ----
    { currentState: "have0", inputSymbol: "0", outputSymbol: "", moveDirection: "L", nextState: "have0", iswrite: false },
    { currentState: "have0", inputSymbol: "1", outputSymbol: "", moveDirection: "L", nextState: "have0", iswrite: false },
    { currentState: "have0", inputSymbol: "+", outputSymbol: "", moveDirection: "L", nextState: "add0", iswrite: false },

    { currentState: "have1", inputSymbol: "0", outputSymbol: "", moveDirection: "L", nextState: "have1", iswrite: false },
    { currentState: "have1", inputSymbol: "1", outputSymbol: "", moveDirection: "L", nextState: "have1", iswrite: false },
    { currentState: "have1", inputSymbol: "+", outputSymbol: "", moveDirection: "L", nextState: "add1", iswrite: false },

    // --- add0: 低位没有进位，0 + 0 或 0 + 1 ----
    // 如果遇到被加数数字 0 或 空格，写 O（代表 0），然后向右回到 marked “c” 处
    { currentState: "add0", inputSymbol: "0", outputSymbol: "O", moveDirection: "R", nextState: "back0", iswrite: true },
    { currentState: "add0", inputSymbol: " ", outputSymbol: "O", moveDirection: "R", nextState: "back0", iswrite: true },
    // 如果遇到被加数数字 1，写 I（代表 1），然后向右回到 marked “c” 处
    { currentState: "add0", inputSymbol: "1", outputSymbol: "I", moveDirection: "R", nextState: "back0", iswrite: true },
    // 遇到已经写过的 O 或 I，继续向左扫描
    { currentState: "add0", inputSymbol: "O", outputSymbol: "", moveDirection: "L", nextState: "add0", iswrite: false },
    { currentState: "add0", inputSymbol: "I", outputSymbol: "", moveDirection: "L", nextState: "add0", iswrite: false },

    // --- add1: 有低位进位，1 + 0 或 1 + 1 ----
    // 遇到被加数数字 0 或 空格，写 I，向右回去到“c”处
    { currentState: "add1", inputSymbol: "0", outputSymbol: "I", moveDirection: "R", nextState: "back1", iswrite: true },
    { currentState: "add1", inputSymbol: " ", outputSymbol: "I", moveDirection: "R", nextState: "back1", iswrite: true },
    // 遇到被加数数字 1，则写 O（1+1=0，且向更高位产生进位），然后向左进入 carry 处理进位
    { currentState: "add1", inputSymbol: "1", outputSymbol: "O", moveDirection: "L", nextState: "carry", iswrite: true },
    // 遇到 O 或 I，向左继续扫描
    { currentState: "add1", inputSymbol: "O", outputSymbol: "", moveDirection: "L", nextState: "add1", iswrite: false },
    { currentState: "add1", inputSymbol: "I", outputSymbol: "", moveDirection: "L", nextState: "add1", iswrite: false },

    // --- carry: 正在向左“进位”，将 1 加到更高一位 ----
    // 如果碰到被加数 0 或 空格，则写 “1” 并向右回去到“c”处
    { currentState: "carry", inputSymbol: "0", outputSymbol: "1", moveDirection: "R", nextState: "back1", iswrite: true },
    { currentState: "carry", inputSymbol: " ", outputSymbol: "1", moveDirection: "R", nextState: "back1", iswrite: true },
    // 如果碰到被加数 1，则写“0”(1+1=0)继续向左递归进位
    { currentState: "carry", inputSymbol: "1", outputSymbol: "0", moveDirection: "L", nextState: "carry", iswrite: true },

    // --- back0: 从加法结束处回到“c”(标记)  ----
    { currentState: "back0", inputSymbol: "0", outputSymbol: "", moveDirection: "R", nextState: "back0", iswrite: false },
    { currentState: "back0", inputSymbol: "1", outputSymbol: "", moveDirection: "R", nextState: "back0", iswrite: false },
    { currentState: "back0", inputSymbol: "O", outputSymbol: "", moveDirection: "R", nextState: "back0", iswrite: false },
    { currentState: "back0", inputSymbol: "I", outputSymbol: "", moveDirection: "R", nextState: "back0", iswrite: false },
    { currentState: "back0", inputSymbol: "+", outputSymbol: "", moveDirection: "R", nextState: "back0", iswrite: false },
    // 遇到标记 c 时，改写为 0 并回到 read 继续下一位
    { currentState: "back0", inputSymbol: "c", outputSymbol: "0", moveDirection: "L", nextState: "read", iswrite: true },

    // --- back1: 类似 back0，但写回 1 ----
    { currentState: "back1", inputSymbol: "0", outputSymbol: "", moveDirection: "R", nextState: "back1", iswrite: false },
    { currentState: "back1", inputSymbol: "1", outputSymbol: "", moveDirection: "R", nextState: "back1", iswrite: false },
    { currentState: "back1", inputSymbol: "O", outputSymbol: "", moveDirection: "R", nextState: "back1", iswrite: false },
    { currentState: "back1", inputSymbol: "I", outputSymbol: "", moveDirection: "R", nextState: "back1", iswrite: false },
    { currentState: "back1", inputSymbol: "+", outputSymbol: "", moveDirection: "R", nextState: "back1", iswrite: false },
    // 遇到标记 c 时，改写为 1 并回到 read
    { currentState: "back1", inputSymbol: "c", outputSymbol: "1", moveDirection: "L", nextState: "read", iswrite: true },

    // --- rewrite: 把临时用 O/I 标记的加法结果写回 0/1 ----
    { currentState: "rewrite", inputSymbol: "O", outputSymbol: "0", moveDirection: "L", nextState: "rewrite", iswrite: true },
    { currentState: "rewrite", inputSymbol: "I", outputSymbol: "1", moveDirection: "L", nextState: "rewrite", iswrite: true },
    { currentState: "rewrite", inputSymbol: "0", outputSymbol: "", moveDirection: "L", nextState: "rewrite", iswrite: false },
    { currentState: "rewrite", inputSymbol: "1", outputSymbol: "", moveDirection: "L", nextState: "rewrite", iswrite: false },
    // 扫到空格意味着重写完毕，进入 double 处理
    { currentState: "rewrite", inputSymbol: " ", outputSymbol: "", moveDirection: "R", nextState: "double", iswrite: false },

    // --- double: 对被加数执行“末尾补 0”操作 ----
    { currentState: "double", inputSymbol: "0", outputSymbol: "", moveDirection: "R", nextState: "double", iswrite: false },
    { currentState: "double", inputSymbol: "1", outputSymbol: "", moveDirection: "R", nextState: "double", iswrite: false },
    { currentState: "double", inputSymbol: "+", outputSymbol: "", moveDirection: "R", nextState: "double", iswrite: false },
    { currentState: "double", inputSymbol: "*", outputSymbol: "0", moveDirection: "R", nextState: "shift", iswrite: true },

];
  
export const DivisableBy3: TransitionRule[] = [
    // --- q0: 余数 0 ---
    { currentState: "q0", inputSymbol: "0", outputSymbol: "0", moveDirection: "R", nextState: "q0", iswrite: true },
    { currentState: "q0", inputSymbol: "1", outputSymbol: "1", moveDirection: "R", nextState: "q1", iswrite: true },
    { currentState: "q0", inputSymbol: " ", outputSymbol: " ", moveDirection: "S", nextState: "qAccept", iswrite: true },

    // --- q1: 余数 1 ---
    { currentState: "q1", inputSymbol: "0", outputSymbol: "0", moveDirection: "R", nextState: "q2", iswrite: true },
    { currentState: "q1", inputSymbol: "1", outputSymbol: "1", moveDirection: "R", nextState: "q0", iswrite: true },
    { currentState: "q1", inputSymbol: " ", outputSymbol: " ", moveDirection: "S", nextState: "qReject", iswrite: true },

    // --- q2: 余数 2 ---
    { currentState: "q2", inputSymbol: "0", outputSymbol: "0", moveDirection: "R", nextState: "q1", iswrite: true },
    { currentState: "q2", inputSymbol: "1", outputSymbol: "1", moveDirection: "R", nextState: "q2", iswrite: true },
    { currentState: "q2", inputSymbol: " ", outputSymbol: " ", moveDirection: "S", nextState: "qReject", iswrite: true },

  // --- qAccept 与 qReject: 停机（接受/拒绝） ---
]