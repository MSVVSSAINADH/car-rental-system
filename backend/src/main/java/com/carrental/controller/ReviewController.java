package com.carrental.controller;

import com.carrental.dto.ReviewDto;
import com.carrental.service.ReviewService;
import com.carrental.repository.UserRepository;
import com.carrental.entity.User;
import com.carrental.enums.UserRole;
import org.springframework.security.core.Authentication;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;
    private final UserRepository userRepository;

    @PostMapping("/api/customer/review")
    public ResponseEntity<?> addReview(@jakarta.validation.Valid @RequestBody ReviewDto reviewDto, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null || user.getRole() != UserRole.CUSTOMER) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        reviewDto.setUserId(user.getId());
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
