use std::sync::Arc;

use axum::{extract::State, response::IntoResponse, routing::post, Json, Router};
use reqwest::StatusCode;

use crate::{
    common::routing::app_state::AppState,
    schemas::auth::{AccessTokenSchema, LoginSchema, RefreshSchema, TokenSchema},
    services::auth::AuthService,
};

pub struct AuthRouter;

impl AuthRouter {
    pub fn get_router(state: Arc<AppState>) -> Router {
        Router::new()
            .route("/login", post(Self::login))
            .route("/refresh", post(Self::refresh))
            .with_state(state)
    }

    async fn login(
        State(state): State<Arc<AppState>>,
        Json(login_data): Json<LoginSchema>,
    ) -> impl IntoResponse {
        let (access_token, refresh_token, _expire_in) = AuthService::new(&state.db)
            .login(login_data, &state.config)
            .await?;

        let schema = TokenSchema::new(access_token, refresh_token);
        Ok::<_, (StatusCode, String)>((StatusCode::OK, Json(schema)))
    }

    async fn refresh(
        State(state): State<Arc<AppState>>,
        Json(refresh_data): Json<RefreshSchema>,
    ) -> impl IntoResponse {
        let (access_token, _expire_in) = AuthService::new(&state.db)
            .refresh(&refresh_data.refresh_token, &state.config)
            .await?;

        let schema = AccessTokenSchema::new(access_token);
        Ok::<_, (StatusCode, String)>((StatusCode::OK, Json(schema)))
    }
}
