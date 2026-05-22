package com.carrental.service;

import com.carrental.dto.AdminStatsDto;
import com.carrental.dto.CarDto;
import com.carrental.dto.BookACarDto;
import com.carrental.dto.UserDto;
import java.util.List;

public interface AdminService {
    boolean postCar(CarDto carDto);

    List<CarDto> getAllCars();

    void deleteCar(Long id);

    CarDto getCarById(Long id);

    boolean updateCar(Long id, CarDto carDto);

    List<BookACarDto> getBookings();

    boolean changeBookingStatus(Long bookingId, String status, String reason);

    AdminStatsDto getStats();

    List<UserDto> getAllUsers();

    boolean blockUser(Long userId);

    void deleteBooking(Long id);

    List<CarDto> getMostBookedCars();
}

