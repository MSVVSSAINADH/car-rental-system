package com.carrental.service;

import com.carrental.entity.Booking;
import com.carrental.enums.BookingType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender javaMailSender;

    @Override
    public void sendBookingConfirmation(Booking booking) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(booking.getUser().getEmail());
            helper.setSubject("Booking Confirmed - " + booking.getCar().getBrand() + " " + booking.getCar().getModel());

            StringBuilder body = new StringBuilder();
            body.append("<h1>Booking Confirmation</h1>");
            body.append("<p>Dear " + booking.getUser().getName() + ",</p>");
            body.append("<p>Your booking has been approved! Here are the details:</p>");

            // Receipt Details
            body.append("<h2>Receipt</h2>");
            body.append("<ul>");
            body.append("<li><strong>Car:</strong> " + booking.getCar().getBrand() + " " + booking.getCar().getModel()
                    + " (" + booking.getCar().getYear() + ")</li>");
            body.append(
                    "<li><strong>Dates:</strong> " + booking.getFromDate() + " to " + booking.getToDate() + "</li>");
            body.append("<li><strong>Total Days:</strong> " + booking.getDays() + "</li>");
            body.append("<li><strong>Price Per Day:</strong> $" + booking.getCar().getPricePerDay() + "</li>");
            body.append("<li><strong>Total Price:</strong> $" + booking.getPrice() + "</li>");
            body.append("</ul>");

            // Conditional Instructions
            body.append("<h2>Instructions</h2>");
            if (BookingType.SELF_DRIVE.equals(booking.getBookingType())) {
                body.append("<p><strong>You have chosen Self-Drive.</strong></p>");
                body.append("<ul>");
                body.append(
                        "<li>Please bring your original driving license and ID proof for verification at the time of pickup.</li>");
                body.append("<li>Ensure you inspect the car before taking delivery.</li>");
                body.append("<li>A security deposit may be blocked on your credit card.</li>");
                body.append("</ul>");
            } else if (BookingType.WITH_DRIVER.equals(booking.getBookingType())) {
                body.append("<p><strong>You have chosen Chauffeur-Driven service.</strong></p>");
                body.append("<ul>");
                body.append("<li>Your driver will contact you 1 hour before the scheduled time.</li>");
                body.append("<li>Fuel and driver allowance are included in the price.</li>");
                body.append("<li>Tolls and parking charges are to be paid directly by you.</li>");
                body.append("</ul>");
            } else {
                // Fallback if booking type is null or unknown
                body.append("<p>Thank you for booking with us. Please contact support for specific instructions.</p>");
            }

            body.append("<br/><p>Safe Travels,<br/>Car Rental Team</p>");

            helper.setText(body.toString(), true);

            javaMailSender.send(message);
            System.out.println("Email sent successfully to " + booking.getUser().getEmail());

        } catch (MessagingException e) {
            e.printStackTrace();
            System.err.println("Failed to send email: " + e.getMessage());
        } catch (Exception e) {
            // Catch all to prevent crashing admin approval flow if email fails
            System.err.println("Error sending email: " + e.getMessage());
        }
    }
}
