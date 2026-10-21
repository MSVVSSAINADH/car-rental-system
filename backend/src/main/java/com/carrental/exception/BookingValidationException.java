package com.carrental.exception;

/**
 * A booking or quote request that fails a business rule (bad dates, car not
 * available, overlapping reservation). The message is safe to show to the
 * customer.
 */
public class BookingValidationException extends RuntimeException {
    public BookingValidationException(String message) {
        super(message);
    }
}
