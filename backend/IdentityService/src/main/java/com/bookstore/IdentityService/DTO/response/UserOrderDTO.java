package com.bookstore.IdentityService.DTO.response;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserOrderDTO {
    private String id;
    private String email;
    private String phone;
    private String name;
    private boolean active;
    private BigDecimal orderCount;
}
