package com.carrental.service;

import com.carrental.entity.Booking;

public interface EmailService {
    void sendBookingConfirmation(Booking booking);
}
