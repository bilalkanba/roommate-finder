package com.bilalkanba.roommate.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum SleepSchedule {
    early_bird,
    normal,
    night_owl,
    irregular;

    @JsonValue
    public String toValue() {
        return this.name();
    }

    @JsonCreator
    public static SleepSchedule fromValue(String value) {
        if (value == null) return null;
        return SleepSchedule.valueOf(value.toLowerCase());
    }
}