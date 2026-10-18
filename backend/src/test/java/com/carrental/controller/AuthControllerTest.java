package com.carrental.controller;

import com.carrental.configuration.JwtUtil;
import com.carrental.dto.LoginRequest;
import com.carrental.dto.SignupRequest;
import com.carrental.dto.UserDto;
import com.carrental.entity.User;
import com.carrental.enums.UserRole;
import com.carrental.repository.UserRepository;
import com.carrental.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthController authController;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setName("Alex");
        sampleUser.setEmail("alex@example.com");
        sampleUser.setPassword("encodedSecret");
        sampleUser.setRole(UserRole.CUSTOMER);
        sampleUser.setBlocked(false);
    }

    @Test
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest();
        request.setEmail("alex@example.com");
        request.setPassword("plainSecret");

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("plainSecret", "encodedSecret")).thenReturn(true);
        when(jwtUtil.generateToken("alex@example.com", "CUSTOMER")).thenReturn("token123");

        ResponseEntity<?> response = authController.login(request);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof UserDto);
        UserDto body = (UserDto) response.getBody();
        assertEquals("token123", body.getToken());
    }

    @Test
    void testLoginBlockedUserFails() {
        sampleUser.setBlocked(true);

        LoginRequest request = new LoginRequest();
        request.setEmail("alex@example.com");
        request.setPassword("plainSecret");

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("plainSecret", "encodedSecret")).thenReturn(true);

        ResponseEntity<?> response = authController.login(request);
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertTrue(response.getBody().toString().contains("blocked"));
    }

    @Test
    void testLoginWrongPassword() {
        LoginRequest request = new LoginRequest();
        request.setEmail("alex@example.com");
        request.setPassword("wrongSecret");

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongSecret", "encodedSecret")).thenReturn(false);

        ResponseEntity<?> response = authController.login(request);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void testLoginUserNotFound() {
        LoginRequest request = new LoginRequest();
        request.setEmail("missing@example.com");
        request.setPassword("any");

        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        ResponseEntity<?> response = authController.login(request);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void testSignupAlreadyExists() {
        SignupRequest request = new SignupRequest();
        request.setEmail("alex@example.com");
        when(authService.hasCustomerWithEmail("alex@example.com")).thenReturn(true);

        ResponseEntity<?> response = authController.signupCustomer(request);
        assertEquals(HttpStatus.NOT_ACCEPTABLE, response.getStatusCode());
    }
}
