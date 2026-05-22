package com.carrental.service;

import com.carrental.dto.ReviewDto;
import java.util.List;

public interface ReviewService {
    ReviewDto addReview(ReviewDto reviewDto);
    List<ReviewDto> getReviewsByCarId(Long carId);
    List<ReviewDto> getAllReviews();
}
