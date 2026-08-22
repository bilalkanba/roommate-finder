package com.bilalkanba.roommate.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum LifestyleLevel {
    very_low,
    low,
    medium,
    high,
    very_high;

    @JsonValue
    public String toValue() {
        return this.name();
    }

    @JsonCreator
    public static LifestyleLevel fromValue(String value) {
        if (value == null) return null;
        return LifestyleLevel.valueOf(value.toLowerCase());
    }
}