package com.carrental.service;

import com.carrental.dto.BookACarDto;
import com.carrental.entity.Car;
import com.carrental.entity.User;
import com.carrental.enums.BookingType;
import com.carrental.enums.UserRole;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Integration test for the double-booking race in {@link CustomerServiceImpl#bookACar}.
 *
 * The car row is locked with a pessimistic write lock (SELECT ... FOR UPDATE) so
 * that overlapping booking checks and inserts for the same car are serialized.
 * This test boots the real Spring context against H2 and races several
 * simultaneous requests for the same car and dates: exactly one may win.
 */
@SpringBootTest
class CustomerServiceConcurrencyTest {

    private static final int RACING_BOOKINGS = 2;

    @Autowired
    private CustomerService customerService;
    @Autowired
    private CarRepository carRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BookingRepository bookingRepository;

    private Car car;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;

    @BeforeEach
    void setUp() {
        String unique = UUID.randomUUID().toString().substring(0, 8);

        car = new Car();
        car.setBrand("Test");
        car.setModel("Racer-" + unique);
        car.setColor("Blue");
        car.setTransmission("Manual");
        car.setFuelType("Petrol");
        car.setYear(2024);
        car.setPricePerDay(BigDecimal.valueOf(3000));
        car.setAvailable(true);
        car.setSeats(5);
        car.setCategory("Economy");
        car = carRepository.save(car);

        fromDate = LocalDateTime.now().plusDays(1).withHour(9).withMinute(0).withSecond(0).withNano(0);
        toDate = fromDate.plusDays(2);
    }

    @Test
    void concurrentOverlappingBookingsProduceExactlyOneBooking() throws Exception {
        List<User> users = new ArrayList<>();
        for (int i = 0; i < RACING_BOOKINGS; i++) {
            users.add(createCustomer("racer-" + i + "-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com"));
        }

        CyclicBarrier startLine = new CyclicBarrier(RACING_BOOKINGS);
        ExecutorService pool = Executors.newFixedThreadPool(RACING_BOOKINGS);
        List<Boolean> results = new CopyOnWriteArrayList<>();
        List<Throwable> failures = new CopyOnWriteArrayList<>();

        try {
            for (User user : users) {
                pool.submit(() -> {
                    try {
                        startLine.await(10, TimeUnit.SECONDS);
                        results.add(customerService.bookACar(buildRequest(user)));
                    } catch (Throwable t) {
                        failures.add(t);
                    }
                });
            }
            pool.shutdown();
            assertTrue(pool.awaitTermination(30, TimeUnit.SECONDS), "Booking threads did not finish in time");
        } finally {
            pool.shutdownNow();
        }

        assertEquals(List.of(), failures, "No request may fail with an exception (lock timeouts would surface here)");
        assertEquals(RACING_BOOKINGS, results.size(), "Every racing request must complete");
        assertEquals(1, results.stream().filter(Boolean::booleanValue).count(),
                "Exactly one overlapping booking may be accepted");
        assertEquals(1, bookingRepository.findAllByCarId(car.getId()).size(),
                "Exactly one booking row may exist for the car and date range");
    }

    @Test
    void nonOverlappingBookingAfterConcurrentRoundStillSucceeds() throws Exception {
        User user = createCustomer("sequential-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com");

        assertTrue(customerService.bookACar(buildRequest(user)), "First booking should succeed");

        // A later, non-overlapping request must not be blocked by the lock discipline.
        BookACarDto followUp = buildRequest(user);
        followUp.setFromDate(toDate.plusDays(10));
        followUp.setToDate(toDate.plusDays(12));
        assertTrue(customerService.bookACar(followUp), "Non-overlapping booking should succeed");
        assertEquals(2, bookingRepository.findAllByCarId(car.getId()).size());
    }

    private BookACarDto buildRequest(User user) {
        BookACarDto dto = new BookACarDto();
        dto.setCarId(car.getId());
        dto.setUserId(user.getId());
        dto.setFromDate(fromDate);
        dto.setToDate(toDate);
        dto.setBookingType(BookingType.SELF_DRIVE);
        return dto;
    }

    private User createCustomer(String email) {
        User user = new User();
        user.setName("Race Tester");
        user.setEmail(email);
        user.setPassword("encoded-password-not-used-by-this-test");
        user.setRole(UserRole.CUSTOMER);
        user.setBlocked(false);
        user.setLicenseImage("data:image/png;base64,dGVzdA==");
        return userRepository.save(user);
    }
}
