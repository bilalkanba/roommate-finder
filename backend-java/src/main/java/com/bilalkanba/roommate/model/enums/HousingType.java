package com.bilalkanba.roommate.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum HousingType {
    entire_apartment,
    private_room,
    shared_room,
    studio,
    any;

    @JsonValue
    public String toValue() {
        return this.name();
    }

    @JsonCreator
    public static HousingType fromValue(String value) {
        if (value == null) return null;
        return HousingType.valueOf(value.toLowerCase());
    }
}