package com.example.webpj.handler;

import com.example.webpj.entity.Transition;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@MappedTypes(List.class)
public class TransitionsTypeHandler extends BaseTypeHandler<List<Transition>> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, List<Transition> parameter, JdbcType jdbcType) throws SQLException {
        try {
            ps.setString(i, objectMapper.writeValueAsString(parameter));
        } catch (JsonProcessingException e) {
            throw new SQLException("Error converting transitions to JSON", e);
        }
    }

    @Override
    public List<Transition> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return value == null ? null : parseJson(value);
    }

    @Override
    public List<Transition> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return value == null ? null : parseJson(value);
    }

    @Override
    public List<Transition> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return value == null ? null : parseJson(value);
    }

    private List<Transition> parseJson(String json) throws SQLException {
        try {
            return objectMapper.readValue(json, new TypeReference<List<Transition>>() {});
        } catch (JsonProcessingException e) {
            throw new SQLException("Error parsing transitions JSON", e);
        }
    }
}
