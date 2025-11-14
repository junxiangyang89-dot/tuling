package com.example.webpj.mapper;

import com.example.webpj.entity.Level;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface LevelMapper {
    int insert(Level level);
    Level selectById(Long id);
    List<Level> selectAll();
}
