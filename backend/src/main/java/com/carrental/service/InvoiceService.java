package com.carrental.service;

import com.carrental.entity.Booking;
import org.springframework.stereotype.Service;

@Service
public class InvoiceService {

    public String generateInvoiceHtml(Booking booking) {
        StringBuilder html = new StringBuilder();
        html.append("<html><body>");
        html.append("<h1>CarRentalX - Invoice</h1>");
        html.append("<p>Booking ID: #").append(booking.getId()).append("</p>");
        html.append("<p>Date: ").append(java.time.LocalDate.now()).append("</p>");
        html.append("<hr/>");
        html.append("<h3>Customer Details</h3>");
        html.append("<p>Name: ").append(HtmlEscaper.escape(booking.getUser().getName())).append("</p>");
        html.append("<p>Email: ").append(HtmlEscaper.escape(booking.getUser().getEmail())).append("</p>");
        html.append("<hr/>");
        html.append("<h3>Car Details</h3>");
        html.append("<p>Car: ").append(HtmlEscaper.escape(booking.getCar().getBrand())).append(" ").append(HtmlEscaper.escape(booking.getCar().getModel())).append("</p>");
        html.append("<p>Period: ").append(booking.getFromDate()).append(" to ").append(booking.getToDate()).append("</p>");
        html.append("<hr/>");
        html.append("<h3>Payment Summary</h3>");
        html.append("<p>Total Days: ").append(booking.getDays()).append("</p>");
        html.append("<p><strong>Total Amount: ₹").append(booking.getPrice()).append("</strong></p>");
        html.append("<p>Status: ").append(booking.getPaymentStatus()).append("</p>");
        html.append("<hr/>");
        html.append("<p>Thank you for choosing CarRentalX!</p>");
        html.append("</body></html>");
        return html.toString();
    }
}
