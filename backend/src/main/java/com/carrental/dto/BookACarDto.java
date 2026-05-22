package com.carrental.dto;

import com.carrental.enums.BookingStatus;
import lombok.Data;
import java.time.LocalDate;

@Data
public class BookACarDto {
    private Long id;
    private java.time.LocalDateTime fromDate;
    private java.time.LocalDateTime toDate;
    private Long days;
    private Double price;
    private BookingStatus bookingStatus;
    private com.carrental.enums.BookingType bookingType;
    private Long carId;
    private Long userId;
    private String username;
    private String email;
    private String carBrand;
    private String carModel;
    private String carImage;
    private String rejectionReason;
    private com.carrental.enums.PaymentStatus paymentStatus;
}

