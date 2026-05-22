package com.carrental.dto;

import lombok.Data;

@Data
public class AdminStatsDto {
    private long totalCars;
    private long totalBookings;
    private double totalRevenue;
    private long pendingBookings;
    private long totalUsers;
    private long approvedBookings;
    private long rejectedBookings;
}
