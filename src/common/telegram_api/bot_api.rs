use std::time::Duration;

use reqwest::multipart;
use uuid::Uuid;

use crate::{
    common::types::ChatId,
    errors::{PentaractError, PentaractResult},
    services::storage_workers_scheduler::StorageWorkersScheduler,
};

use super::schemas::{DownloadBodySchema, UploadBodySchema, UploadSchema};

pub struct TelegramBotApi<'t> {
    base_url: &'t str,
    scheduler: StorageWorkersScheduler<'t>,
    max_retries: u8,
}

impl<'t> TelegramBotApi<'t> {
    pub fn new(base_url: &'t str, scheduler: StorageWorkersScheduler<'t>, max_retries: u8) -> Self {
        Self {
            base_url,
            scheduler,
            max_retries,
        }
    }

    /// Runs `f` up to `self.max_retries + 1` times, retrying on transport-level
    /// errors, 5xx responses, and 429 (rate limit) with backoff. Other 4xx-style
    /// API errors (bad chat id, bad token, etc.) are not retried since retrying
    /// won't fix them.
    async fn with_retries<T, F, Fut>(&self, mut f: F) -> PentaractResult<T>
    where
        F: FnMut() -> Fut,
        Fut: std::future::Future<Output = PentaractResult<T>>,
    {
        let mut attempt = 0u8;
        loop {
            match f().await {
                Ok(v) => return Ok(v),
                Err(e) if attempt < self.max_retries && Self::is_retryable(&e) => {
                    attempt += 1;
                    // Honor Telegram's Retry-After header exactly when it's
                    // present (429 responses always carry one); otherwise
                    // fall back to exponential backoff, with a longer base
                    // for rate limiting than for transient 5xx/network errors.
                    let backoff_ms = if let Some(retry_after) = Self::retry_after_ms(&e) {
                        retry_after
                    } else {
                        let base_ms = if Self::is_rate_limited(&e) {
                            1000u64
                        } else {
                            200u64
                        };
                        (base_ms * (1 << (attempt - 1))).min(30_000)
                    };
                    tracing::warn!(
                        "[TELEGRAM API] attempt {attempt}/{} failed, retrying in {backoff_ms}ms: {e}",
                        self.max_retries
                    );
                    tokio::time::sleep(Duration::from_millis(backoff_ms)).await;
                }
                Err(e) => return Err(e),
            }
        }
    }

    fn is_retryable(e: &PentaractError) -> bool {
        // Telegram 5xx / network hiccups / rate limiting are worth retrying;
        // other explicit 4xx-style API errors (bad chat id, bad token, etc.)
        // and malformed-response decode errors are not -- retrying gets the
        // same result.
        match e {
            PentaractError::TelegramAPIError { status, .. } => {
                (500..600).contains(status) || *status == 429
            }
            PentaractError::Unknown => true,
            _ => false,
        }
    }

    fn is_rate_limited(e: &PentaractError) -> bool {
        matches!(e, PentaractError::TelegramAPIError { status, .. } if *status == 429)
    }

    /// Milliseconds to wait, per Telegram's own Retry-After header, if the
    /// error carries one.
    fn retry_after_ms(e: &PentaractError) -> Option<u64> {
        match e {
            PentaractError::TelegramAPIError {
                retry_after: Some(secs),
                ..
            } => Some(secs.saturating_mul(1000)),
            _ => None,
        }
    }

    pub async fn upload(
        &self,
        file: &[u8],
        chat_id: ChatId,
        storage_id: Uuid,
    ) -> PentaractResult<UploadSchema> {
        tracing::debug!(
            "[TELEGRAM API] Uploading chunk: chat_id={}, file_size={}",
            chat_id,
            file.len()
        );

        if chat_id < 0 && chat_id > -10000000000 {
            tracing::info!(
                "[TELEGRAM API] Using regular group (chat_id={}). If bot can't find the chat, \
                make sure the bot is added and has permissions.",
                chat_id
            );
        }

        // Build the owned buffer once outside the retry loop; each attempt just
        // clones this Vec instead of re-deriving it from `file` on every retry.
        // (A true zero-copy version would need reqwest's "stream" feature to hand
        // multipart::Part a ref-counted `bytes::Bytes` instead of an owned Vec --
        // not enabled here, so this only avoids the redundant re-conversion, not
        // the unavoidable per-attempt copy multipart::Form requires.)
        let file_buf = file.to_vec();

        self.with_retries(|| async {
            let token = self.scheduler.get_token(storage_id).await?;
            let url = self.build_url("", "sendDocument", token);

            let file_part =
                multipart::Part::bytes(file_buf.clone()).file_name("pentaract_chunk.bin");
            let form = multipart::Form::new()
                .text("chat_id", chat_id.to_string())
                .part("document", file_part);

            let response = reqwest::Client::new()
                .post(url)
                .multipart(form)
                .send()
                .await?;

            let status = response.status();
            if !status.is_success() {
                let retry_after = response
                    .headers()
                    .get(reqwest::header::RETRY_AFTER)
                    .and_then(|v| v.to_str().ok())
                    .and_then(|v| v.parse::<u64>().ok());
                let error_text = response
                    .text()
                    .await
                    .unwrap_or_else(|_| "Unable to read error body".to_string());
                tracing::error!(
                    "[TELEGRAM API] Upload failed: status={}, response={}",
                    status,
                    error_text
                );
                return Err(PentaractError::TelegramAPIError {
                    status: status.as_u16(),
                    message: error_text,
                    retry_after,
                });
            }

            match response.json::<UploadBodySchema>().await {
                Ok(body) => Ok(body.result.document),
                // The From<reqwest::Error> impl already logs decode failures.
                Err(e) => Err(e.into()),
            }
        })
        .await
    }

    pub async fn download(
        &self,
        telegram_file_id: &str,
        storage_id: Uuid,
    ) -> PentaractResult<Vec<u8>> {
        self.with_retries(|| async {
            // getting file path
            let token = self.scheduler.get_token(storage_id).await?;
            let url = self.build_url("", "getFile", token);
            let body: DownloadBodySchema = reqwest::Client::new()
                .get(url)
                .query(&[("file_id", telegram_file_id)])
                .send()
                .await?
                .json()
                .await?;

            // downloading the file itself
            let token = self.scheduler.get_token(storage_id).await?;
            let url = self.build_url("file/", &body.result.file_path, token);
            let file = reqwest::get(url)
                .await?
                .bytes()
                .await
                .map(|file| file.to_vec())?;

            Ok(file)
        })
        .await
    }

    /// Taking token by a value to force dropping it so it can be used only once
    #[inline]
    fn build_url(&self, pre: &str, relative: &str, token: String) -> String {
        format!("{}/{pre}bot{token}/{relative}", self.base_url)
    }
}
