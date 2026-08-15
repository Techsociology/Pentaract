use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct LoginSchema {
    pub email: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct TokenSchema {
    access_token: String,
    refresh_token: String,
}

impl TokenSchema {
    pub fn new(access_token: String, refresh_token: String) -> Self {
        Self {
            access_token,
            refresh_token,
        }
    }
}

#[derive(Serialize)]
pub struct AccessTokenSchema {
    access_token: String,
}

impl AccessTokenSchema {
    pub fn new(access_token: String) -> Self {
        Self { access_token }
    }
}

#[derive(Deserialize)]
pub struct RefreshSchema {
    pub refresh_token: String,
}
