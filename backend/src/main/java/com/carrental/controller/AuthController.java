package com.carrental.controller;

import com.carrental.configuration.JwtUtil;
import com.carrental.dto.SignupRequest;
import com.carrental.dto.LoginRequest;
import com.carrental.dto.UserDto;
import com.carrental.entity.User;
import com.carrental.repository.UserRepository;
import com.carrental.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<?> signupCustomer(@jakarta.validation.Valid @RequestBody SignupRequest signupRequest) {
        if (authService.hasCustomerWithEmail(signupRequest.getEmail()))
            return new ResponseEntity<>("Customer already exists", HttpStatus.NOT_ACCEPTABLE);

        UserDto createdCustomer = authService.createCustomer(signupRequest);
        if (createdCustomer == null)
            return new ResponseEntity<>("Customer not created, Try again", HttpStatus.BAD_REQUEST);
        return new ResponseEntity<>(createdCustomer, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@jakarta.validation.Valid @RequestBody LoginRequest loginRequest) {
        Optional<User> optionalUser = userRepository.findByEmail(loginRequest.getEmail());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                if (user.isBlocked()) {
                    return new ResponseEntity<>("Your account has been blocked. Please contact support.", HttpStatus.FORBIDDEN);
                }
                UserDto userDto = new UserDto();
                userDto.setId(user.getId());
                userDto.setName(user.getName());
                userDto.setEmail(user.getEmail());
                userDto.setRole(user.getRole());
                userDto.setProfileImage(user.getProfileImage());
                userDto.setBlocked(user.isBlocked());
                userDto.setToken(jwtUtil.generateToken(user.getEmail(), user.getRole().name()));
                return new ResponseEntity<>(userDto, HttpStatus.OK);
            } else {
                return new ResponseEntity<>("Wrong password", HttpStatus.UNAUTHORIZED);
            }
        } else {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }
    }

    // For initializing admin (internal use)
    @PostMapping("/admin/signup")
    public ResponseEntity<?> signupAdmin(@RequestBody SignupRequest signupRequest) {
        if (authService.hasCustomerWithEmail(signupRequest.getEmail()))
            return new ResponseEntity<>("User already exists", HttpStatus.NOT_ACCEPTABLE);

        UserDto createdAdmin = authService.createAdmin(signupRequest);
        if (createdAdmin == null)
            return new ResponseEntity<>("Admin not created, Try again", HttpStatus.BAD_REQUEST);
        return new ResponseEntity<>(createdAdmin, HttpStatus.CREATED);
    }
}
