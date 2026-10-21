package com.carrental.controller;

import com.carrental.dto.AppConfigDto;
import com.carrental.service.PricingPolicy;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public runtime configuration. Only non-sensitive product rules belong here.
 */
@RestController
@RequestMapping("/api")
public class ConfigController {

    @GetMapping("/config")
    public AppConfigDto getConfig() {
        return new AppConfigDto(PricingPolicy.INTRO_DISCOUNT_PERCENT, PricingPolicy.INTRO_BOOKING_LIMIT);
    }
}
