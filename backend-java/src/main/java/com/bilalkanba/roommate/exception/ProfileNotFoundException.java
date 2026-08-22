package com.bilalkanba.roommate.exception;

/**
 * Exception levee quand un profil n'existe pas dans la DB.
 *
 * On etend RuntimeException (unchecked) pour ne pas polluer les signatures
 * des methodes avec throws. Spring/JVM gerent proprement.
 *
 * Sera transformee en HTTP 404 Not Found via @ExceptionHandler
 * dans le GlobalExceptionHandler (Etape 7).
 */
public class ProfileNotFoundException extends RuntimeException {

    public ProfileNotFoundException(String message) {
        super(message);
    }

    public ProfileNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}