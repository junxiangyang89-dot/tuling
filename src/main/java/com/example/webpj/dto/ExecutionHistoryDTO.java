package com.example.webpj.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
public class ExecutionHistoryDTO {
    private String stepId;
    private String tapeState;
    private int headPosition;
    private String currentState;
    private String transitionUsed;
    private String timestamp;

    public ExecutionHistoryDTO(String stepId, String tapeState, int headPosition,
                               String currentState, String transitionUsed, LocalDateTime timestamp) {
        this.stepId = stepId;
        this.tapeState = tapeState;
        this.headPosition = headPosition;
        this.currentState = currentState;
        this.transitionUsed = transitionUsed;
        this.timestamp = timestamp.format(DateTimeFormatter.ISO_LOCAL_TIME);
    }

    // Getters
    public String getStepId() {
        return stepId;
    }

    public String getTapeState() {
        return tapeState;
    }

    public int getHeadPosition() {
        return headPosition;
    }

    public String getCurrentState() {
        return currentState;
    }

    public String getTransitionUsed() {
        return transitionUsed;
    }

    public String getTimestamp() {
        return timestamp;
    }

    // toString() 方法（可选）
    @Override
    public String toString() {
        return "ExecutionHistoryDTO{" +
                "stepId='" + stepId + '\'' +
                ", tapeState='" + tapeState + '\'' +
                ", headPosition=" + headPosition +
                ", currentState='" + currentState + '\'' +
                ", transitionUsed='" + transitionUsed + '\'' +
                ", timestamp='" + timestamp + '\'' +
                '}';
    }
}
