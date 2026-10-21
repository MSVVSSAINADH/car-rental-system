package com.carrental.service;

import java.math.BigDecimal;

/**
 * Single source of truth for the booking price rules. Both the booking flow
 * and the quote endpoint use it, and {@code GET /api/config} exposes the same
 * constants so the UI never hardcodes them.
 */
public final class PricingPolicy {

    /** Bookings a customer may hold before the introductory discount stops. */
    public static final int INTRO_BOOKING_LIMIT = 5;

    /** Percentage taken off the base price for an intro-eligible customer. */
    public static final int INTRO_DISCOUNT_PERCENT = 30;

    private PricingPolicy() {
    }

    public static boolean isIntroEligible(long priorBookings) {
        return priorBookings < INTRO_BOOKING_LIMIT;
    }

    public static Pricing quote(BigDecimal pricePerDay, long days, long priorBookings) {
        double basePrice = pricePerDay.doubleValue() * days;
        boolean eligible = isIntroEligible(priorBookings);
        double totalPrice = eligible
                ? Math.round(basePrice * (100 - INTRO_DISCOUNT_PERCENT) / 100.0)
                : basePrice;
        return new Pricing(basePrice, basePrice - totalPrice, totalPrice, eligible);
    }

    public record Pricing(double basePrice, double discountAmount, double totalPrice,
                          boolean introDiscountApplied) {
    }
}
