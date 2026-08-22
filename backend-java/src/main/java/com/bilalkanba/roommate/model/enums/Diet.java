package com.bilalkanba.roommate.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Diet {
    omnivore,
    vegetarian,
    vegan,
    halal,
    kosher,
    other;

    @JsonValue
    public String toValue() {
        return this.name();
    }

    @JsonCreator
    public static Diet fromValue(String value) {
        if (value == null) return null;
        return Diet.valueOf(value.toLowerCase());
    }
}