package com.carrental.controller;

import com.carrental.dto.BookACarDto;
import com.carrental.dto.CarDto;
import com.carrental.dto.QuoteDto;
import com.carrental.dto.QuoteRequestDto;
import com.carrental.dto.UserDto;
import com.carrental.exception.BookingValidationException;
import com.carrental.service.CustomerService;
import com.carrental.repository.UserRepository;
import com.carrental.repository.BookingRepository;
import com.carrental.entity.User;
import com.carrental.enums.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    @GetMapping("/cars")
    public ResponseEntity<List<CarDto>> getAllCars() {
        return ResponseEntity.ok(customerService.getAllCars());
    }

    @PostMapping("/car/book")
    public ResponseEntity<?> bookACar(@jakarta.validation.Valid @RequestBody BookACarDto bookACarDto, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null || user.getRole() != UserRole.CUSTOMER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        bookACarDto.setUserId(user.getId());
        boolean success = customerService.bookACar(bookACarDto);
        if (success)
            return ResponseEntity.status(HttpStatus.CREATED).build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    @PostMapping("/car/quote")
    public ResponseEntity<?> quoteCar(@jakarta.validation.Valid @RequestBody QuoteRequestDto quoteRequest,
                                      Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null || user.getRole() != UserRole.CUSTOMER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        try {
            QuoteDto quote = customerService.quoteCar(user.getId(), quoteRequest);
            return ResponseEntity.ok(quote);
        } catch (BookingValidationException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/car/{id}")
    public ResponseEntity<CarDto> getCarById(@PathVariable Long id) {
        CarDto carDto = customerService.getCarById(id);
        if (carDto != null)
            return ResponseEntity.ok(carDto);
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/car/bookings/{userId}")
    public ResponseEntity<List<BookACarDto>> getBookingsByUserId(@PathVariable Long userId, Authentication authentication) {
        if (!isCurrentCustomer(userId, authentication)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(customerService.getBookingsByUserId(userId));
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<UserDto> getCustomerProfile(@PathVariable Long userId, Authentication authentication) {
        if (!isCurrentCustomer(userId, authentication)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        UserDto userDto = customerService.getCustomerProfile(userId);
        if (userDto != null)
            return ResponseEntity.ok(userDto);
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateCustomerProfile(@jakarta.validation.Valid @RequestBody UserDto userDto, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null || user.getRole() != UserRole.CUSTOMER) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        userDto.setId(user.getId());
        boolean success = customerService.updateCustomerProfile(userDto);
        if (success)
            return ResponseEntity.ok().build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    @GetMapping("/booking/{id}/invoice")
    public ResponseEntity<String> getInvoice(@PathVariable Long id, Authentication authentication) {
        if (bookingRepository.findByIdAndUserEmail(id, authentication.getName()).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        String invoice = customerService.generateInvoice(id);
        if (invoice != null) return ResponseEntity.ok(invoice);
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/booking/{id}/payment")
    public ResponseEntity<?> processPayment(@PathVariable Long id, @RequestBody(required = false) String transactionId) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body("Online payment processing is not configured.");
    }

    private boolean isCurrentCustomer(Long userId, Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .filter(user -> user.getRole() == UserRole.CUSTOMER && user.getId().equals(userId))
                .isPresent();
    }
}
