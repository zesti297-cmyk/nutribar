CREATE TYPE user_role AS ENUM ('patient', 'translator', 'nutritionist', 'admin');
CREATE TYPE user_status AS ENUM ('pending', 'approved');

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  auth_uid UUID UNIQUE,
  role user_role NOT NULL,
  status user_status NOT NULL DEFAULT 'pending',
  full_name TEXT,
  languages TEXT,
  bio TEXT,
  photo_url TEXT,
  location TEXT,
  nutritionist_plan TEXT,
  commission_rate NUMERIC DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX users_role_idx ON users(role);
CREATE INDEX users_referred_by_idx ON users(referred_by);
CREATE INDEX users_referral_code_idx ON users(referral_code);
CREATE INDEX users_status_idx ON users(status);

CREATE TABLE leads (
  id UUID PRIMARY KEY,
  nutritionist_id UUID REFERENCES users(id),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
