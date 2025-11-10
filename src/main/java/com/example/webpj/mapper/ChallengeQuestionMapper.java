package com.example.webpj.mapper;

import com.example.webpj.entity.ChallengeQuestion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ChallengeQuestionMapper {
    List<ChallengeQuestion> selectAll();
    List<ChallengeQuestion> selectByStatus(@Param("status") String status);
    ChallengeQuestion selectById(Long id);
    int insert(ChallengeQuestion question);
    int update(ChallengeQuestion question);
    int deleteById(Long id);
    int updateStatus(@Param("id") Long id, @Param("status") String status);
}
