package com.example.webpj.service;

import com.example.webpj.entity.TuringMachine;
import com.example.webpj.dto.TuringMachineDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

public interface TuringMachineService {
    TuringMachine createTuringMachine(TuringMachine turingMachine);
    TuringMachine updateTuringMachine(Long id, TuringMachineDTO turingMachineDTO);
    TuringMachine getTuringMachineById(Long id);
    List<TuringMachine> getTuringMachinesByUserId(Long userId);
    boolean deleteTuringMachine(Long id);
    
    // 修复历史数据的模式字段
    void fixHistoricalModeData();
    
    // 获取所有图灵机（用于数据修复）
    List<TuringMachine> getAllTuringMachines();
}