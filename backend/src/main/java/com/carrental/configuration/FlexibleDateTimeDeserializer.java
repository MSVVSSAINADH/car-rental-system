package com.carrental.configuration;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class FlexibleDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {

    @Override
    public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String text = p.getText();
        if (text == null || text.trim().isEmpty()) {
            return null;
        }
        text = text.trim();
        try {
            if (text.length() == 10) {
                return LocalDate.parse(text).atStartOfDay();
            }
            if (text.endsWith("Z")) {
                return java.time.Instant.parse(text).atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
            }
            if (text.contains("T")) {
                return LocalDateTime.parse(text, DateTimeFormatter.ISO_DATE_TIME);
            }
            return LocalDateTime.parse(text, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        } catch (Exception e) {
            try {
                return LocalDate.parse(text.substring(0, 10)).atStartOfDay();
            } catch (Exception ex) {
                return null;
            }
        }
    }
}
