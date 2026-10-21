package com.carrental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Public, non-secret application settings the UI needs in order to describe
 * pricing correctly instead of hardcoding the numbers.
 */
@Data
@AllArgsConstructor
public class AppConfigDto {
    private int discountPercent;
    private int introBookingLimit;
}
