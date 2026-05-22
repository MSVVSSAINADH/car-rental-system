package com.carrental.service;

import com.carrental.dto.SignupRequest;
import com.carrental.dto.UserDto;

public interface AuthService {
    UserDto createCustomer(SignupRequest signupRequest);

    boolean hasCustomerWithEmail(String email);

    UserDto createAdmin(SignupRequest signupRequest);
}
