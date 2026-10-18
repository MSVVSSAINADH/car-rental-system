package com.carrental.dto;

import lombok.Data;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Data
public class ReviewDto {
    private Long id;
    private Long carId;
    private Long userId;
    private String userName;
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private int rating;
    @Size(max = 1000, message = "Comment must be at most 1000 characters")
    private String comment;
    private LocalDateTime createdAt;
}
