package com.carrental.configuration;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Component
public class RateLimitingInterceptor implements HandlerInterceptor {

    private final Map<String, Long> requestCounts = new ConcurrentHashMap<>();
    private static final int LIMIT = 30; // requests per minute
    private static final long WINDOW = TimeUnit.MINUTES.toMillis(1);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String ip = request.getRemoteAddr();
        String key = ip + ":" + request.getRequestURI();
        
        long now = System.currentTimeMillis();
        requestCounts.entrySet().removeIf(entry -> now - entry.getValue() > WINDOW);

        long count = requestCounts.keySet().stream().filter(k -> k.startsWith(ip + ":")).count();

        if (count >= LIMIT) {
            response.setStatus(429); // Too Many Requests
            response.getWriter().write("Too many requests. Please try again later.");
            return false;
        }

        requestCounts.put(key + ":" + now, now);
        return true;
    }
}
