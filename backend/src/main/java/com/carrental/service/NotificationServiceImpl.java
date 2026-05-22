package com.carrental.service;

import com.carrental.dto.NotificationDto;
import com.carrental.entity.Notification;
import com.carrental.entity.User;
import com.carrental.repository.NotificationRepository;
import com.carrental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public void sendNotification(Long userId, String message) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) return;
        Notification notification = new Notification();
        notification.setUser(user.get());
        notification.setMessage(message);
        notificationRepository.save(notification);
    }

    @Override
    public List<NotificationDto> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public boolean markAsRead(Long notifId) {
        Optional<Notification> notif = notificationRepository.findById(notifId);
        if (notif.isEmpty()) return false;
        notif.get().setRead(true);
        notificationRepository.save(notif.get());
        return true;
    }

    @Override
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    private NotificationDto toDto(Notification n) {
        NotificationDto dto = new NotificationDto();
        dto.setId(n.getId());
        dto.setUserId(n.getUser().getId());
        dto.setMessage(n.getMessage());
        dto.setRead(n.isRead());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
