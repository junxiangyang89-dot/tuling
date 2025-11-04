package com.example.webpj.dto;
import lombok.Data;
import java.util.List;

@Data
public class ExecutionResponseDTO {
    private String tapeContent;
    private int headPosition;
    private String currentState;
    private boolean isHalted;
    private boolean isAccepted;
    private String message;
    private String stepId;
    private List<String> availableTransitions;

    // Getters and Setters
    public String getTapeContent() {
        return tapeContent;
    }

    public void setTapeContent(String tapeContent) {
        this.tapeContent = tapeContent;
    }

    public int getHeadPosition() {
        return headPosition;
    }

    public void setHeadPosition(int headPosition) {
        this.headPosition = headPosition;
    }

    public String getCurrentState() {
        return currentState;
    }

    public void setCurrentState(String currentState) {
        this.currentState = currentState;
    }

    public boolean isHalted() {
        return isHalted;
    }

    public void setHalted(boolean halted) {
        isHalted = halted;
    }

    public boolean isAccepted() {
        return isAccepted;
    }

    public void setAccepted(boolean accepted) {
        isAccepted = accepted;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStepId() {
        return stepId;
    }

    public void setStepId(String stepId) {
        this.stepId = stepId;
    }

    public List<String> getAvailableTransitions() {
        return availableTransitions;
    }

    public void setAvailableTransitions(List<String> availableTransitions) {
        this.availableTransitions = availableTransitions;
    }

    // Builder模式（可选）
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final ExecutionResponseDTO response = new ExecutionResponseDTO();

        public Builder tapeContent(String tapeContent) {
            response.tapeContent = tapeContent;
            return this;
        }

        public Builder headPosition(int headPosition) {
            response.headPosition = headPosition;
            return this;
        }

        // 其他字段的builder方法...

        public ExecutionResponseDTO build() {
            return response;
        }
    }
}