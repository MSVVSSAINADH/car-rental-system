package com.carrental.dto;

import com.carrental.configuration.FlexibleDateTimeDeserializer;
import com.carrental.enums.BookingStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;
import java.time.LocalDateTime;
import jakarta.validation.constraints.NotNull;

@Data
public class BookACarDto {
    private Long id;

    @NotNull(message = "Start date is required")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    @JsonDeserialize(using = FlexibleDateTimeDeserializer.class)
    private LocalDateTime fromDate;

    @NotNull(message = "End date is required")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    @JsonDeserialize(using = FlexibleDateTimeDeserializer.class)
    private LocalDateTime toDate;

    private Long days;
    private Double price;
    private BookingStatus bookingStatus;
    @NotNull(message = "Booking type is required")
    private com.carrental.enums.BookingType bookingType;
    @NotNull(message = "Car is required")
    private Long carId;
    private Long userId;
    private String username;
    private String email;
    private String carBrand;
    private String carModel;
    private String carImage;
    private String rejectionReason;
    private com.carrental.enums.PaymentStatus paymentStatus;

    // Compatibility accessors for varying frontend property names
    public Double getTotalPrice() {
        return price;
    }

    public void setTotalPrice(Double totalPrice) {
        this.price = totalPrice;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUserName() {
        return username;
    }

    public void setUserName(String userName) {
        this.username = userName;
    }

    public String getUserEmail() {
        return email;
    }

    public void setUserEmail(String userEmail) {
        this.email = userEmail;
    }

    public String getStatus() {
        return bookingStatus != null ? bookingStatus.name() : null;
    }

    public void setStatus(String status) {
        if (status != null) {
            try {
                this.bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            } catch (Exception ignored) {}
        }
    }
}
