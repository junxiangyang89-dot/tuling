package com.example.webpj.service.impl;

import com.example.webpj.entity.GameMode;
import com.example.webpj.mapper.GameModeMapper;
import com.example.webpj.service.GameModeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GameModeServiceImpl implements GameModeService {
    private final GameModeMapper gameModeMapper;

    @Override
    public GameMode getGameModeById(Long id) {
        return gameModeMapper.selectById(id);
    }

    @Override
    public List<GameMode> getAllGameModes() {
        return gameModeMapper.selectAll();
    }

    @Override
    public GameMode getGameModeByName(String modeName) {
        return gameModeMapper.selectByModeName(modeName);
    }

    @Override
    @Transactional
    public void createGameMode(GameMode gameMode) {
        gameMode.setCreateTime(LocalDateTime.now());
        gameMode.setUpdateTime(LocalDateTime.now());
        gameModeMapper.insert(gameMode);
    }

    @Override
    @Transactional
    public void updateGameMode(GameMode gameMode) {
        gameMode.setUpdateTime(LocalDateTime.now());
        gameModeMapper.update(gameMode);
    }

    @Override
    @Transactional
    public void deleteGameMode(Long id) {
        gameModeMapper.deleteById(id);
    }

    @Override
    @Transactional
    public void switchGameMode(String modeName) {
        // 先将所有模式设置为非激活
        List<GameMode> allModes = gameModeMapper.selectAll();
        for (GameMode mode : allModes) {
            mode.setIsActive(false);
            mode.setUpdateTime(LocalDateTime.now());
            gameModeMapper.update(mode);
        }

        // 将目标模式设置为激活
        GameMode targetMode = gameModeMapper.selectByModeName(modeName);
        if (targetMode != null) {
            targetMode.setIsActive(true);
            targetMode.setUpdateTime(LocalDateTime.now());
            gameModeMapper.update(targetMode);
        }
    }
} 