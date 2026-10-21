package com.carrental.repository;

import com.carrental.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findAllByUserId(Long userId);
    List<Booking> findAllByCarId(Long carId);
    boolean existsByCarId(Long carId);
    Optional<Booking> findByIdAndUserEmail(Long id, String email);
}
