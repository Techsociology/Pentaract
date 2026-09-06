use axum::http::StatusCode;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum PentaractError {
    #[error("environment variable `{0}` is not set")]
    EnvConfigLoadingError(String),
    #[error("environment variable `{0}` cannot be parsed")]
    EnvVarParsingError(String),

    #[error("user was removed")]
    UserWasRemoved,

    #[error("{0} already exists")]
    AlreadyExists(String),
    #[error("{0} does not exist")]
    DoesNotExist(String),
    #[error("User already has a storage with such name")]
    StorageNameConflict,
    #[error("User already has a storage with such chat id")]
    StorageChatIdConflict,
    #[error("User already has a storage worker with such name")]
    StorageWorkerNameConflict,
    #[error("Token must be unique")]
    StorageWorkerTokenConflict,
    #[error("not authenticated")]
    NotAuthenticated,
    #[error("[Telegram API] status {status}: {message}")]
    TelegramAPIError {
        status: u16,
        message: String,
        retry_after: Option<u64>,
    },
    #[error("You need to add at least 1 storage worker")]
    NoStorageWorkers,
    #[error("Invalid path")]
    InvalidPath,
    #[error("Invalid folder name")]
    InvalidFolderName,
    #[error("You cannot manage access of yourself")]
    CannotManageAccessOfYourself,
    #[error("Storage does not have workers")]
    StorageDoesNotHaveWorkers,
    #[error("unknown error")]
    Unknown,
    #[error("[Telegram API] failed to parse response: {0}")]
    TelegramResponseDecodeError(String),
    #[error("{0} header is required")]
    HeaderMissed(String),
    #[error("{0} header should be a valid {1}")]
    HeaderIsInvalid(String, String),
}

impl From<PentaractError> for (StatusCode, String) {
    fn from(e: PentaractError) -> Self {
        match &e {
            PentaractError::AlreadyExists(_)
            | PentaractError::StorageNameConflict
            | PentaractError::StorageChatIdConflict
            | PentaractError::StorageWorkerNameConflict
            | PentaractError::StorageWorkerTokenConflict
            | PentaractError::StorageDoesNotHaveWorkers
            | PentaractError::CannotManageAccessOfYourself => (StatusCode::CONFLICT, e.to_string()),
            PentaractError::NotAuthenticated => (StatusCode::UNAUTHORIZED, e.to_string()),
            PentaractError::DoesNotExist(_) => (StatusCode::NOT_FOUND, e.to_string()),
            PentaractError::HeaderMissed(_)
            | PentaractError::HeaderIsInvalid(..)
            | PentaractError::InvalidFolderName => (StatusCode::BAD_REQUEST, e.to_string()),
            _ => {
                tracing::error!("{e}");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Something went wrong".to_owned(),
                )
            }
        }
    }
}

impl From<reqwest::Error> for PentaractError {
    fn from(e: reqwest::Error) -> Self {
        match e.status() {
            Some(status) if status.is_client_error() => PentaractError::TelegramAPIError {
                status: status.as_u16(),
                message: e.to_string(),
                // reqwest::Error doesn't expose response headers, so a
                // Retry-After sent alongside a transport-level error (rare)
                // isn't visible here -- only the explicit status-check path
                // in bot_api.rs (which has the full Response) reads it.
                retry_after: None,
            },
            // Malformed/unexpected response body: retrying the same request
            // won't produce a different body, so this is not transient.
            _ if e.is_decode() || e.is_body() => {
                tracing::error!("{e}");
                PentaractError::TelegramResponseDecodeError(e.to_string())
            }
            Some(_) | None => {
                tracing::error!("{e}");
                PentaractError::Unknown
            }
        }
    }
}

pub type PentaractResult<T> = Result<T, PentaractError>;
