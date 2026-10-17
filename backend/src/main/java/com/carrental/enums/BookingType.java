package com.carrental.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum BookingType {
    SELF_DRIVE,
    WITH_DRIVER;

    @JsonCreator
    public static BookingType fromString(String value) {
        if (value == null) return null;
        String val = value.trim().toUpperCase();
        if (val.equals("SELF") || val.equals("SELF_DRIVE") || val.equals("SELF-DRIVE")) {
            return SELF_DRIVE;
        }
        if (val.equals("DRIVER") || val.equals("WITH_DRIVER") || val.equals("WITH-DRIVER") || val.equals("CHAUFFEUR")) {
            return WITH_DRIVER;
        }
        for (BookingType type : BookingType.values()) {
            if (type.name().equalsIgnoreCase(val)) {
                return type;
            }
        }
        return SELF_DRIVE;
    }
}
