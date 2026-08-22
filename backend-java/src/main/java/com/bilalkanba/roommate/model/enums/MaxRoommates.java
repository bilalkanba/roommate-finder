package com.bilalkanba.roommate.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum MaxRoommates {
    solo,
    one,
    two,
    three_plus,
    any;

    @JsonValue
    public String toValue() {
        return this.name();
    }

    @JsonCreator
    public static MaxRoommates fromValue(String value) {
        if (value == null) return null;
        return MaxRoommates.valueOf(value.toLowerCase());
    }
}