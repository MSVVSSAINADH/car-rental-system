package com.carrental.configuration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil("test-only-jwt-secret-value-that-is-long-enough");
    }

    @Test
    void testGenerateAndValidateToken() {
        String token = jwtUtil.generateToken("user@example.com", "CUSTOMER");
        assertNotNull(token);
        assertTrue(jwtUtil.isTokenValid(token));
        assertEquals("user@example.com", jwtUtil.extractEmail(token));
        assertEquals("CUSTOMER", jwtUtil.extractRole(token));
    }

    @Test
    void testInvalidToken() {
        assertFalse(jwtUtil.isTokenValid("invalid.jwt.token"));
    }
}
