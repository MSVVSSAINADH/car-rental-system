package com.carrental.repository;

import com.carrental.entity.Car;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarRepository extends JpaRepository<Car, Long> {

    /**
     * Loads a car while holding a row-level write lock (SELECT ... FOR UPDATE).
     * Booking creation must use this instead of findById so that overlapping
     * booking checks and inserts for the same car are serialized, preventing
     * two concurrent requests from double-booking the vehicle.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Car c where c.id = :id")
    Optional<Car> findByIdForUpdate(@Param("id") Long id);
}
