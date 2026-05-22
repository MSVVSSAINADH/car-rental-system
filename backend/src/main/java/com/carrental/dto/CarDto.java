package com.carrental.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CarDto {
    private Long id;
    @NotBlank(message = "Brand is required")
    private String brand;
    @NotBlank(message = "Model is required")
    private String model;
    @NotBlank(message = "Color is required")
    private String color;
    private String transmission;
    private String fuelType;
    private int year;
    @NotNull(message = "Price per day is required")
    @Min(value = 1, message = "Price must be at least 1")
    private BigDecimal pricePerDay;
    private String description;
    private String imageUrl;
    private Boolean available;
    @Min(value = 1, message = "Seats must be at least 1")
    private int seats;
    private String category;
}
