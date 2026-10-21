package com.carrental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Server-computed price for a car and date range. The booking endpoint uses
 * the same rules, so this is the authoritative figure rather than an estimate.
 */
@Data
@AllArgsConstructor
public class QuoteDto {
    private Long carId;
    private long days;
    private BigDecimal pricePerDay;
    private double basePrice;
    private int discountPercent;
    private double discountAmount;
    private double totalPrice;
    private boolean eligibleForDiscount;
}
