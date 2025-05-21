CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- This ID comes from the JWT issued by the auth service
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    color VARCHAR(7) DEFAULT '#007AFF', -- Example: hex color code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);