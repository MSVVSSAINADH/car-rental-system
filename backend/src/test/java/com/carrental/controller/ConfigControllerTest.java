package com.carrental.controller;

import com.carrental.service.PricingPolicy;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ConfigControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void configIsPublicAndExposesThePricingRules() throws Exception {
        mockMvc.perform(get("/api/config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.discountPercent").value(PricingPolicy.INTRO_DISCOUNT_PERCENT))
                .andExpect(jsonPath("$.introBookingLimit").value(PricingPolicy.INTRO_BOOKING_LIMIT));
    }
}
