package com.carrental.service;

import com.carrental.dto.NotificationDto;
import java.util.List;

public interface NotificationService {
    void sendNotification(Long userId, String message);
    List<NotificationDto> getUserNotifications(Long userId);
    boolean markAsRead(Long notifId);
    long getUnreadCount(Long userId);
}
