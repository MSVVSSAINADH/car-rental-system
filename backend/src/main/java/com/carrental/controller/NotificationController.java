package com.carrental.controller;

import com.carrental.dto.NotificationDto;
import com.carrental.service.NotificationService;
import com.carrental.repository.UserRepository;
import com.carrental.repository.NotificationRepository;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @GetMapping("/notifications/{userId}")
    public ResponseEntity<List<NotificationDto>> getNotifications(@PathVariable Long userId, Authentication authentication) {
        if (!ownsUserId(userId, authentication)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/notifications/{userId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId, Authentication authentication) {
        if (!ownsUserId(userId, authentication)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @PutMapping("/notification/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Authentication authentication) {
        Long userId = userRepository.findByEmail(authentication.getName()).map(user -> user.getId()).orElse(null);
        if (userId == null || notificationRepository.findByIdAndUserId(id, userId).isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        boolean success = notificationService.markAsRead(id);
        if (success) return ResponseEntity.ok().build();
        return ResponseEntity.notFound().build();
    }

    private boolean ownsUserId(Long userId, Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .filter(user -> user.getId().equals(userId))
                .isPresent();
    }
}
