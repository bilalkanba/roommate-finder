package com.bilalkanba.roommate.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum HomePresence {
    mostly_home,
    evenings_only,
    weekends_only,
    rarely_home;

    @JsonValue
    public String toValue() {
        return this.name();
    }

    @JsonCreator
    public static HomePresence fromValue(String value) {
        if (value == null) return null;
        return HomePresence.valueOf(value.toLowerCase());
    }
}