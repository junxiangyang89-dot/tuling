package com.example.webpj.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class ProgramUpdateDTO {
    @NotBlank
    private String programText;
}
