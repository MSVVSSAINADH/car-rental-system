package com.carrental.service;

import com.carrental.entity.Booking;
import com.carrental.entity.Car;
import com.carrental.entity.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

class InvoiceServiceTest {
    @Test
    void escapesUserSuppliedHtmlInInvoice() {
        User user = new User();
        user.setName("<script>alert(1)</script>");
        user.setEmail("customer@example.com");
        Car car = new Car();
        car.setBrand("<img src=x onerror=alert(1)>");
        car.setModel("Model");
        Booking booking = new Booking();
        booking.setId(1L);
        booking.setUser(user);
        booking.setCar(car);

        String html = new InvoiceService().generateInvoiceHtml(booking);

        assertFalse(html.contains("<script>alert(1)</script>"));
        assertFalse(html.contains("<img src=x onerror=alert(1)>"));
        assertTrue(html.contains("&lt;script&gt;"));
        assertTrue(html.contains("&lt;img"));
    }
}
