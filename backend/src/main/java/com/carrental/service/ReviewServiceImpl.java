package com.carrental.service;

import com.carrental.dto.ReviewDto;
import com.carrental.entity.Car;
import com.carrental.entity.Review;
import com.carrental.entity.User;
import com.carrental.repository.CarRepository;
import com.carrental.repository.ReviewRepository;
import com.carrental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository reviewRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    @Override
    public ReviewDto addReview(ReviewDto reviewDto) {
        Optional<User> user = userRepository.findById(reviewDto.getUserId());
        Optional<Car> car = carRepository.findById(reviewDto.getCarId());
        if (user.isEmpty() || car.isEmpty()) return null;

        Review review = new Review();
        review.setUser(user.get());
        review.setCar(car.get());
        review.setRating(reviewDto.getRating());
        review.setComment(reviewDto.getComment());
        Review saved = reviewRepository.save(review);
        return toDto(saved);
    }

    @Override
    public List<ReviewDto> getReviewsByCarId(Long carId) {
        return reviewRepository.findByCarId(carId).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<ReviewDto> getAllReviews() {
        return reviewRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    private ReviewDto toDto(Review review) {
        ReviewDto dto = new ReviewDto();
        dto.setId(review.getId());
        dto.setCarId(review.getCar().getId());
        dto.setUserId(review.getUser().getId());
        dto.setUserName(review.getUser().getName());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
}
