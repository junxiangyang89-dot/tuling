package com.example.webpj.controller;

import com.example.webpj.common.Result;
import com.example.webpj.entity.TuringMachine;
import com.example.webpj.dto.TuringMachineDTO;
import com.example.webpj.service.TuringMachineService;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:8080"}, allowedHeaders = {"Authorization", "Content-Type", "X-User-Name"})
@RequestMapping("/api/machine")
@RequiredArgsConstructor
public class TuringMachineController {
    
    @Autowired
    private TuringMachineService turingMachineService;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    // 添加缓存来存储已修复的图灵机ID，避免重复修复
    private final Set<Long> fixedMachineIds = new HashSet<>();
    
    // 获取当前用户ID
    private Long getCurrentUserId(String authHeader, String usernameHeader) {
        try {
            // 首先尝试从请求头中直接获取用户名
            String username = null;
            if (usernameHeader != null && !usernameHeader.isEmpty()) {
                username = usernameHeader;
                System.out.println("从X-User-Name头获取到用户名: " + username);
            } else if (authHeader != null && authHeader.startsWith("Bearer ")) {
                // 尝试从认证令牌中提取用户名
                String token = authHeader.substring(7); // 去掉"Bearer "前缀
                try {
                    // 解析JWT令牌，这里是简化处理，实际应该使用JWT库
                    String[] parts = token.split("\\.");
                    if (parts.length == 3) {
                        String payload = new String(Base64.getDecoder().decode(parts[1]));
                        // 简单解析JSON，找到用户名字段
                        if (payload.contains("\"sub\":")) {
                            int start = payload.indexOf("\"sub\":") + 7;
                            int end = payload.indexOf("\"", start);
                            if (start > 0 && end > start) {
                                username = payload.substring(start, end);
                                System.out.println("从JWT令牌解析出用户名: " + username);
                            }
                        }
                    }
                } catch (Exception e) {
                    System.out.println("解析JWT令牌失败: " + e.getMessage());
                }
            }
            
            // 如果成功获取到用户名，根据用户名返回对应的用户ID
            if (username != null) {
                if (username.startsWith("alice")) {
                    return 1L; // 假设alice用户的ID为1
                } else if (username.startsWith("bob")) {
                    return 2L; // 假设bob用户的ID为2
                } else if ("admin".equals(username)) {
                    return 1L; // 假设admin用户的ID为1
                }
            }
            
            // 如果上述方法都失败，尝试从Spring Security上下文获取
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                // 从认证对象中获取用户名或ID
                Object principal = authentication.getPrincipal();
                
                // 打印认证对象信息，用于调试
                System.out.println("Authentication principal: " + principal);
                System.out.println("Authentication details: " + authentication.getDetails());
                System.out.println("Authentication name: " + authentication.getName());
                
                // 如果principal是对象类型，可能包含id属性
                if (principal instanceof Map) {
                    Map<String, Object> userMap = (Map<String, Object>) principal;
                    if (userMap.containsKey("id")) {
                        return Long.valueOf(userMap.get("id").toString());
                    } else if (userMap.containsKey("userId")) {
                        return Long.valueOf(userMap.get("userId").toString());
                    }
                }
                
                // 从authentication.getName获取用户名，然后映射到ID
                String authName = authentication.getName();
                if (authName != null && !authName.isEmpty()) {
                    if (authName.startsWith("alice")) {
                        return 1L;
                    } else if (authName.startsWith("bob")) {
                        return 2L;
                    } else if ("admin".equals(authName)) {
                        return 1L;
                    }
                    
                    // 如果是数字形式的ID，直接返回
                    try {
                        return Long.parseLong(authName);
                    } catch (NumberFormatException e) {
                        // 忽略，继续尝试其他方法
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("获取用户ID时发生异常: " + e.getMessage());
            e.printStackTrace();
        }
        
        // 如果都失败了，临时返回默认ID
        return 1L; // 临时解决方案
    }
    
    /**
     * 获取所有图灵机列表（兼容旧接口）
     */
    @GetMapping("/list")
    public Result listAllTuringMachines(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Name", required = false) String usernameHeader) {
        return listTuringMachinesByMode("all", authHeader, usernameHeader);
    }
    
    /**
     * 按模式获取图灵机列表
     */
    @GetMapping("/{mode}/list")
    public Result listTuringMachinesByMode(
            @PathVariable String mode,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Name", required = false) String usernameHeader) {
            
        System.out.println("Authorization Header in listTuringMachinesByMode: " + authHeader);
        System.out.println("X-User-Name Header: " + usernameHeader);
        
        // 直接从请求头中获取用户名
        String currentUsername = usernameHeader;
        
        // 如果请求头中没有用户名，尝试从JWT令牌中提取
        if (currentUsername == null && authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                // 简单解析JWT令牌
                String[] parts = token.split("\\.");
                if (parts.length == 3) {
                    String payload = new String(Base64.getDecoder().decode(parts[1]));
                    // 查找用户名字段
                    if (payload.contains("\"sub\":")) {
                        int start = payload.indexOf("\"sub\":") + 7;
                        int end = payload.indexOf("\"", start);
                        if (start > 0 && end > start) {
                            currentUsername = payload.substring(start, end);
                            System.out.println("从JWT令牌解析出用户名: " + currentUsername);
                        }
                    }
                }
            } catch (Exception e) {
                System.out.println("解析JWT令牌失败: " + e.getMessage());
            }
        }
        
        // 如果仍然没有用户名，从认证上下文中获取
        if (currentUsername == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null) {
                currentUsername = authentication.getName();
                System.out.println("从认证上下文获取用户名: " + currentUsername);
            }
        }
        
        final String finalUsername = currentUsername;
        System.out.println("最终确定的用户名: " + finalUsername);
        
        // 获取用户ID
        final Long userId = getCurrentUserId(authHeader, usernameHeader);
        System.out.println("获取到的用户ID: " + userId);
        
        Long finalUserId = userId;
        if (finalUserId == null) {
            finalUserId = 1L; // 临时使用默认用户ID
            System.out.println("使用默认用户ID: " + finalUserId);
        }
        
        try {
            final Long userIdForQuery = finalUserId;
            List<TuringMachine> machines = turingMachineService.getTuringMachinesByUserId(userIdForQuery);
            System.out.println("找到 " + machines.size() + " 台图灵机");
            
            for (TuringMachine machine : machines) {
                System.out.println("图灵机ID: " + machine.getId() + ", 名称: " + machine.getName() + 
                                  ", 配置: " + (machine.getConfiguration() != null ? machine.getConfiguration().substring(0, Math.min(100, machine.getConfiguration().length())) : "null"));
            }
            
            // 转换为前端所需的格式
            List<Map<String, Object>> machineList = machines.stream()
                // 过滤特定模式的图灵机
                .filter(machine -> {
                    // 如果是all模式，显示所有图灵机
                    if ("all".equals(mode)) {
                        return true;
                    }
                    
                    // 检查机器配置中的模式
                    try {
                        if (machine.getConfiguration() != null) {
                            Map<String, Object> config = objectMapper.readValue(machine.getConfiguration(), Map.class);
                            String machineMode = config.containsKey("mode") ? config.get("mode").toString() : null;
                            
                            // 记录调试信息
                            System.out.println("图灵机ID: " + machine.getId() + 
                                             ", 配置中的模式: " + machineMode +
                                             ", 当前请求模式: " + mode);
                            
                            // 如果配置中没有模式，尝试自动修复
                            if (machineMode == null && !fixedMachineIds.contains(machine.getId())) {
                                try {
                                    // 推断模式
                                    String inferredMode = inferModeFromMachine(machine, config);
                                    
                                    // 更新配置
                                    config.put("mode", inferredMode);
                                    String updatedConfig = objectMapper.writeValueAsString(config);
                                    
                                    // 更新数据库
                                    TuringMachineDTO dto = new TuringMachineDTO();
                                    dto.setConfiguration(updatedConfig);
                                    turingMachineService.updateTuringMachine(machine.getId(), dto);
                                    
                                    // 标记为已修复
                                    fixedMachineIds.add(machine.getId());
                                    
                                    System.out.println("自动修复图灵机ID: " + machine.getId() + 
                                                     ", 推断模式: " + inferredMode);
                                    
                                    machineMode = inferredMode;
                                } catch (Exception e) {
                                    System.err.println("自动修复图灵机ID " + machine.getId() + " 失败: " + e.getMessage());
                                    // 修复失败时，默认为free-mode
                                    machineMode = "free-mode";
                                }
                            }
                            
                            // 如果仍然没有模式，默认为free-mode
                            if (machineMode == null) {
                                machineMode = "free-mode";
                            }
                            
                            // 匹配模式
                            return mode.equals(machineMode);
                        }
                    } catch (Exception e) {
                        System.out.println("解析图灵机配置失败: " + e.getMessage());
                    }
                    
                    // 如果无法确定模式，默认为free-mode
                    return "free-mode".equals(mode);
                })
                .map(machine -> {
                    Map<String, Object> machineInfo = new HashMap<>();
                    // 从配置中提取用户名
                    String machineUsername = extractUsernameFromConfig(machine.getConfiguration());
                    
                    // 记录调试信息
                    System.out.println("图灵机ID: " + machine.getId() + 
                                     ", 配置中的用户名: " + machineUsername +
                                     ", 当前用户名: " + finalUsername);
                    
                    machineInfo.put("id", machine.getId());
                    machineInfo.put("name", machine.getName() != null ? machine.getName() : 
                                   (machine.getConfiguration() != null ? extractNameFromConfig(machine.getConfiguration()) : "未命名图灵机"));
                    machineInfo.put("description", machine.getDescription() != null ? machine.getDescription() : 
                                    extractDescriptionFromConfig(machine.getConfiguration()));
                    machineInfo.put("createTime", machine.getCreateTime().toString());
                    machineInfo.put("isCompleted", machine.getIsCompleted());
                    machineInfo.put("mode", extractModeFromConfig(machine.getConfiguration(), mode));
                    // 添加用户ID信息便于前端调试
                    machineInfo.put("userId", machine.getUserId());
                    machineInfo.put("username", machineUsername);
                    return machineInfo;
                })
                // 在这里过滤，确保用户只能看到自己创建的图灵机
                .filter(machineInfo -> {
                    if (finalUsername == null) {
                        return true; // 如果无法确定当前用户名，则不过滤
                    }
                    
                    String machineUsername = (String) machineInfo.get("username");
                    boolean matched = finalUsername.equals(machineUsername);
                    System.out.println("过滤图灵机ID: " + machineInfo.get("id") + 
                                     ", 机器用户名: " + machineUsername +
                                     ", 当前用户名: " + finalUsername +
                                     ", 匹配结果: " + matched);
                    return matched;
                })
                .collect(Collectors.toList());
                
            System.out.println("返回给前端的图灵机列表大小: " + machineList.size());
            for (Map<String, Object> machineInfo : machineList) {
                System.out.println("列表项: ID=" + machineInfo.get("id") + ", 名称=" + machineInfo.get("name") + ", 用户名=" + machineInfo.get("username"));
            }
        
            return Result.success(machineList);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取图灵机列表失败: " + e.getMessage());
        }
    }
    
    private String extractNameFromConfig(String config) {
        try {
            Map<String, Object> configMap = objectMapper.readValue(config, Map.class);
            return configMap.getOrDefault("name", "未命名图灵机").toString();
        } catch (Exception e) {
            return "未命名图灵机";
        }
    }
    
    private String extractDescriptionFromConfig(String config) {
        try {
            Map<String, Object> configMap = objectMapper.readValue(config, Map.class);
            return configMap.getOrDefault("description", "").toString();
        } catch (Exception e) {
            return "";
        }
    }
    
    private String extractUsernameFromConfig(String config) {
        try {
            if (config == null) {
                return null;
            }
            Map<String, Object> configMap = objectMapper.readValue(config, Map.class);
            return configMap.containsKey("username") ? configMap.get("username").toString() : null;
        } catch (Exception e) {
            System.out.println("从配置中提取用户名失败: " + e.getMessage());
            return null;
        }
    }
    
    private String getUsernameFromUserId(Long userId) {
        // 此处应该查询用户名，简化实现直接返回ID字符串
        return userId.toString();
    }
    
    /**
     * 创建新图灵机（兼容旧接口）
     */
    @PostMapping("/create")
    public Result createTuringMachine(
            @RequestBody Map<String, Object> configuration,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        // 使用默认的自由模式
        return createTuringMachineInMode("free-mode", configuration, authHeader);
    }
    
    /**
     * 在特定模式下创建图灵机
     */
    @PostMapping("/{mode}/create")
    public Result createTuringMachineInMode(
            @PathVariable String mode, 
            @RequestBody Map<String, Object> configuration,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        // 打印请求头和参数，用于调试
        System.out.println("Authorization Header: " + authHeader);
        System.out.println("Configuration: " + configuration);
        
        // 尝试从配置中获取用户名
        String username = null;
        if (configuration.containsKey("username")) {
            username = configuration.get("username").toString();
            System.out.println("从配置中获取的用户名: " + username);
        }
        
        // 获取用户ID
        Long userId = getCurrentUserId(authHeader, username);
        System.out.println("获取到的用户ID: " + userId);
        
        if (userId == null) {
            // 如果无法获取用户ID但有用户名，尝试查询用户ID（此处简化为默认ID）
            if (username != null) {
                userId = 1L;  // 默认为1，实际应该查询数据库
                System.out.println("使用默认用户ID: " + userId);
            } else {
                return Result.error("未登录或无法获取用户ID");
            }
        }
        
        try {
            // 添加模式信息
            configuration.put("mode", mode);
            configuration.put("createTime", LocalDateTime.now().toString());
            configuration.put("isCompleted", false);
            
            // 创建图灵机实体
            TuringMachine turingMachine = new TuringMachine();
            turingMachine.setUserId(userId);
            
            // 从配置中提取name和description
            if (configuration.containsKey("name")) {
                turingMachine.setName(configuration.get("name").toString());
            } else {
                turingMachine.setName("未命名图灵机");
            }
            
            if (configuration.containsKey("description")) {
                turingMachine.setDescription(configuration.get("description").toString());
            } else {
                turingMachine.setDescription("");
            }
            
            turingMachine.setTape(configuration.getOrDefault("tape", "").toString());
            turingMachine.setHeadPosition(0);
            turingMachine.setCurrentState("q0");
            turingMachine.setIsCompleted(false);
            
            // 保存配置为JSON字符串
            turingMachine.setConfiguration(objectMapper.writeValueAsString(configuration));
            
            // 保存到数据库
            TuringMachine saved = turingMachineService.createTuringMachine(turingMachine);
            
            return Result.success(saved.getId());
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("创建图灵机失败: " + e.getMessage());
        }
    }

    /**
     * 获取指定图灵机（兼容旧接口）
     */
    @GetMapping("/{machineId}")
    public Result getTuringMachine(
            @PathVariable Long machineId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Name", required = false) String usernameHeader) {
        
        System.out.println("Authorization Header in getTuringMachine: " + authHeader);
        System.out.println("X-User-Name Header: " + usernameHeader);
        System.out.println("正在获取图灵机ID: " + machineId);
        
        TuringMachine machine = turingMachineService.getTuringMachineById(machineId);
        if (machine == null) {
            System.out.println("图灵机不存在: " + machineId);
            return Result.error("图灵机不存在");
        }
        
        try {
            // 解析配置
            Map<String, Object> config = objectMapper.readValue(machine.getConfiguration(), Map.class);
            System.out.println("成功解析配置: " + config);
            
            // 检查用户名匹配
            String machineUsername = (String) config.get("username");
            String currentUsername = usernameHeader;
            
            // 如果从请求头获取不到，尝试从JWT令牌解析
            if (currentUsername == null && authHeader != null && authHeader.startsWith("Bearer ")) {
                // 省略JWT解析代码...
                // 实际项目中应该复用之前的代码
            }
            
            System.out.println("图灵机用户名: " + machineUsername + ", 当前用户名: " + currentUsername);
            
            // 只有当用户名匹配或无法确定时才返回数据
            if (currentUsername == null || machineUsername == null || currentUsername.equals(machineUsername)) {
                // 添加运行时信息
                config.put("tape", machine.getTape());
                config.put("headPosition", machine.getHeadPosition());
                config.put("currentState", machine.getCurrentState());
                config.put("isCompleted", machine.getIsCompleted());
                
                return Result.success(config);
            } else {
                System.out.println("用户名不匹配，拒绝访问");
                return Result.error("无权访问此图灵机");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取图灵机失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取特定模式下的图灵机
     */
    @GetMapping("/{mode}/{machineId}")
    public Result getTuringMachineInMode(
            @PathVariable String mode, 
            @PathVariable Long machineId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Name", required = false) String usernameHeader) {
        return getTuringMachine(machineId, authHeader, usernameHeader);
    }
    
    /**
     * 更新图灵机状态（兼容旧接口）
     */
    @PostMapping("/{machineId}/state")
    public Result updateMachineState(@PathVariable Long machineId, @RequestBody Map<String, Object> stateData) {
        return updateMachineStateInMode(null, machineId, stateData);
    }
    
    /**
     * 在特定模式下更新图灵机状态
     */
    @PostMapping("/{mode}/{machineId}/state")
    public Result updateMachineStateInMode(@PathVariable String mode, @PathVariable Long machineId, @RequestBody Map<String, Object> stateData) {
        TuringMachine existingMachine = turingMachineService.getTuringMachineById(machineId);
        if (existingMachine == null) {
            return Result.error("图灵机不存在");
        }
        
        try {
            // 更新状态数据
            TuringMachineDTO dto = new TuringMachineDTO();
            
            if (stateData.containsKey("tape")) {
                dto.setTape(stateData.get("tape").toString());
            }
            
            if (stateData.containsKey("headPosition")) {
                dto.setHeadPosition(Integer.parseInt(stateData.get("headPosition").toString()));
            }
            
            if (stateData.containsKey("currentState")) {
                dto.setCurrentState(stateData.get("currentState").toString());
            }
            
            if (stateData.containsKey("isCompleted")) {
                dto.setIsCompleted(Boolean.parseBoolean(stateData.get("isCompleted").toString()));
            }
            
            // 如果存在规则更新，则更新配置
            if (stateData.containsKey("rules")) {
                // 读取原配置
                Map<String, Object> config = objectMapper.readValue(existingMachine.getConfiguration(), Map.class);
                // 更新规则
                config.put("rules", stateData.get("rules"));
                // 写回配置
                dto.setConfiguration(objectMapper.writeValueAsString(config));
            }
            
            // 更新数据库
            TuringMachine updated = turingMachineService.updateTuringMachine(machineId, dto);
            if (updated != null) {
                return Result.success("更新成功");
            } else {
                return Result.error("更新失败");
            }
        } catch (Exception e) {
            return Result.error("更新图灵机状态失败: " + e.getMessage());
        }
    }

    /**
     * 设置输入带（兼容旧接口）
     */
    @PostMapping("/{machineId}/input")
    public Result setInput(@PathVariable Long machineId, @RequestBody String input) {
        TuringMachine existingMachine = turingMachineService.getTuringMachineById(machineId);
        if (existingMachine == null) {
            return Result.error("图灵机不存在");
        }
        
        // 更新输入带
        TuringMachineDTO dto = new TuringMachineDTO();
        dto.setTape(input);
        dto.setHeadPosition(0); // 重置读写头位置
        
        TuringMachine updated = turingMachineService.updateTuringMachine(machineId, dto);
        if (updated != null) {
            return Result.success("设置输入带成功");
        } else {
            return Result.error("设置输入带失败");
        }
    }
    
    /**
     * 在特定模式下设置输入带
     */
    @PostMapping("/{mode}/{machineId}/input")
    public Result setInputInMode(@PathVariable String mode, @PathVariable Long machineId, @RequestBody String input) {
        return setInput(machineId, input);
    }
    
    /**
     * 删除图灵机（兼容旧接口）
     */
    @DeleteMapping("/{machineId}")
    public Result deleteMachine(@PathVariable Long machineId) {
        boolean deleted = turingMachineService.deleteTuringMachine(machineId);
        if (deleted) {
            return Result.success("删除成功");
        } else {
            return Result.error("图灵机不存在或删除失败");
        }
    }
    
    /**
     * 在特定模式下删除图灵机
     */
    @DeleteMapping("/{mode}/{machineId}")
    public Result deleteMachineInMode(@PathVariable String mode, @PathVariable Long machineId) {
        return deleteMachine(machineId);
    }
    
    // 以下方法涉及图灵机模拟逻辑，保持简单实现
    
    /**
     * 执行单步操作（兼容旧接口）
     */
    @PostMapping("/{machineId}/step")
    public Result executeStep(@PathVariable Long machineId) {
        // 这里应该实现图灵机的单步执行逻辑
        return Result.success("执行单步操作");
    }
    
    /**
     * 在特定模式下执行单步操作
     */
    @PostMapping("/{mode}/{machineId}/step")
    public Result executeStepInMode(@PathVariable String mode, @PathVariable Long machineId) {
        return executeStep(machineId);
    }
    
    /**
     * 执行完整运行（兼容旧接口）
     */
    @PostMapping("/{machineId}/run")
    public Result executeAll(@PathVariable Long machineId) {
        // 这里应该实现图灵机的完整运行逻辑
        return Result.success("执行完整运行");
    }
    
    /**
     * 在特定模式下执行完整运行
     */
    @PostMapping("/{mode}/{machineId}/run")
    public Result executeAllInMode(@PathVariable String mode, @PathVariable Long machineId) {
        return executeAll(machineId);
    }
    
    /**
     * 重置图灵机状态（兼容旧接口）
     */
    @PostMapping("/{machineId}/reset")
    public Result resetMachine(@PathVariable Long machineId) {
        TuringMachine existingMachine = turingMachineService.getTuringMachineById(machineId);
        if (existingMachine == null) {
            return Result.error("图灵机不存在");
        }
        
        // 重置状态
        TuringMachineDTO dto = new TuringMachineDTO();
        dto.setCurrentState("q0");
        dto.setHeadPosition(0);
        dto.setIsCompleted(false);
        
        TuringMachine updated = turingMachineService.updateTuringMachine(machineId, dto);
        if (updated != null) {
            return Result.success("重置图灵机状态成功");
        } else {
            return Result.error("重置图灵机状态失败");
        }
    }
    
    /**
     * 在特定模式下重置图灵机状态
     */
    @PostMapping("/{mode}/{machineId}/reset")
    public Result resetMachineInMode(@PathVariable String mode, @PathVariable Long machineId) {
        return resetMachine(machineId);
    }
    
    /**
     * 获取当前状态（兼容旧接口）
     */
    @GetMapping("/{machineId}/state")
    public Result getMachineState(
            @PathVariable Long machineId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Name", required = false) String usernameHeader) {
        return getTuringMachine(machineId, authHeader, usernameHeader);
    }
    
    /**
     * 在特定模式下获取图灵机状态
     */
    @GetMapping("/{mode}/{machineId}/state")
    public Result getMachineStateInMode(
            @PathVariable String mode, 
            @PathVariable Long machineId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Name", required = false) String usernameHeader) {
        return getMachineState(machineId, authHeader, usernameHeader);
    }

    private String extractModeFromConfig(String config, String defaultMode) {
        try {
            if (config == null) {
                return defaultMode;
            }
            Map<String, Object> configMap = objectMapper.readValue(config, Map.class);
            return configMap.containsKey("mode") ? configMap.get("mode").toString() : defaultMode;
        } catch (Exception e) {
            System.out.println("从配置中提取模式失败: " + e.getMessage());
            return defaultMode;
        }
    }
    
    /**
     * 修复历史数据的模式字段
     * 这是一个管理员接口，用于修复数据库中缺少mode字段的历史数据
     */
    @PostMapping("/admin/fix-historical-mode-data")
    public Result fixHistoricalModeData() {
        try {
            turingMachineService.fixHistoricalModeData();
            return Result.success("历史数据修复完成");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("历史数据修复失败: " + e.getMessage());
        }
    }

    /**
     * 根据图灵机的特征推断模式
     */
    private String inferModeFromMachine(TuringMachine machine, Map<String, Object> configMap) {
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