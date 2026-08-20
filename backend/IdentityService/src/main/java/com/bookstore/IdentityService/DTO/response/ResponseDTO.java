package com.bookstore.IdentityService.DTO.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResponseDTO {
    private boolean success;
    private String message;
    private Object error;
    private Object data;
}
