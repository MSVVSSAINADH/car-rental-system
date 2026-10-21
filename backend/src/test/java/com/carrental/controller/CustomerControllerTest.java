package com.carrental.controller;

import com.carrental.entity.User;
import com.carrental.dto.BookACarDto;
import com.carrental.dto.QuoteDto;
import com.carrental.dto.QuoteRequestDto;
import com.carrental.enums.UserRole;
import com.carrental.exception.BookingValidationException;
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
import static org.mockito.ArgumentMatchers.eq;

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
    void quoteAlwaysUsesTheAuthenticatedCustomer() {
        User user = new User();
        user.setId(1L);
        user.setEmail("customer@example.com");
        user.setRole(UserRole.CUSTOMER);
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(user));
        when(customerService.quoteCar(eq(1L), any(QuoteRequestDto.class)))
                .thenReturn(new QuoteDto(5L, 2L, null, 8000.0, 30, 2400.0, 5600.0, true));

        var auth = new UsernamePasswordAuthenticationToken("customer@example.com", "token");
        var response = controller.quoteCar(new QuoteRequestDto(), auth);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(customerService).quoteCar(eq(1L), any(QuoteRequestDto.class));
    }

    @Test
    void quoteSurfacesBusinessRuleFailuresAsBadRequest() {
        User user = new User();
        user.setId(1L);
        user.setEmail("customer@example.com");
        user.setRole(UserRole.CUSTOMER);
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(user));
        when(customerService.quoteCar(any(), any(QuoteRequestDto.class)))
                .thenThrow(new BookingValidationException("That car is already booked for these dates."));

        var auth = new UsernamePasswordAuthenticationToken("customer@example.com", "token");
        var response = controller.quoteCar(new QuoteRequestDto(), auth);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("That car is already booked for these dates.", response.getBody());
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
