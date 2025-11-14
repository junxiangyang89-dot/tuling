package com.example.webpj.mapper;

import com.example.webpj.entity.TuringMachine;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface TuringMachineMapper {
    @Insert("INSERT INTO turing_machine(user_id, name, description, tape, head_position, current_state, configuration, is_completed, execution_log, create_time, update_time) " +
            "VALUES(#{userId}, #{name}, #{description}, #{tape}, #{headPosition}, #{currentState}, #{configuration}, #{isCompleted}, #{executionLog}, #{createTime}, #{updateTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(TuringMachine turingMachine);

    @Select("SELECT * FROM turing_machine WHERE id = #{id}")
    TuringMachine findById(Long id);

    @Select("SELECT * FROM turing_machine WHERE user_id = #{userId}")
    List<TuringMachine> findByUserId(Long userId);

    @Select("SELECT * FROM turing_machine")
    List<TuringMachine> findAll();

    @Update("UPDATE turing_machine SET " +
            "name = #{name}, " +
            "description = #{description}, " +
            "tape = #{tape}, " +
            "head_position = #{headPosition}, " +
            "current_state = #{currentState}, " +
            "configuration = #{configuration}, " +
            "is_completed = #{isCompleted}, " +
            "execution_log = #{executionLog}, " +
            "update_time = #{updateTime} " +
            "WHERE id = #{id}")
    int update(TuringMachine turingMachine);

    @Delete("DELETE FROM turing_machine WHERE id = #{id}")
    int deleteById(Long id);
}