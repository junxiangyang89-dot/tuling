export interface ChallengeTestcase {
  id: string;
  title: string;
  description:string;
  testcase: { input: string; answer: string }[];
}

export const CHALLENGE_TESTCASES: ChallengeTestcase[] = [
  {
    id: 'tc1',
    title: '01镜像',
    description: '将0变为1，1变为0，实现镜像翻转',
    // rules:[
    //   // q0: 向右查找 _
    //   { currentState: "q0", inputSymbol: "0", outputSymbol: "0", moveDirection: "R", nextState: "q0", iswrite: true },
    //   { currentState: "q0", inputSymbol: "1", outputSymbol: "1", moveDirection: "R", nextState: "q0", iswrite: true },
    //   { currentState: "q0", inputSymbol: " ", outputSymbol: "", moveDirection: "R", nextState: "qAccept", iswrite: false }
    // ],
      testcase: [
        { input: "001", answer: "110" },
        { input: "010", answer: "101" },
        { input: "11111", answer: "00000" }]
  },
  { id: 'tc2',
    title: '二进制加法',
    description: '给定两个二进制数，用+号连接，计算它们的和（如10+11=101）',
    // rules:[
    //   // --- qRight: 从第二个数的最右端开始向右移动，遇空格转到 qRead ---
    //   { currentState: "qRight", inputSymbol: "0", writeSymbol: "0", moveDirection: "R", nextState: "qRight", iswrite: true },
    //   { currentState: "qRight", inputSymbol: "1", writeSymbol: "1", moveDirection: "R", nextState: "qRight", iswrite: true },
    //   { currentState: "qRight", inputSymbol: "+", writeSymbol: "+", moveDirection: "R", nextState: "qRight", iswrite: true },
    //   { currentState: "qRight", inputSymbol: " ", writeSymbol: " ", moveDirection: "L", nextState: "qRead", iswrite: true },
    
    //   // --- qRead: 读取第二个数当前位，用 c 标记，移到 qHave0 或 qHave1 或 qRewrite ---
    //   { currentState: "qRead", inputSymbol: "0", writeSymbol: "c", moveDirection: "L", nextState: "qHave0", iswrite: true },
    //   { currentState: "qRead", inputSymbol: "1", writeSymbol: "c", moveDirection: "L", nextState: "qHave1", iswrite: true },
    //   { currentState: "qRead", inputSymbol: "+", writeSymbol: " ", moveDirection: "L", nextState: "qRewrite", iswrite: true },
    
    //   // --- qHave0: 第二个数当前位为 0，继续向左扫至 '+' ----
    //   { currentState: "qHave0", inputSymbol: "0", writeSymbol: "0", moveDirection: "L", nextState: "qHave0", iswrite: true },
    //   { currentState: "qHave0", inputSymbol: "1", writeSymbol: "1", moveDirection: "L", nextState: "qHave0", iswrite: true },
    //   { currentState: "qHave0", inputSymbol: "+", writeSymbol: "+", moveDirection: "L", nextState: "qAdd0", iswrite: true },
    
    //   // --- qHave1: 第二个数当前位为 1，继续向左扫至 '+' ----
    //   { currentState: "qHave1", inputSymbol: "0", writeSymbol: "0", moveDirection: "L", nextState: "qHave1", iswrite: true },
    //   { currentState: "qHave1", inputSymbol: "1", writeSymbol: "1", moveDirection: "L", nextState: "qHave1", iswrite: true },
    //   { currentState: "qHave1", inputSymbol: "+", writeSymbol: "+", moveDirection: "L", nextState: "qAdd1", iswrite: true },
    
    //   // --- qAdd0: 低位无进位，0 + 0 或 0 + 1 ----
    //   { currentState: "qAdd0", inputSymbol: "0", writeSymbol: "O", moveDirection: "R", nextState: "qBack0", iswrite: true },
    //   { currentState: "qAdd0", inputSymbol: " ", writeSymbol: "O", moveDirection: "R", nextState: "qBack0", iswrite: true },
    //   { currentState: "qAdd0", inputSymbol: "1", writeSymbol: "I", moveDirection: "R", nextState: "qBack0", iswrite: true },
    //   { currentState: "qAdd0", inputSymbol: "O", writeSymbol: "O", moveDirection: "L", nextState: "qAdd0", iswrite: false },
    //   { currentState: "qAdd0", inputSymbol: "I", writeSymbol: "I", moveDirection: "L", nextState: "qAdd0", iswrite: false },
    
    //   // --- qAdd1: 低位有进位，1 + 0 或 1 + 1 ----
    //   { currentState: "qAdd1", inputSymbol: "0", writeSymbol: "I", moveDirection: "R", nextState: "qBack1", iswrite: true },
    //   { currentState: "qAdd1", inputSymbol: " ", writeSymbol: "I", moveDirection: "R", nextState: "qBack1", iswrite: true },
    //   { currentState: "qAdd1", inputSymbol: "1", writeSymbol: "O", moveDirection: "L", nextState: "qCarry", iswrite: true },
    //   { currentState: "qAdd1", inputSymbol: "O", writeSymbol: "O", moveDirection: "L", nextState: "qAdd1", iswrite: false },
    //   { currentState: "qAdd1", inputSymbol: "I", writeSymbol: "I", moveDirection: "L", nextState: "qAdd1", iswrite: false },
    
    //   // --- qCarry: 处理向更高位的进位 ----
    //   { currentState: "qCarry", inputSymbol: "0", writeSymbol: "1", moveDirection: "R", nextState: "qBack1", iswrite: true },
    //   { currentState: "qCarry", inputSymbol: " ", writeSymbol: "1", moveDirection: "R", nextState: "qBack1", iswrite: true },
    //   { currentState: "qCarry", inputSymbol: "1", writeSymbol: "0", moveDirection: "L", nextState: "qCarry", iswrite: true },
    
    //   // --- qBack0: 从加法结束处向右移动，直到遇到标记 c，再写回 0 并返回 qRead ----
    //   { currentState: "qBack0", inputSymbol: "0", writeSymbol: "0", moveDirection: "R", nextState: "qBack0", iswrite: false },
    //   { currentState: "qBack0", inputSymbol: "1", writeSymbol: "1", moveDirection: "R", nextState: "qBack0", iswrite: false },
    //   { currentState: "qBack0", inputSymbol: "O", writeSymbol: "O", moveDirection: "R", nextState: "qBack0", iswrite: false },
    //   { currentState: "qBack0", inputSymbol: "I", writeSymbol: "I", moveDirection: "R", nextState: "qBack0", iswrite: false },
    //   { currentState: "qBack0", inputSymbol: "+", writeSymbol: "+", moveDirection: "R", nextState: "qBack0", iswrite: false },
    //   { currentState: "qBack0", inputSymbol: "c", writeSymbol: "0", moveDirection: "L", nextState: "qRead", iswrite: true },
    
    //   // --- qBack1: 类似 qBack0，但写回 1 ----
    //   { currentState: "qBack1", inputSymbol: "0", writeSymbol: "0", moveDirection: "R", nextState: "qBack1", iswrite: false },
    //   { currentState: "qBack1", inputSymbol: "1", writeSymbol: "1", moveDirection: "R", nextState: "qBack1", iswrite: false },
    //   { currentState: "qBack1", inputSymbol: "O", writeSymbol: "O", moveDirection: "R", nextState: "qBack1", iswrite: false },
    //   { currentState: "qBack1", inputSymbol: "I", writeSymbol: "I", moveDirection: "R", nextState: "qBack1", iswrite: false },
    //   { currentState: "qBack1", inputSymbol: "+", writeSymbol: "+", moveDirection: "R", nextState: "qBack1", iswrite: false },
    //   { currentState: "qBack1", inputSymbol: "c", writeSymbol: "1", moveDirection: "L", nextState: "qRead", iswrite: true },
    
    //   // --- qRewrite: 将标记 O/I 重写为 0/1，直到遇到空格后转到 qDone ----
    //   { currentState: "qRewrite", inputSymbol: "O", writeSymbol: "0", moveDirection: "L", nextState: "qRewrite", iswrite: true },
    //   { currentState: "qRewrite", inputSymbol: "I", writeSymbol: "1", moveDirection: "L", nextState: "qRewrite", iswrite: true },
    //   { currentState: "qRewrite", inputSymbol: "0", writeSymbol: "0", moveDirection: "L", nextState: "qRewrite", iswrite: false },
    //   { currentState: "qRewrite", inputSymbol: "1", writeSymbol: "1", moveDirection: "L", nextState: "qRewrite", iswrite: false },
    //   { currentState: "qRewrite", inputSymbol: " ", writeSymbol: " ", moveDirection: "R", nextState: "qDone", iswrite: true },
    
    //   // --- qDone: 最终将结果保留，停机到 qAccept ----
    //   { currentState: "qDone", inputSymbol: "0", writeSymbol: "0", moveDirection: "S", nextState: "qAccept", iswrite: true },
    //   { currentState: "qDone", inputSymbol: "1", writeSymbol: "1", moveDirection: "S", nextState: "qAccept", iswrite: true },
    //   { currentState: "qDone", inputSymbol: "+", writeSymbol: "+", moveDirection: "S", nextState: "qAccept", iswrite: true },
    //   { currentState: "qDone", inputSymbol: "*", writeSymbol: "*", moveDirection: "S", nextState: "qAccept", iswrite: true },
    //   { currentState: "qDone", inputSymbol: " ", writeSymbol: " ", moveDirection: "S", nextState: "qAccept", iswrite: true },
    
    //   // --- qAccept: 接受态，停机 ---
    // ], 
    testcase: [
      { input: "10+11", answer: "101" },
      { input: "0+0", answer: "0" },
      { input: "1101+100", answer: "1001" }
    ] },
  { id: 'tc3',
    title: '移除所有0',
    description: '从输入中删除所有0，仅保留1',
    // rules:[
    //   { currentState: "q0", inputSymbol: "0", outputSymbol: " ", moveDirection: "R", nextState: "q0", iswrite: true },
    //   { currentState: "q0", inputSymbol: "1", outputSymbol: "1", moveDirection: "R", nextState: "q0", iswrite: true },
    //   { currentState: "q0", inputSymbol: " ", outputSymbol: " ", moveDirection: "S", nextState: "qAccept", iswrite: false }
    // ],
    testcase: [
      { input: "000", answer: "   " },
      { input: "101", answer: "1 1" },
      { input: "0101", answer: " 1 1" },
    ] },
  { id: 'tc4',
    title: '替换0为1',
    description: '将输入中的0全部替换为1',
    // rules:[
    //   { currentState: "q0", inputSymbol: "0", outputSymbol: "1", moveDirection: "R", nextState: "q0", iswrite: true },
    //   { currentState: "q0", inputSymbol: "1", outputSymbol: "1", moveDirection: "R", nextState: "q0", iswrite: true },
    //   { currentState: "q0", inputSymbol: " ", outputSymbol: " ", moveDirection: "S", nextState: "qAccept", iswrite: false }
    // ],
    testcase: [
      { input: "101", answer: "111" },
      { input: "1111", answer: "1111" },
      { input: "0011", answer: "1111" },
    ] },
  { id: 'tc5',
    title: '翻转带',
    description: '将输入带反转（如100变为001）',
    // rules:[
    //   // 初始向右找空格，标记为末尾
    //   { currentState: "q0", inputSymbol: "0", outputSymbol: "0", moveDirection: "R", nextState: "q0", iswrite: false },
    //   { currentState: "q0", inputSymbol: "1", outputSymbol: "1", moveDirection: "R", nextState: "q0", iswrite: false },
    //   { currentState: "q0", inputSymbol: " ", outputSymbol: " ", moveDirection: "L", nextState: "q1", iswrite: false },
    //
    //   // 从尾部开始向前读取并写入缓存区
    //   { currentState: "q1", inputSymbol: "0", outputSymbol: " ", moveDirection: "L", nextState: "w0", iswrite: true },
    //   { currentState: "q1", inputSymbol: "1", outputSymbol: " ", moveDirection: "L", nextState: "w1", iswrite: true },
    //   { currentState: "q1", inputSymbol: " ", outputSymbol: " ", moveDirection: "R", nextState: "qAccept", iswrite: false },
    //
    //   // 写回 0 或 1
    //   { currentState: "w0", inputSymbol: " ", outputSymbol: "0", moveDirection: "R", nextState: "q1", iswrite: true },
    //   { currentState: "w1", inputSymbol: " ", outputSymbol: "1", moveDirection: "R", nextState: "q1", iswrite: true }
    // ],
    testcase: [
      { input: "111", answer: "111" },
      { input: "100", answer: "001" }
    ]
  }
];
