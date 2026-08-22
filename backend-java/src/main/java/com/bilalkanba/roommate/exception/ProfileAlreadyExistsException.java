package com.bilalkanba.roommate.exception;

/**
 * Exception levee quand on essaie de creer un profil qui existe deja
 * pour un user_id donne (violation d'unicite metier).
 *
 * Sera transformee en HTTP 409 Conflict dans le GlobalExceptionHandler.
 */
public class ProfileAlreadyExistsException extends RuntimeException {

    public ProfileAlreadyExistsException(String message) {
        super(message);
    }
}