package com.example.webpj.entity;
import lombok.Data;

@Data
public class Transition {
    private String currentState;
    private String inputSymbol;
    private String newState;
    private String writeSymbol;
    private String moveDirection; // "L", "R", or "S" for stay

    // 增强toString()用于调试信息
    @Override
    public String toString() {
        return String.format("f(%s,%s)=(%s,%s,%s)",
                currentState,
                inputSymbol,
                newState,
                writeSymbol,
                moveDirection);
    }

    // 新增解析方法
    public static Transition fromString(String transitionStr) {
        // 实现从字符串解析的逻辑
        // 示例：f(q0,0)=(q1,1,R) → Transition对象
        return new Transition();
    }
}

