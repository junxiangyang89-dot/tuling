package com.example.webpj.service.impl;

import com.example.webpj.entity.ChallengeQuestion;
import com.example.webpj.mapper.ChallengeQuestionMapper;
import com.example.webpj.service.ChallengeQuestionService;
import com.example.webpj.service.LevelService;
import com.example.webpj.entity.Level;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChallengeQuestionServiceImpl implements ChallengeQuestionService {
    private final ChallengeQuestionMapper mapper;
    private final LevelService levelService;

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
        ChallengeQuestion question = mapper.selectById(id);
        if (question != null) {
            question.setScore(score);
            question.setComment(comment);
            question.setUpdateTime(LocalDateTime.now());
            mapper.update(question);
        }
    }

    @Override
    @Transactional
    public void updateQuestionSampleStatus(Long id, Boolean isSample) {
        ChallengeQuestion question = mapper.selectById(id);
        if (question != null) {
            question.setIsSample(isSample);
            question.setUpdateTime(LocalDateTime.now());
            mapper.update(question);
        }
    }

    @Override
    public List<ChallengeQuestion> getExcellentAssignments() {
        List<ChallengeQuestion> allQuestions = mapper.selectAll();
        // 过滤出标记为优秀的作业
        return allQuestions.stream()
                .filter(question -> Boolean.TRUE.equals(question.getIsSample()))
                .toList();
    }

    // 当题目被审批通过时，将其转换为 Level 并插入 level 表
    @Transactional
    public void approveAndCreateLevel(Long id) {
        ChallengeQuestion q = mapper.selectById(id);
        if (q == null) return;
        // 只在当前状态为 PENDING 时处理
        if (!"PENDING".equalsIgnoreCase(q.getStatus())) return;

        // 更新为 APPROVED
        mapper.updateStatus(id, "APPROVED");

        // 构造 Level
        try {
            Level level = new Level();
            level.setName(q.getTitle());
            level.setDescription(q.getDescription());
            level.setModeType("CHALLENGE");
            level.setDifficulty(3); // 默认难度，可以改为前端指定
            level.setInitialState("");
            level.setTargetState("");
            level.setHints("");
            level.setSolution(q.getTestcaseJson());
            level.setOrderNum(0);
            level.setIsLocked(false);

            Long newLevelId = levelService.createLevel(level);
            System.out.println("已将题目 ID=" + id + " 发布为 Level ID=" + newLevelId);
        } catch (Exception e) {
            System.err.println("将题目转换为 Level 失败: " + e.getMessage());
        }
    }
}
