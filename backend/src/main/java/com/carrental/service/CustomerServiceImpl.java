package com.carrental.service;

import com.carrental.dto.BookACarDto;
import com.carrental.dto.CarDto;
import com.carrental.dto.UserDto;
import com.carrental.entity.Booking;
import com.carrental.entity.Car;
import com.carrental.entity.User;
import com.carrental.enums.BookingStatus;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final InvoiceService invoiceService;

    @Override
    public List<CarDto> getAllCars() {
        return carRepository.findAll().stream().map(Car::getCarDto).collect(Collectors.toList());
    }

    @Override
    public boolean bookACar(BookACarDto bookACarDto) {
        if (bookACarDto.getCarId() == null || bookACarDto.getUserId() == null ||
                bookACarDto.getFromDate() == null || bookACarDto.getToDate() == null ||
                bookACarDto.getBookingType() == null ||
                bookACarDto.getFromDate().toLocalDate().isBefore(java.time.LocalDate.now()) ||
                !bookACarDto.getToDate().isAfter(bookACarDto.getFromDate())) {
            return false;
        }
        Optional<Car> optionalCar = carRepository.findById(bookACarDto.getCarId());
        Optional<User> optionalUser = userRepository.findById(bookACarDto.getUserId());

        if (optionalCar.isPresent() && optionalUser.isPresent()) {
            Car car = optionalCar.get();
            User user = optionalUser.get();
            if (!car.isAvailable() || user.isBlocked()) return false;
            if (bookACarDto.getBookingType() == com.carrental.enums.BookingType.SELF_DRIVE &&
                    (user.getLicenseImage() == null || user.getLicenseImage().isBlank())) return false;

            // 1. Availability Check (Overlap Detection)
            List<Booking> existingBookings = bookingRepository.findAllByCarId(car.getId());
            boolean isOverlapping = existingBookings.stream().anyMatch(b -> 
                b.getBookingStatus() != BookingStatus.REJECTED && 
                b.getBookingStatus() != BookingStatus.CANCELLED &&
                bookACarDto.getFromDate().isBefore(b.getToDate()) && 
                bookACarDto.getToDate().isAfter(b.getFromDate())
            );

            if (isOverlapping) return false;

            Booking booking = new Booking();
            booking.setUser(user);
            booking.setCar(car);
            booking.setFromDate(bookACarDto.getFromDate());
            booking.setToDate(bookACarDto.getToDate());
            booking.setBookingStatus(BookingStatus.PENDING);
            booking.setBookingType(bookACarDto.getBookingType());
            booking.setPaymentStatus(com.carrental.enums.PaymentStatus.PENDING);

            long days = java.time.temporal.ChronoUnit.DAYS.between(
                    bookACarDto.getFromDate().toLocalDate(), bookACarDto.getToDate().toLocalDate());
            if (days <= 0) return false;
            boolean eligibleForIntroDiscount = bookingRepository.findAllByUserId(user.getId()).size() < 5;
            double totalPrice = car.getPricePerDay().doubleValue() * days;
            if (eligibleForIntroDiscount) totalPrice = Math.round(totalPrice * 0.7);

            booking.setDays(days);
            booking.setPrice(totalPrice);

            bookingRepository.save(booking);
            return true;
        }
        return false;
    }

    @Override
    public CarDto getCarById(Long id) {
        Optional<Car> optionalCar = carRepository.findById(id);
        return optionalCar.map(Car::getCarDto).orElse(null);
    }

    @Override
    public List<BookACarDto> getBookingsByUserId(Long userId) {
        return bookingRepository.findAllByUserId(userId).stream().map(this::getBookingDto).collect(Collectors.toList());
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
        bookingDto.setPaymentStatus(booking.getPaymentStatus());
        bookingDto.setRejectionReason(booking.getRejectionReason());
        bookingDto.setCarId(booking.getCar().getId());
        bookingDto.setUserId(booking.getUser().getId());
        bookingDto.setUsername(booking.getUser().getName());
        bookingDto.setEmail(booking.getUser().getEmail());
        bookingDto.setCarBrand(booking.getCar().getBrand());
        bookingDto.setCarModel(booking.getCar().getModel());
        bookingDto.setCarImage(booking.getCar().getImageUrl());
        return bookingDto;
    }

    @Override
    public UserDto getCustomerProfile(Long userId) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            UserDto userDto = new UserDto();
            userDto.setId(user.getId());
            userDto.setName(user.getName());
            userDto.setEmail(user.getEmail());
            userDto.setRole(user.getRole());
            userDto.setProfileImage(user.getProfileImage());
            userDto.setLicenseImage(user.getLicenseImage());
            return userDto;
        }
        return null;
    }

    @Override
    public boolean updateCustomerProfile(UserDto userDto) {
        Optional<User> optionalUser = userRepository.findById(userDto.getId());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setName(userDto.getName());
            if (userDto.getProfileImage() != null)
                user.setProfileImage(userDto.getProfileImage());
            if (userDto.getLicenseImage() != null)
                user.setLicenseImage(userDto.getLicenseImage());

            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    public String generateInvoice(Long bookingId) {
        return bookingRepository.findById(bookingId).map(invoiceService::generateInvoiceHtml).orElse(null);
    }

    @Override
    public boolean processPayment(Long bookingId, String transactionId) {
        // Payment confirmation must come from a trusted payment provider integration.
        return false;
    }
}
