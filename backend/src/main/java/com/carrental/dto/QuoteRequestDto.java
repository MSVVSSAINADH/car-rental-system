package com.carrental.dto;

import com.carrental.configuration.FlexibleDateTimeDeserializer;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class QuoteRequestDto {
    @NotNull(message = "Car is required")
    private Long carId;

    @NotNull(message = "Start date is required")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    @JsonDeserialize(using = FlexibleDateTimeDeserializer.class)
    private LocalDateTime fromDate;

    @NotNull(message = "End date is required")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    @JsonDeserialize(using = FlexibleDateTimeDeserializer.class)
    private LocalDateTime toDate;
}
