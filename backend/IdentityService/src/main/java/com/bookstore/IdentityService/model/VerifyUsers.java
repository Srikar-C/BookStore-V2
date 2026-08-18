package com.bookstore.IdentityService.model;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VerifyUsers {
    @Id
    private String email;
    private String token;
    private String otp;
    private Instant otpSession;
    private Integer requestCount;
    private boolean used;
}
