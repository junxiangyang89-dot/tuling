package com.example.webpj.mapper;

import com.example.webpj.entity.GameMode;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface GameModeMapper {
    GameMode selectById(Long id);
    List<GameMode> selectAll();
    GameMode selectByModeName(String modeName);
    int insert(GameMode gameMode);
    int update(GameMode gameMode);
    int deleteById(Long id);
} 