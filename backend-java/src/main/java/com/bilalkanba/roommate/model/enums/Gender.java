package com.bilalkanba.roommate.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Gender - constantes en lowercase pour matcher les valeurs Postgres.
 *
 * IMPORTANT :
 * Les noms des constantes DOIVENT correspondre EXACTEMENT aux valeurs
 * stockees en Postgres (case-sensitive). Postgres a ete cree avec
 * lowercase ('male', 'female', ...) donc nos enums Java sont aussi
 * en lowercase.
 *
 * Convention Java classique = MAJUSCULES, mais quand on mappe des enums
 * Postgres existants, il faut adapter.
 *
 * @JsonValue et @JsonCreator gerent la (de)serialisation JSON pour
 * le frontend qui envoie/recoit les valeurs en lowercase.
 */
public enum Gender {
    male,
    female,
    non_binary,
    prefer_not_to_say;

    @JsonValue
    public String toValue() {
        return this.name();
    }

    @JsonCreator
    public static Gender fromValue(String value) {
        if (value == null) return null;
        return Gender.valueOf(value.toLowerCase());
    }
}