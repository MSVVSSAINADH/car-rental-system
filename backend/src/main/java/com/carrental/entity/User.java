package com.carrental.entity;

import com.carrental.enums.UserRole;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Column(columnDefinition = "LONGTEXT")
    private String profileImage;

    @Column(columnDefinition = "LONGTEXT")
    private String licenseImage;

    private boolean isBlocked = false;
}
