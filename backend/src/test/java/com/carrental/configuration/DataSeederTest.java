package com.carrental.configuration;

import com.carrental.entity.Booking;
import com.carrental.entity.Car;
import com.carrental.entity.User;
import com.carrental.enums.BookingStatus;
import com.carrental.enums.BookingType;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.UserRole;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class DataSeederTest {

    @Autowired
    private DataSeeder dataSeeder;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void seedsTheCanonicalThirtyCarFleetInSixCategories() {
        List<Car> cars = carRepository.findAll();

        assertEquals(30, cars.size(), "the demo fleet should have exactly 30 cars");

        Map<String, Long> perCategory = cars.stream()
                .collect(Collectors.groupingBy(Car::getCategory, Collectors.counting()));
        assertEquals(Map.of(
                "Budget", 8L,
                "Mid-range", 9L,
                "Family", 4L,
                "SUV", 5L,
                "Electric", 2L,
                "Premium", 2L), perCategory);

        // Legacy category values must not survive the seed.
        assertTrue(cars.stream().allMatch(car -> DataSeeder.CATEGORIES.contains(car.getCategory())));
        assertTrue(cars.stream().allMatch(car -> car.getCategory() != null));
        // No unique photos exist yet, so the catalogue intentionally ships none.
        assertTrue(cars.stream().allMatch(car -> car.getImageUrl() == null));
    }

    @Test
    void reconcileRemovesStaleCarsButRetiresCarsWithBookingHistory() {
        Car deletable = carRepository.save(car("Maruti Suzuki", "Punch"));
        Car booked = carRepository.save(car("Honda", "Amaze"));

        User customer = new User();
        customer.setName("Seed Test");
        customer.setEmail("seed-test@example.com");
        customer.setPassword("irrelevant");
        customer.setRole(UserRole.CUSTOMER);
        userRepository.save(customer);

        Booking booking = new Booking();
        booking.setCar(booked);
        booking.setUser(customer);
        booking.setFromDate(LocalDateTime.now().plusDays(2));
        booking.setToDate(LocalDateTime.now().plusDays(4));
        booking.setDays(2L);
        booking.setPrice(1000.0);
        booking.setBookingStatus(BookingStatus.PENDING);
        booking.setBookingType(BookingType.SELF_DRIVE);
        booking.setPaymentStatus(PaymentStatus.PENDING);
        bookingRepository.save(booking);

        dataSeeder.reconcileFleet();

        assertNull(carRepository.findById(deletable.getId()).orElse(null),
                "a stale car without bookings should be removed from the fleet");

        Car retired = carRepository.findById(booked.getId()).orElse(null);
        assertNotNull(retired, "a stale car with bookings must be kept for its history");
        assertFalse(retired.isAvailable(), "a retired car must not be bookable");
        assertNotNull(bookingRepository.findById(booking.getId()).orElse(null));

        // The canonical catalogue itself is untouched by the stale rows.
        assertEquals(30, carRepository.findAll().stream()
                .filter(car -> DataSeeder.CATEGORIES.contains(car.getCategory()))
                .count());
    }

    private static Car car(String brand, String model) {
        Car car = new Car();
        car.setBrand(brand);
        car.setModel(model);
        car.setColor("White");
        car.setTransmission("Manual");
        car.setFuelType("Petrol");
        car.setYear(2023);
        car.setPricePerDay(BigDecimal.valueOf(2000));
        car.setSeats(5);
        car.setCategory("Economy");
        car.setAvailable(true);
        return car;
    }
}
