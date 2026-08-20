package com.bookstore.IdentityService.DTO.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResetDTO {
    @NotBlank
    @Email(message = "Enter a valid email address")
    private String email;

    @NotBlank
    @Size(min = 6, max = 100, message = "Size must be of 6 characters")
    private String password;

    @NotBlank
    @Size(min = 6, max = 100, message = "Size must be of 6 characters")
    private String cfnpassword;
}
