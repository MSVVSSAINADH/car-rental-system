package com.carrental.controller;

import com.carrental.dto.BookACarDto;
import com.carrental.dto.CarDto;
import com.carrental.dto.UserDto;
import com.carrental.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
@CrossOrigin("*")
public class CustomerController {
    private final CustomerService customerService;

    @GetMapping("/cars")
    public ResponseEntity<List<CarDto>> getAllCars() {
        return ResponseEntity.ok(customerService.getAllCars());
    }

    @PostMapping("/car/book")
    public ResponseEntity<?> bookACar(@jakarta.validation.Valid @RequestBody BookACarDto bookACarDto) {
        boolean success = customerService.bookACar(bookACarDto);
        if (success)
            return ResponseEntity.status(HttpStatus.CREATED).build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    @GetMapping("/car/{id}")
    public ResponseEntity<CarDto> getCarById(@PathVariable Long id) {
        CarDto carDto = customerService.getCarById(id);
        if (carDto != null)
            return ResponseEntity.ok(carDto);
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/car/bookings/{userId}")
    public ResponseEntity<List<BookACarDto>> getBookingsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(customerService.getBookingsByUserId(userId));
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<UserDto> getCustomerProfile(@PathVariable Long userId) {
        UserDto userDto = customerService.getCustomerProfile(userId);
        if (userDto != null)
            return ResponseEntity.ok(userDto);
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateCustomerProfile(@jakarta.validation.Valid @RequestBody UserDto userDto) {
        boolean success = customerService.updateCustomerProfile(userDto);
        if (success)
            return ResponseEntity.ok().build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    @GetMapping("/booking/{id}/invoice")
    public ResponseEntity<String> getInvoice(@PathVariable Long id) {
        String invoice = customerService.generateInvoice(id);
        if (invoice != null) return ResponseEntity.ok(invoice);
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/booking/{id}/payment")
    public ResponseEntity<?> processPayment(@PathVariable Long id, @RequestBody String transactionId) {
        boolean success = customerService.processPayment(id, transactionId);
        if (success) return ResponseEntity.ok().build();
        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).build();
    }
}
