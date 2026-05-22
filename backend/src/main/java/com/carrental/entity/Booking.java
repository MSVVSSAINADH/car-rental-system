package com.carrental.entity;

import com.carrental.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    private LocalDateTime fromDate;
    private LocalDateTime toDate;

    private Long days;
    private Double price;

    @Enumerated(EnumType.STRING)
    private BookingStatus bookingStatus;

    @Enumerated(EnumType.STRING)
    private com.carrental.enums.BookingType bookingType;

    @Enumerated(EnumType.STRING)
    private com.carrental.enums.PaymentStatus paymentStatus;

    private String rejectionReason;
}
