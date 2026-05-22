package com.carrental.controller;

import com.carrental.dto.ReviewDto;
import com.carrental.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin("*")
public class ReviewController {
    private final ReviewService reviewService;

    @PostMapping("/api/customer/review")
    public ResponseEntity<?> addReview(@RequestBody ReviewDto reviewDto) {
        ReviewDto saved = reviewService.addReview(reviewDto);
        if (saved == null)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to add review");
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/api/customer/car/{id}/reviews")
    public ResponseEntity<List<ReviewDto>> getCarReviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewsByCarId(id));
    }

    @GetMapping("/api/admin/reviews")
    public ResponseEntity<List<ReviewDto>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }
}
