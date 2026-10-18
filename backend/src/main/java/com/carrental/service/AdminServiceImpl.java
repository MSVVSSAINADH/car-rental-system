package com.carrental.service;

import com.carrental.dto.AdminStatsDto;
import com.carrental.dto.BookACarDto;
import com.carrental.dto.CarDto;
import com.carrental.dto.UserDto;
import com.carrental.entity.Booking;
import com.carrental.entity.Car;
import com.carrental.entity.User;
import com.carrental.enums.BookingStatus;
import com.carrental.enums.UserRole;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.UserRepository;
import com.carrental.repository.PaymentRepository;
import com.carrental.enums.PaymentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Override
    public boolean postCar(CarDto carDto) {
        try {
            Car car = new Car();
            car.setBrand(carDto.getBrand());
            car.setModel(carDto.getModel());
            car.setColor(carDto.getColor());
            car.setPricePerDay(carDto.getPricePerDay());
            car.setYear(carDto.getYear());
            car.setTransmission(carDto.getTransmission());
            car.setDescription(carDto.getDescription());
            car.setFuelType(carDto.getFuelType());
            car.setImageUrl(carDto.getImageUrl());
            car.setSeats(carDto.getSeats());
            car.setCategory(carDto.getCategory());
            if (carDto.getAvailable() != null)
                car.setAvailable(carDto.getAvailable());
            carRepository.save(car);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public List<CarDto> getAllCars() {
        return carRepository.findAll().stream().map(Car::getCarDto).collect(Collectors.toList());
    }

    @Override
    public void deleteCar(Long id) {
        carRepository.deleteById(id);
    }

    @Override
    public CarDto getCarById(Long id) {
        Optional<Car> optionalCar = carRepository.findById(id);
        return optionalCar.map(Car::getCarDto).orElse(null);
    }

    @Override
    public boolean updateCar(Long id, CarDto carDto) {
        Optional<Car> optionalCar = carRepository.findById(id);
        if (optionalCar.isPresent()) {
            Car car = optionalCar.get();
            car.setBrand(carDto.getBrand());
            car.setModel(carDto.getModel());
            car.setColor(carDto.getColor());
            car.setPricePerDay(carDto.getPricePerDay());
            car.setYear(carDto.getYear());
            car.setTransmission(carDto.getTransmission());
            car.setDescription(carDto.getDescription());
            car.setFuelType(carDto.getFuelType());
            car.setImageUrl(carDto.getImageUrl());
            car.setSeats(carDto.getSeats());
            car.setCategory(carDto.getCategory());
            if (carDto.getAvailable() != null)
                car.setAvailable(carDto.getAvailable());
            carRepository.save(car);
            return true;
        }
        return false;
    }

    @Override
    public List<BookACarDto> getBookings() {
        return bookingRepository.findAll().stream().map(this::getBookingDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public boolean changeBookingStatus(Long bookingId, String status, String reason) {
        if (status == null || (!status.equalsIgnoreCase("Approve") && !status.equalsIgnoreCase("Reject"))) return false;
        Optional<Booking> optionalBooking = bookingRepository.findById(bookingId);
        if (optionalBooking.isPresent()) {
            Booking booking = optionalBooking.get();
            if (booking.getBookingStatus() != BookingStatus.PENDING) return false;
            Long userId = booking.getUser().getId();
            String carName = booking.getCar().getBrand() + " " + booking.getCar().getModel();
            if (status.equalsIgnoreCase("Approve")) {
                booking.setBookingStatus(BookingStatus.APPROVED);
                bookingRepository.save(booking);
                notificationService.sendNotification(userId,
                        "✅ Your booking for " + carName + " has been approved! Get ready to drive.");
            } else {
                booking.setBookingStatus(BookingStatus.REJECTED);
                booking.setRejectionReason(reason);
                String msg = "❌ Your booking for " + carName + " was rejected.";
                if (reason != null && !reason.isEmpty()) {
                    msg += " Reason: " + reason;
                }
                notificationService.sendNotification(userId, msg);
            }
            if (status.equalsIgnoreCase("Approve")) {
                emailService.sendBookingConfirmation(booking);
            } else {
                bookingRepository.save(booking);
            }
            return true;
        }
        return false;
    }

    @Override
    public AdminStatsDto getStats() {
        AdminStatsDto stats = new AdminStatsDto();
        stats.setTotalCars(carRepository.count());
        stats.setTotalBookings(bookingRepository.count());
        stats.setTotalUsers(userRepository.count());
        List<Booking> allBookings = bookingRepository.findAll();
        stats.setPendingBookings(allBookings.stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.PENDING).count());
        stats.setApprovedBookings(allBookings.stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.APPROVED).count());
        stats.setRejectedBookings(allBookings.stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.REJECTED).count());
        double totalRevenue = paymentRepository.findAll().stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.PAID)
                .mapToDouble(payment -> payment.getAmount() != null ? payment.getAmount() : 0)
                .sum();
        stats.setTotalRevenue(totalRevenue);
        return stats;
    }

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(u -> {
            UserDto dto = new UserDto();
            dto.setId(u.getId());
            dto.setName(u.getName());
            dto.setEmail(u.getEmail());
            dto.setRole(u.getRole());
            dto.setProfileImage(u.getProfileImage());
            dto.setBlocked(u.isBlocked());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public boolean blockUser(Long userId) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (user.getRole() != UserRole.CUSTOMER) return false;
            user.setBlocked(!user.isBlocked());
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }

    @Override
    public List<CarDto> getMostBookedCars() {
        List<Booking> allBookings = bookingRepository.findAll();
        return allBookings.stream()
            .collect(Collectors.groupingBy(b -> b.getCar(), Collectors.counting()))
            .entrySet().stream()
            .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
            .limit(5)
            .map(e -> e.getKey().getCarDto())
            .collect(Collectors.toList());
    }

    private BookACarDto getBookingDto(Booking booking) {
        BookACarDto bookingDto = new BookACarDto();
        bookingDto.setId(booking.getId());
        bookingDto.setFromDate(booking.getFromDate());
        bookingDto.setToDate(booking.getToDate());
        bookingDto.setDays(booking.getDays());
        bookingDto.setPrice(booking.getPrice());
        bookingDto.setBookingStatus(booking.getBookingStatus());
        bookingDto.setBookingType(booking.getBookingType());
        bookingDto.setCarId(booking.getCar().getId());
        bookingDto.setUserId(booking.getUser().getId());
        bookingDto.setUsername(booking.getUser().getName());
        bookingDto.setEmail(booking.getUser().getEmail());
        bookingDto.setCarBrand(booking.getCar().getBrand());
        bookingDto.setCarModel(booking.getCar().getModel());
        bookingDto.setCarImage(booking.getCar().getImageUrl());
        return bookingDto;
    }
}
