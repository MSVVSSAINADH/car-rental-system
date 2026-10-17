package com.carrental.service;

import com.carrental.dto.BookACarDto;
import com.carrental.dto.CarDto;
import com.carrental.dto.UserDto;
import com.carrental.entity.Booking;
import com.carrental.entity.Car;
import com.carrental.entity.Payment;
import com.carrental.entity.User;
import com.carrental.enums.BookingStatus;
import com.carrental.enums.BookingType;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.UserRole;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.PaymentRepository;
import com.carrental.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CarRepository carRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private InvoiceService invoiceService;

    @InjectMocks
    private CustomerServiceImpl customerService;

    private Car sampleCar;
    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleCar = new Car();
        sampleCar.setId(1L);
        sampleCar.setBrand("Tata");
        sampleCar.setModel("Nexon");
        sampleCar.setColor("Blue");
        sampleCar.setPricePerDay(BigDecimal.valueOf(3000));
        sampleCar.setAvailable(true);

        sampleUser = new User();
        sampleUser.setId(10L);
        sampleUser.setName("Jane Doe");
        sampleUser.setEmail("jane@example.com");
        sampleUser.setRole(UserRole.CUSTOMER);
        sampleUser.setBlocked(false);
    }

    @Test
    void testGetAllCars() {
        when(carRepository.findAll()).thenReturn(List.of(sampleCar));
        List<CarDto> cars = customerService.getAllCars();
        assertEquals(1, cars.size());
        assertEquals("Tata", cars.get(0).getBrand());
    }

    @Test
    void testBookACarSuccess() {
        when(carRepository.findById(1L)).thenReturn(Optional.of(sampleCar));
        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleUser));
        when(bookingRepository.findAllByCarId(1L)).thenReturn(Collections.emptyList());

        BookACarDto dto = new BookACarDto();
        dto.setCarId(1L);
        dto.setUserId(10L);
        dto.setFromDate(LocalDateTime.now().plusDays(1));
        dto.setToDate(LocalDateTime.now().plusDays(3));
        dto.setBookingType(BookingType.SELF_DRIVE);

        boolean result = customerService.bookACar(dto);
        assertTrue(result);
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    void testBookACarRejectsOverlap() {
        LocalDateTime start = LocalDateTime.now().plusDays(1);
        LocalDateTime end = LocalDateTime.now().plusDays(3);

        Booking existing = new Booking();
        existing.setId(99L);
        existing.setFromDate(start);
        existing.setToDate(end);
        existing.setBookingStatus(BookingStatus.APPROVED);

        when(carRepository.findById(1L)).thenReturn(Optional.of(sampleCar));
        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleUser));
        when(bookingRepository.findAllByCarId(1L)).thenReturn(List.of(existing));

        BookACarDto dto = new BookACarDto();
        dto.setCarId(1L);
        dto.setUserId(10L);
        dto.setFromDate(start.plusHours(12));
        dto.setToDate(end.minusHours(6));
        dto.setBookingType(BookingType.SELF_DRIVE);

        boolean result = customerService.bookACar(dto);
        assertFalse(result);
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void testProcessPaymentSuccess() {
        Booking booking = new Booking();
        booking.setId(50L);
        booking.setPrice(4500.0);
        booking.setUser(sampleUser);
        booking.setPaymentStatus(PaymentStatus.PENDING);

        when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByBookingId(50L)).thenReturn(Optional.empty());

        boolean success = customerService.processPayment(50L, "TXN-TEST-123");
        assertTrue(success);
        assertEquals(PaymentStatus.PAID, booking.getPaymentStatus());
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    void testUpdateCustomerProfile() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleUser));

        UserDto dto = new UserDto();
        dto.setId(10L);
        dto.setName("Jane Updated");
        dto.setProfileImage("data:image/png;base64,sample");
        dto.setLicenseImage("data:image/png;base64,license");

        boolean updated = customerService.updateCustomerProfile(dto);
        assertTrue(updated);
        assertEquals("Jane Updated", sampleUser.getName());
        assertEquals("data:image/png;base64,sample", sampleUser.getProfileImage());
        assertEquals("data:image/png;base64,license", sampleUser.getLicenseImage());
        verify(userRepository, times(1)).save(sampleUser);
    }
}
