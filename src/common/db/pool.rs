use std::time::Duration;

use sqlx::{postgres::PgPoolOptions, PgPool};

pub async fn get_pool(dsn: &str, max_connection: u32, timeout: Duration) -> sqlx::Result<PgPool> {
    let db = PgPoolOptions::new()
        .max_connections(max_connection)
        .acquire_timeout(timeout)
        .connect(dsn)
        .await?;

    tracing::debug!("established connection with database");

    Ok(db)
}
