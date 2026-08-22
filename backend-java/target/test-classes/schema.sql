-- Schema init pour les tests d'integration
-- Cree les 12 types ENUM Postgres avant que Hibernate cree les tables

-- Suppression si existe deja (idempotent pour re-runs)
DROP TYPE IF EXISTS gender CASCADE;
DROP TYPE IF EXISTS lifestyle_level CASCADE;
DROP TYPE IF EXISTS sleep_schedule CASCADE;
DROP TYPE IF EXISTS social_level CASCADE;
DROP TYPE IF EXISTS smoking_preference CASCADE;
DROP TYPE IF EXISTS pets_preference CASCADE;
DROP TYPE IF EXISTS preferred_gender CASCADE;
DROP TYPE IF EXISTS housing_type CASCADE;
DROP TYPE IF EXISTS max_roommates CASCADE;
DROP TYPE IF EXISTS diet CASCADE;
DROP TYPE IF EXISTS work_type CASCADE;
DROP TYPE IF EXISTS home_presence CASCADE;

-- Creation des types
CREATE TYPE gender AS ENUM ('male', 'female', 'non_binary', 'prefer_not_to_say');
CREATE TYPE lifestyle_level AS ENUM ('very_low', 'low', 'medium', 'high', 'very_high');
CREATE TYPE sleep_schedule AS ENUM ('early_bird', 'normal', 'night_owl', 'irregular');
CREATE TYPE social_level AS ENUM ('very_private', 'balanced', 'very_social');
CREATE TYPE smoking_preference AS ENUM ('no_smoking', 'ok_outside', 'indoor_ok');
CREATE TYPE pets_preference AS ENUM ('no_pets', 'has_pet', 'ok_with_pets');
CREATE TYPE preferred_gender AS ENUM ('male', 'female', 'any');
CREATE TYPE housing_type AS ENUM ('entire_apartment', 'private_room', 'shared_room', 'studio', 'any');
CREATE TYPE max_roommates AS ENUM ('solo', 'one', 'two', 'three_plus', 'any');
CREATE TYPE diet AS ENUM ('omnivore', 'vegetarian', 'vegan', 'halal', 'kosher', 'other');
CREATE TYPE work_type AS ENUM ('student', 'freelancer', 'full_time_onsite', 'full_time_remote', 'part_time', 'unemployed', 'other');
CREATE TYPE home_presence AS ENUM ('mostly_home', 'evenings_only', 'weekends_only', 'rarely_home');