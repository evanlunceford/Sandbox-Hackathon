CREATE TABLE Organization (
    organization_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    state VARCHAR(100),
    country VARCHAR(100)
);

CREATE TABLE Interest (
    interest_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Club (
    club_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    state VARCHAR(100),
    country VARCHAR(100)
);

-- Junction table for Organization and Interest
CREATE TABLE Organization_Interest (
    organization_id UUID,
    interest_id UUID,
    PRIMARY KEY (organization_id, interest_id),
    FOREIGN KEY (organization_id) REFERENCES Organization(organization_id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES Interest(interest_id) ON DELETE CASCADE
);

-- Junction table for Club and Interest
CREATE TABLE Club_Interest (
    club_id UUID,
    interest_id UUID,
    PRIMARY KEY (club_id, interest_id),
    FOREIGN KEY (club_id) REFERENCES Club(club_id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES Interest(interest_id) ON DELETE CASCADE
);