package com.carrental.service;

import com.carrental.dto.BookACarDto;
import com.carrental.dto.CarDto;
import com.carrental.dto.UserDto;
import java.util.List;

public interface CustomerService {
    List<CarDto> getAllCars();

    boolean bookACar(BookACarDto bookACarDto);

    CarDto getCarById(Long id);

    List<BookACarDto> getBookingsByUserId(Long userId);

    String generateInvoice(Long bookingId);

    boolean processPayment(Long bookingId, String transactionId);

    UserDto getCustomerProfile(Long userId);

    boolean updateCustomerProfile(UserDto userDto);
}
