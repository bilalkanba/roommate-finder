package com.bilalkanba.roommate.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum SocialLevel {
    very_private,
    balanced,
    very_social;

    @JsonValue
    public String toValue() {
        return this.name();
    }

    @JsonCreator
    public static SocialLevel fromValue(String value) {
        if (value == null) return null;
        return SocialLevel.valueOf(value.toLowerCase());
    }
}