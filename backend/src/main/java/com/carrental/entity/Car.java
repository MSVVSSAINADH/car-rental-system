package com.carrental.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import com.carrental.dto.CarDto;

@Entity
@Data
@Table(name = "cars")
public class Car {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String brand;
    private String model;
    private String color;
    private String transmission;
    private String fuelType;
    private int year;

    private BigDecimal pricePerDay;

    @Column(length = 1000)
    private String description;

    private String imageUrl;

    private boolean available = true;

    private int seats;

    private String category; // Budget, Mid-range, Family, SUV, Electric, Premium

    public CarDto getCarDto() {
        CarDto carDto = new CarDto();
        carDto.setId(id);
        carDto.setBrand(brand);
        carDto.setModel(model);
        carDto.setColor(color);
        carDto.setPricePerDay(pricePerDay);
        carDto.setYear(year);
        carDto.setTransmission(transmission);
        carDto.setDescription(description);
        carDto.setFuelType(fuelType);
        carDto.setImageUrl(imageUrl);
        carDto.setAvailable(available);
        carDto.setSeats(seats);
        carDto.setCategory(category);
        return carDto;
    }
}
