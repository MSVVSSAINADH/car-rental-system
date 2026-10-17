package com.carrental.service;

import com.carrental.configuration.JwtUtil;
import com.carrental.dto.SignupRequest;
import com.carrental.dto.UserDto;
import com.carrental.entity.User;
import com.carrental.enums.UserRole;
import com.carrental.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthServiceImpl authService;

    private SignupRequest signupRequest;

    @BeforeEach
    void setUp() {
        signupRequest = new SignupRequest();
        signupRequest.setName("John Doe");
        signupRequest.setEmail("john@example.com");
        signupRequest.setPassword("password123");
    }

    @Test
    void testCreateCustomer() {
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setName("John Doe");
        savedUser.setEmail("john@example.com");
        savedUser.setRole(UserRole.CUSTOMER);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtil.generateToken("john@example.com", "CUSTOMER")).thenReturn("mock-jwt-token");

        UserDto result = authService.createCustomer(signupRequest);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("john@example.com", result.getEmail());
        assertEquals(UserRole.CUSTOMER, result.getRole());
        assertEquals("mock-jwt-token", result.getToken());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testHasCustomerWithEmail() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(new User()));
        assertTrue(authService.hasCustomerWithEmail("john@example.com"));

        when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.empty());
        assertFalse(authService.hasCustomerWithEmail("other@example.com"));
    }
}
