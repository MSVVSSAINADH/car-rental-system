package com.carrental.dto;

import com.carrental.enums.UserRole;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class UserDto {
    private Long id;
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must be at most 100 characters")
    private String name;
    private String email;
    private UserRole role;
    @Size(max = 700000, message = "Profile image is too large")
    private String profileImage;
    @Size(max = 700000, message = "Driving licence image is too large")
    private String licenseImage;
    private String token;
    private boolean isBlocked;
}

