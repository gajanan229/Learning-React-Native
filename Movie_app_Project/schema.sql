-- Movie App Project - PostgreSQL Schema
-- Version 1.0

-- Helper function for automatically updating 'updated_at' columns
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table: movies
-- Stores general movie details, acting as a cache from TMDB or other sources.
CREATE TABLE movies (
    tmdb_id INTEGER PRIMARY KEY,    -- The TMDB ID as the unique identifier
    title VARCHAR(255) NOT NULL,    -- Movie title
    poster_url VARCHAR(512),        -- URL for the poster image (nullable if poster might not exist)
    runtime_minutes INTEGER,          -- Movie runtime in minutes (nullable)
    genres TEXT[]                     -- Array of genre strings (e.g., {'Action', 'Sci-Fi'}) (nullable)
    -- Note: No created_at/updated_at here as this is more like a cache of external data.
    -- If these movies are "created" within your system, consider adding them.
);

-- Table: users
-- Stores user credentials and profile information.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE, -- Optional, for display names
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email); -- For fast login lookup

-- Apply updated_at trigger to users table
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Table: search_events
-- Logs movie search occurrences to identify trending movies.
CREATE TABLE search_events (
    id SERIAL PRIMARY KEY,
    movie_tmdb_id INTEGER NOT NULL REFERENCES movies(tmdb_id) ON DELETE CASCADE,
    searched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for search_events table
CREATE INDEX idx_search_events_movie_tmdb_id ON search_events(movie_tmdb_id);
CREATE INDEX idx_search_events_searched_at ON search_events(searched_at);

-- Table: user_watched_movies
-- Tracks movies watched by users, including their ratings, reviews, and watch dates.
CREATE TABLE user_watched_movies (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_tmdb_id INTEGER NOT NULL REFERENCES movies(tmdb_id) ON DELETE CASCADE,
    rating NUMERIC(2,1) CHECK (rating >= 0.5 AND rating <= 5.0 AND MOD(rating * 2, 1) = 0), -- Allows 0.5-5 with .5 increments
    watch_date DATE,
    review_notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), -- When this entry was first created
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), -- When this entry was last modified

    PRIMARY KEY (user_id, movie_tmdb_id) -- A user-movie pair is unique
);

-- Indexes for user_watched_movies table
CREATE INDEX idx_user_watched_movies_user_id ON user_watched_movies(user_id);
CREATE INDEX idx_user_watched_movies_movie_tmdb_id ON user_watched_movies(movie_tmdb_id);

-- Apply updated_at trigger to user_watched_movies table
CREATE TRIGGER set_timestamp_user_watched_movies
BEFORE UPDATE ON user_watched_movies
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Type: list_type_enum
-- Defines the allowed types for user lists.
CREATE TYPE list_type_enum AS ENUM ('watchlist', 'favorites', 'custom');

-- Table: user_lists
-- Stores the definition of each list a user creates or has by default.
CREATE TABLE user_lists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    list_name VARCHAR(100) NOT NULL,
    list_type list_type_enum NOT NULL,
    description TEXT, -- Optional description
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for user_lists table
CREATE INDEX idx_user_lists_user_id ON user_lists(user_id); -- For finding lists owned by a user
CREATE INDEX idx_user_lists_user_id_list_type ON user_lists(user_id, list_type); -- For specific system lists
CREATE UNIQUE INDEX unique_custom_list_name_per_user
ON user_lists (user_id, list_name)
WHERE (list_type = 'custom'); -- Ensures unique custom list names per user

-- Apply updated_at trigger to user_lists table
CREATE TRIGGER set_timestamp_user_lists
BEFORE UPDATE ON user_lists
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Table: user_list_items (Junction Table)
-- Stores which movies belong to which user list.
CREATE TABLE user_list_items (
    list_id INTEGER NOT NULL REFERENCES user_lists(id) ON DELETE CASCADE,
    movie_tmdb_id INTEGER NOT NULL REFERENCES movies(tmdb_id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    PRIMARY KEY (list_id, movie_tmdb_id) -- Ensures a movie is in a specific list only once
);

-- Indexes for user_list_items table
CREATE INDEX idx_user_list_items_list_id ON user_list_items(list_id); -- For finding movies in a list
CREATE INDEX idx_user_list_items_movie_tmdb_id ON user_list_items(movie_tmdb_id); -- For finding lists a movie belongs to

-- End of Schema
