package com.carrental.controller;

import com.carrental.entity.User;
import com.carrental.dto.BookACarDto;
import com.carrental.enums.UserRole;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.UserRepository;
import com.carrental.service.CustomerService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;

@ExtendWith(MockitoExtension.class)
class CustomerControllerTest {
    @Mock private CustomerService customerService;
    @Mock private UserRepository userRepository;
    @Mock private BookingRepository bookingRepository;
    @InjectMocks private CustomerController controller;

    @Test
    void customerCannotReadAnotherUsersBookings() {
        User user = new User();
        user.setId(1L);
        user.setEmail("customer@example.com");
        user.setRole(UserRole.CUSTOMER);
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(user));

        var auth = new UsernamePasswordAuthenticationToken("customer@example.com", "token");
        var response = controller.getBookingsByUserId(2L, auth);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verifyNoInteractions(customerService);
    }

    @Test
    void bookingAlwaysUsesAuthenticatedCustomerId() {
        User user = new User();
        user.setId(1L);
        user.setEmail("customer@example.com");
        user.setRole(UserRole.CUSTOMER);
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(user));
        when(customerService.bookACar(any(BookACarDto.class))).thenReturn(true);

        BookACarDto request = new BookACarDto();
        request.setUserId(999L);
        var auth = new UsernamePasswordAuthenticationToken("customer@example.com", "token");
        var response = controller.bookACar(request, auth);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(customerService).bookACar(argThat(dto -> dto.getUserId().equals(1L)));
    }
}
