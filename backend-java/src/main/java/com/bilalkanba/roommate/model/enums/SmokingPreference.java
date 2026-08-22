package com.bilalkanba.roommate.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum SmokingPreference {
    no_smoking,
    ok_outside,
    indoor_ok;

    @JsonValue
    public String toValue() {
        return this.name();
    }

    @JsonCreator
    public static SmokingPreference fromValue(String value) {
        if (value == null) return null;
        return SmokingPreference.valueOf(value.toLowerCase());
    }
}