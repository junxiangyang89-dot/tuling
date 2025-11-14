package com.example.webpj.service;

import com.example.webpj.entity.Level;

import java.util.List;

public interface LevelService {
    Long createLevel(Level level);
    Level getById(Long id);
    List<Level> getAll();
}
