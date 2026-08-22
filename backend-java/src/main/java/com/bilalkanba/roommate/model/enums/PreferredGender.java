package com.bilalkanba.roommate.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum PreferredGender {
    male,
    female,
    any;

    @JsonValue
    public String toValue() {
        return this.name();
    }

    @JsonCreator
    public static PreferredGender fromValue(String value) {
        if (value == null) return null;
        return PreferredGender.valueOf(value.toLowerCase());
    }
}