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
}
