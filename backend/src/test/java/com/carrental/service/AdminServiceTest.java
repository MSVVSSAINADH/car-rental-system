package com.carrental.service;

import com.carrental.dto.AdminStatsDto;
import com.carrental.dto.CarDto;
import com.carrental.entity.Booking;
import com.carrental.entity.Car;
import com.carrental.entity.User;
import com.carrental.enums.BookingStatus;
import com.carrental.enums.UserRole;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.UserRepository;
import com.carrental.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private CarRepository carRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AdminServiceImpl adminService;

    private User sampleUser;
    private Car sampleCar;
    private Booking sampleBooking;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setName("Customer One");
        sampleUser.setEmail("cust1@example.com");
        sampleUser.setRole(UserRole.CUSTOMER);
        sampleUser.setBlocked(false);

        sampleCar = new Car();
        sampleCar.setId(5L);
        sampleCar.setBrand("Hyundai");
        sampleCar.setModel("Creta");
        sampleCar.setColor("White");
        sampleCar.setPricePerDay(BigDecimal.valueOf(4500));
        sampleCar.setAvailable(true);

        sampleBooking = new Booking();
        sampleBooking.setId(100L);
        sampleBooking.setUser(sampleUser);
        sampleBooking.setCar(sampleCar);
        sampleBooking.setBookingStatus(BookingStatus.PENDING);
        sampleBooking.setPrice(9000.0);
    }

    @Test
    void testPostCar() {
        CarDto dto = new CarDto();
        dto.setBrand("Honda");
        dto.setModel("City");
        dto.setColor("Grey");
        dto.setPricePerDay(BigDecimal.valueOf(4000));

        boolean result = adminService.postCar(dto);
        assertTrue(result);
        verify(carRepository, times(1)).save(any(Car.class));
    }

    @Test
    void testChangeBookingStatusApprove() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(sampleBooking));

        boolean success = adminService.changeBookingStatus(100L, "Approve", null);
        assertTrue(success);
        assertEquals(BookingStatus.APPROVED, sampleBooking.getBookingStatus());
        verify(emailService, times(1)).sendBookingConfirmation(sampleBooking);
        verify(notificationService, times(1)).sendNotification(eq(1L), contains("approved"));
        verify(bookingRepository, times(1)).save(sampleBooking);
    }

    @Test
    void testChangeBookingStatusReject() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(sampleBooking));

        boolean success = adminService.changeBookingStatus(100L, "Reject", "Invalid driving license");
        assertTrue(success);
        assertEquals(BookingStatus.REJECTED, sampleBooking.getBookingStatus());
        assertEquals("Invalid driving license", sampleBooking.getRejectionReason());
        verify(notificationService, times(1)).sendNotification(eq(1L), contains("Invalid driving license"));
        verify(bookingRepository, times(1)).save(sampleBooking);
    }

    @Test
    void testBlockUserToggle() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        boolean result = adminService.blockUser(1L);
        assertTrue(result);
        assertTrue(sampleUser.isBlocked());

        // Toggle back
        adminService.blockUser(1L);
        assertFalse(sampleUser.isBlocked());
    }

    @Test
    void testCannotBlockAdministrator() {
        sampleUser.setRole(UserRole.ADMIN);
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        assertFalse(adminService.blockUser(1L));
        assertFalse(sampleUser.isBlocked());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testGetStats() {
        when(carRepository.count()).thenReturn(10L);
        when(bookingRepository.count()).thenReturn(2L);
        when(userRepository.count()).thenReturn(5L);

        sampleBooking.setBookingStatus(BookingStatus.APPROVED);
        when(bookingRepository.findAll()).thenReturn(List.of(sampleBooking));

        AdminStatsDto stats = adminService.getStats();
        assertEquals(10L, stats.getTotalCars());
        assertEquals(2L, stats.getTotalBookings());
        assertEquals(5L, stats.getTotalUsers());
        assertEquals(1L, stats.getApprovedBookings());
        assertEquals(0.0, stats.getTotalRevenue());
    }
}
