CREATE TABLE folders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Foreign key to the existing users table
    name VARCHAR(255) NOT NULL,
    recurrence_days TEXT[] NOT NULL, -- Stores an array of strings like: {'monday', 'tuesday'}
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_folders_user_id ON folders(user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_folders_updated_at
BEFORE UPDATE ON folders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE alarms (
    id SERIAL PRIMARY KEY,
    folder_id INTEGER NOT NULL REFERENCES folders(id) ON DELETE CASCADE, -- Foreign key to folders table
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- Foreign key to users table
    time TIME WITHOUT TIME ZONE NOT NULL, -- Stores time like '07:30:00'
    label VARCHAR(255), 
    sound_id VARCHAR(255) NOT NULL, -- soundId is a string identifier for a sound
    vibration BOOLEAN NOT NULL DEFAULT TRUE,
    snooze BOOLEAN NOT NULL DEFAULT FALSE,
    snooze_duration INTEGER DEFAULT 5, -- In minutes
    is_temporary BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE, -- Individual toggle for the alarm
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alarms_folder_id ON alarms(folder_id);
CREATE INDEX idx_alarms_user_id ON alarms(user_id);

CREATE TRIGGER update_alarms_updated_at
BEFORE UPDATE ON alarms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();