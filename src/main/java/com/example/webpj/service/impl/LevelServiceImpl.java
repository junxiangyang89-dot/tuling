package com.example.webpj.service.impl;

import com.example.webpj.entity.Level;
import com.example.webpj.mapper.LevelMapper;
import com.example.webpj.service.LevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LevelServiceImpl implements LevelService {
    private final LevelMapper mapper;

    @Override
    @Transactional
    public Long createLevel(Level level) {
        level.setCreateTime(LocalDateTime.now());
        level.setUpdateTime(LocalDateTime.now());
        mapper.insert(level);
        return level.getId();
    }

    @Override
    public Level getById(Long id) {
        return mapper.selectById(id);
    }

    @Override
    public List<Level> getAll() {
        return mapper.selectAll();
    }
}
