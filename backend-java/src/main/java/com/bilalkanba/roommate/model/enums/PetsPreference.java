package com.bilalkanba.roommate.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum PetsPreference {
    no_pets,
    has_pet,
    ok_with_pets;

    @JsonValue
    public String toValue() {
        return this.name();
    }

    @JsonCreator
    public static PetsPreference fromValue(String value) {
        if (value == null) return null;
        return PetsPreference.valueOf(value.toLowerCase());
    }
}