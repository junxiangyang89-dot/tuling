package com.example.webpj.service;

import com.example.webpj.entity.GameMode;
import java.util.List;

public interface GameModeService {
    GameMode getGameModeById(Long id);
    List<GameMode> getAllGameModes();
    GameMode getGameModeByName(String modeName);
    void createGameMode(GameMode gameMode);
    void updateGameMode(GameMode gameMode);
    void deleteGameMode(Long id);
    void switchGameMode(String modeName);
} 