use std::{
    str::FromStr,
    time::{Duration, SystemTime, UNIX_EPOCH},
};

use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::errors::{PentaractError, PentaractResult};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TokenType {
    #[serde(rename = "access")]
    Access,
    #[serde(rename = "refresh")]
    Refresh,
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    pub(self) sub: String,
    pub(self) email: String,
    pub(self) exp: usize,
    #[serde(default = "default_token_type")]
    pub(self) typ: TokenType,
}

fn default_token_type() -> TokenType {
    // tokens issued before this field existed are all access tokens
    TokenType::Access
}

#[derive(Clone)]
pub struct AuthUser {
    pub id: Uuid,
    pub email: String,
}

impl AuthUser {
    pub fn new(id: Uuid, email: String) -> Self {
        Self { id, email }
    }
}

pub struct JWTManager;

impl JWTManager {
    fn generate_typed(
        user: &AuthUser,
        expire_in: Duration,
        secret_key: &str,
        typ: TokenType,
    ) -> PentaractResult<String> {
        let expire_date = SystemTime::now() + expire_in;
        let expire_timestamp = expire_date
            .duration_since(UNIX_EPOCH)
            .map_err(|err| {
                tracing::error!("[JWT] failed to compute expiration timestamp: {err}");
                PentaractError::Unknown
            })?
            .as_secs() as usize;
        let claims = Claims {
            sub: user.id.into(),
            email: user.email.clone(),
            exp: expire_timestamp,
            typ,
        };
        let key = EncodingKey::from_secret(secret_key.as_bytes());

        encode(&Header::default(), &claims, &key).map_err(|err| {
            tracing::error!("[JWT] failed to encode token: {err}");
            PentaractError::Unknown
        })
    }

    /// Generates a short-lived access token
    pub fn generate(
        user: AuthUser,
        expire_in: Duration,
        secret_key: &str,
    ) -> PentaractResult<String> {
        Self::generate_typed(&user, expire_in, secret_key, TokenType::Access)
    }

    /// Generates a long-lived refresh token, used only to mint new access tokens
    pub fn generate_refresh(
        user: AuthUser,
        expire_in: Duration,
        secret_key: &str,
    ) -> PentaractResult<String> {
        Self::generate_typed(&user, expire_in, secret_key, TokenType::Refresh)
    }

    fn validate_typed(
        token: &str,
        secret_key: &str,
        expected: TokenType,
    ) -> PentaractResult<AuthUser> {
        let validation = Validation::new(Algorithm::HS256);
        let decoding_key = DecodingKey::from_secret(secret_key.as_bytes());

        decode::<Claims>(token, &decoding_key, &validation)
            .map_err(|_| PentaractError::NotAuthenticated)
            .and_then(|token_data| {
                if token_data.claims.typ != expected {
                    return Err(PentaractError::NotAuthenticated);
                }
                let id = Uuid::from_str(&token_data.claims.sub)
                    .map_err(|_| PentaractError::NotAuthenticated)?;
                Ok(AuthUser::new(id, token_data.claims.email))
            })
    }

    /// Validates an access token
    pub fn validate(token: &str, secret_key: &str) -> PentaractResult<AuthUser> {
        Self::validate_typed(token, secret_key, TokenType::Access)
    }

    /// Validates a refresh token (rejects access tokens even if otherwise well-formed)
    pub fn validate_refresh(token: &str, secret_key: &str) -> PentaractResult<AuthUser> {
        Self::validate_typed(token, secret_key, TokenType::Refresh)
    }
}
