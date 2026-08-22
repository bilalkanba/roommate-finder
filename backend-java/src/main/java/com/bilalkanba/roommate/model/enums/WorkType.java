package com.bilalkanba.roommate.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum WorkType {
    student,
    freelancer,
    full_time_onsite,
    full_time_remote,
    part_time,
    unemployed,
    other;

    @JsonValue
    public String toValue() {
        return this.name();
    }

    @JsonCreator
    public static WorkType fromValue(String value) {
        if (value == null) return null;
        return WorkType.valueOf(value.toLowerCase());
    }
}