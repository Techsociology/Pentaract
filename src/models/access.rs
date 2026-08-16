use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(type_name = "access_type", rename_all = "lowercase")]
pub enum AccessType {
    R,
    W,
    A,
}

// FromRow-mapped model; not constructed directly in code yet but kept for
// future queries that select full access rows.
#[allow(dead_code)]
#[derive(Debug, sqlx::FromRow)]
pub struct Access {
    pub id: Uuid,
    pub user_id: Uuid,
    pub storage_id: Uuid,
    pub access_type: AccessType,
}

#[derive(Debug, sqlx::FromRow, Serialize)]
pub struct UserWithAccess {
    pub id: Uuid,
    pub email: String,
    pub access_type: AccessType,
}
