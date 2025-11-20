package com.example.webpj.service.impl;

import com.example.webpj.entity.ChallengeQuestion;
import com.example.webpj.mapper.ChallengeQuestionMapper;
import com.example.webpj.service.ChallengeQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChallengeQuestionServiceImpl implements ChallengeQuestionService {
    private final ChallengeQuestionMapper mapper;

    @Override
    public List<ChallengeQuestion> getAllQuestions() {
        return mapper.selectAll();
    }

    @Override
    public List<ChallengeQuestion> getQuestionsByStatus(String status) {
        return mapper.selectByStatus(status);
    }

    @Override
    public ChallengeQuestion getById(Long id) {
        return mapper.selectById(id);
    }

    @Override
    @Transactional
    public Long createQuestion(ChallengeQuestion question) {
        question.setCreateTime(LocalDateTime.now());
        question.setUpdateTime(LocalDateTime.now());
        if (question.getStatus() == null) {
            question.setStatus("PENDING");
        }
        mapper.insert(question);
        return question.getId();
    }

    @Override
    @Transactional
    public void deleteQuestion(Long id) {
        mapper.deleteById(id);
    }

    @Override
    @Transactional
    public void updateStatus(Long id, String status) {
        mapper.updateStatus(id, status);
    }

    @Override
    @Transactional
    public void updateQuestionEvaluation(Long id, Integer score, String comment) {
        ChallengeQuestion q = mapper.selectById(id);
        if (q == null) return;
        q.setScore(score);
        q.setComment(comment);
        q.setUpdateTime(LocalDateTime.now());
        mapper.update(q);
    }

    @Override
    @Transactional
    public void updateQuestionSampleStatus(Long id, Boolean isSample) {
        ChallengeQuestion q = mapper.selectById(id);
        if (q == null) return;
        q.setIsSample(isSample);
        q.setUpdateTime(LocalDateTime.now());
        mapper.update(q);
    }

    @Override
    public List<ChallengeQuestion> getExcellentAssignments() {
        // 先获取已通过的题目，再筛选出标记为优秀的
        List<ChallengeQuestion> approved = mapper.selectByStatus("APPROVED");
        if (approved == null) return List.of();
        return approved.stream().filter(q -> q.getIsSample() != null && q.getIsSample()).toList();
    }
}
