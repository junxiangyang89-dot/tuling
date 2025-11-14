package com.example.webpj.service;

import com.example.webpj.entity.ChallengeQuestion;
import java.util.List;

public interface ChallengeQuestionService {
    List<ChallengeQuestion> getAllQuestions();
    List<ChallengeQuestion> getQuestionsByStatus(String status);
    ChallengeQuestion getById(Long id);
    Long createQuestion(ChallengeQuestion question);
    void deleteQuestion(Long id);
    void updateStatus(Long id, String status);
    
    // 优秀作业相关方法
    void updateQuestionEvaluation(Long id, Integer score, String comment);
    void updateQuestionSampleStatus(Long id, Boolean isSample);
    List<ChallengeQuestion> getExcellentAssignments();
}
