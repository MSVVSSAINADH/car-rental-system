package com.carrental.dto;

import com.carrental.enums.UserRole;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private String profileImage;
    private String licenseImage;
    private String token;
    private boolean isBlocked;
}

