use std::time::Duration;

use sqlx::PgPool;

use crate::{
    common::{
        jwt_manager::{AuthUser, JWTManager},
        password_manager::PasswordManager,
    },
    config::Config,
    errors::{PentaractError, PentaractResult},
    repositories::users::UsersRepository,
    schemas::auth::LoginSchema,
};

pub struct AuthService<'d> {
    repo: UsersRepository<'d>,
}

impl<'d> AuthService<'d> {
    pub fn new(db: &'d PgPool) -> Self {
        let repo = UsersRepository::new(db);
        Self { repo }
    }

    pub async fn login(
        &self,
        login_data: LoginSchema,
        config: &Config,
    ) -> PentaractResult<(String, String, Duration)> {
        // trying to find a user with a given email
        let user = self
            .repo
            .get_by_email(&login_data.email)
            .await
            .map_err(|_| PentaractError::NotAuthenticated)?;

        // verifying password
        PasswordManager::verify(&login_data.password, &user.password_hash)?;

        // generating access token
        let user = AuthUser::new(user.id, login_data.email);
        let expire_in = Duration::from_secs(config.access_token_expire_in_secs.into());
        let access_token = JWTManager::generate(user.clone(), expire_in, &config.secret_key)?;

        // generating refresh token
        let refresh_expire_in =
            Duration::from_secs(u64::from(config.refresh_token_expire_in_days) * 24 * 60 * 60);
        let refresh_token =
            JWTManager::generate_refresh(user, refresh_expire_in, &config.secret_key)?;

        Ok((access_token, refresh_token, expire_in))
    }

    /// Exchanges a valid refresh token for a fresh access token
    pub async fn refresh(
        &self,
        refresh_token: &str,
        config: &Config,
    ) -> PentaractResult<(String, Duration)> {
        let user = JWTManager::validate_refresh(refresh_token, &config.secret_key)?;

        // making sure the user still exists
        let db_user = self
            .repo
            .get_by_email(&user.email)
            .await
            .map_err(|_| PentaractError::NotAuthenticated)?;

        let user = AuthUser::new(db_user.id, user.email);
        let expire_in = Duration::from_secs(config.access_token_expire_in_secs.into());
        let access_token = JWTManager::generate(user, expire_in, &config.secret_key)?;

        Ok((access_token, expire_in))
    }
}
