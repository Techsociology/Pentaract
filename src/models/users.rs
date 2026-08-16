pub struct InDBUser {
    pub email: String,
    pub password_hash: String,
}

impl InDBUser {
    pub fn new(email: String, password_hash: String) -> Self {
        Self {
            email,
            password_hash,
        }
    }
}

// FromRow-mapped struct; `email` is currently only surfaced via Debug/logging
#[allow(dead_code)]
#[derive(Debug, sqlx::FromRow)]
pub struct User {
    pub id: uuid::Uuid,
    pub email: String,
    pub password_hash: String,
}

impl User {
    pub fn new(id: uuid::Uuid, email: String, password_hash: String) -> Self {
        Self {
            id,
            email,
            password_hash,
        }
    }
}
