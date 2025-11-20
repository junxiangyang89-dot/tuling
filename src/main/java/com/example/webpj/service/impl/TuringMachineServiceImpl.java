package com.example.webpj.service.impl;

import com.example.webpj.entity.TuringMachine;
import com.example.webpj.dto.TuringMachineDTO;
import com.example.webpj.mapper.TuringMachineMapper;
import com.example.webpj.service.TuringMachineService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TuringMachineServiceImpl implements TuringMachineService {

    @Autowired
    private TuringMachineMapper turingMachineMapper;
    
    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public TuringMachine createTuringMachine(TuringMachine turingMachine) {
        // 设置创建和更新时间
        LocalDateTime now = LocalDateTime.now();
        turingMachine.setCreateTime(now);
        turingMachine.setUpdateTime(now);
        
        // 默认值设置
        if (turingMachine.getHeadPosition() == null) {
            turingMachine.setHeadPosition(0);
        }
        
        if (turingMachine.getIsCompleted() == null) {
            turingMachine.setIsCompleted(false);
        }
        
        // 插入数据库
        turingMachineMapper.insert(turingMachine);
        return turingMachine;
    }

    @Override
    public TuringMachine updateTuringMachine(Long id, TuringMachineDTO turingMachineDTO) {
        // 先获取原有记录
        TuringMachine existingMachine = turingMachineMapper.findById(id);
        if (existingMachine == null) {
            return null;
        }
        
        // 更新字段
        if (turingMachineDTO.getName() != null) {
            existingMachine.setName(turingMachineDTO.getName());
        }
        
        if (turingMachineDTO.getDescription() != null) {
            existingMachine.setDescription(turingMachineDTO.getDescription());
        }
        
        if (turingMachineDTO.getTape() != null) {
            existingMachine.setTape(turingMachineDTO.getTape());
        }
        
        if (turingMachineDTO.getHeadPosition() != null) {
            existingMachine.setHeadPosition(turingMachineDTO.getHeadPosition());
        }
        
        if (turingMachineDTO.getCurrentState() != null) {
            existingMachine.setCurrentState(turingMachineDTO.getCurrentState());
        }
        
        if (turingMachineDTO.getConfiguration() != null) {
            existingMachine.setConfiguration(turingMachineDTO.getConfiguration());
        }

        // 如果重命名或更新描述，确保 configuration JSON 中同步更新 name/description
        try {
            boolean configUpdated = false;
            java.util.Map<String, Object> configMap = null;
            if (existingMachine.getConfiguration() != null && !existingMachine.getConfiguration().isEmpty()) {
                configMap = objectMapper.readValue(existingMachine.getConfiguration(), java.util.Map.class);
            } else {
                configMap = new java.util.HashMap<>();
            }

            if (turingMachineDTO.getName() != null) {
                configMap.put("name", turingMachineDTO.getName());
                configUpdated = true;
            }
            if (turingMachineDTO.getDescription() != null) {
                configMap.put("description", turingMachineDTO.getDescription());
                configUpdated = true;
            }

            if (configUpdated) {
                existingMachine.setConfiguration(objectMapper.writeValueAsString(configMap));
            }
        } catch (Exception e) {
            // 如果配置解析失败，记录但不中断更新流程
            System.err.println("更新 configuration 时出错: " + e.getMessage());
        }
        
        if (turingMachineDTO.getIsCompleted() != null) {
            existingMachine.setIsCompleted(turingMachineDTO.getIsCompleted());
        }
        
        // 更新时间
        existingMachine.setUpdateTime(LocalDateTime.now());
        
        // 执行更新
        turingMachineMapper.update(existingMachine);
        return existingMachine;
    }

    @Override
    public TuringMachine getTuringMachineById(Long id) {
        return turingMachineMapper.findById(id);
    }

    @Override
    public List<TuringMachine> getTuringMachinesByUserId(Long userId) {
        return turingMachineMapper.findByUserId(userId);
    }

    @Override
    public boolean deleteTuringMachine(Long id) {
        return turingMachineMapper.deleteById(id) > 0;
    }

    @Override
    public void fixHistoricalModeData() {
        System.out.println("开始修复历史数据的模式字段...");
        
        // 获取所有图灵机
        List<TuringMachine> allMachines = getAllTuringMachines();
        int fixedCount = 0;
        
        for (TuringMachine machine : allMachines) {
            try {
                String config = machine.getConfiguration();
                if (config != null && !config.isEmpty()) {
                    // 解析配置
                    java.util.Map<String, Object> configMap = objectMapper.readValue(config, java.util.Map.class);
                    
                    // 检查是否缺少mode字段
                    if (!configMap.containsKey("mode")) {
                        // 根据图灵机名称或其他特征推断模式
                        String inferredMode = inferModeFromMachine(machine, configMap);
                        
                        // 添加mode字段
                        configMap.put("mode", inferredMode);
                        
                        // 更新配置
                        String updatedConfig = objectMapper.writeValueAsString(configMap);
                        machine.setConfiguration(updatedConfig);
                        machine.setUpdateTime(LocalDateTime.now());
                        
                        // 保存到数据库
                        turingMachineMapper.update(machine);
                        
                        System.out.println("修复图灵机ID: " + machine.getId() + 
                                         ", 推断模式: " + inferredMode);
                        fixedCount++;
                    }
                }
            } catch (Exception e) {
                System.err.println("修复图灵机ID " + machine.getId() + " 时出错: " + e.getMessage());
            }
        }
        
        System.out.println("历史数据修复完成，共修复 " + fixedCount + " 条记录");
    }
    
    @Override
    public List<TuringMachine> getAllTuringMachines() {
        return turingMachineMapper.findAll();
    }
    
    /**
     * 根据图灵机的特征推断模式
     */
    private String inferModeFromMachine(TuringMachine machine, java.util.Map<String, Object> configMap) {
        // 推断逻辑：
        // 1. 如果名称包含"challenge"或"挑战"，推断为challenge-mode
        // 2. 如果名称包含"learning"或"学习"，推断为learning-mode
        // 3. 其他情况默认为free-mode
        
        String name = machine.getName();
        String description = machine.getDescription();
        
        if (name != null) {
            String lowerName = name.toLowerCase();
            if (lowerName.contains("challenge") || lowerName.contains("挑战")) {
                return "challenge-mode";
            }
            if (lowerName.contains("learning") || lowerName.contains("学习")) {
                return "learning-mode";
            }
        }
        
        if (description != null) {
            String lowerDesc = description.toLowerCase();
            if (lowerDesc.contains("challenge") || lowerDesc.contains("挑战")) {
                return "challenge-mode";
            }
            if (lowerDesc.contains("learning") || lowerDesc.contains("学习")) {
                return "learning-mode";
            }
        }
        
        // 检查配置中是否有特殊标识
        if (configMap.containsKey("testcase")) {
            return "challenge-mode";
        }
        
        // 默认为自由模式
        return "free-mode";
    }
}