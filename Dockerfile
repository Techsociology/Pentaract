# syntax=docker/dockerfile:1.7

############################################################################################
####  SERVER
############################################################################################

# Using the `rust-musl-builder` as base image, instead of 
# the official Rust toolchain
FROM clux/muslrust:stable AS chef
USER root
RUN --mount=type=cache,target=/root/.cargo/registry \
    cargo install cargo-chef
WORKDIR /app

FROM chef AS planner
WORKDIR /app
COPY /Cargo.toml .
COPY /Cargo.lock .
COPY ./src ./src

RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder 
COPY --from=planner /app/recipe.json recipe.json
# Build dependencies - this is the caching Docker layer!
# Cache mounts persist the cargo registry and the incremental build
# artifacts across builds (not just across Docker layers), so a change
# to src/ doesn't force every dependency to recompile from scratch.
RUN --mount=type=cache,target=/root/.cargo/registry \
    --mount=type=cache,target=/app/target \
    cargo chef cook --release --target x86_64-unknown-linux-musl --recipe-path recipe.json
# Build application
COPY ./ .
RUN --mount=type=cache,target=/root/.cargo/registry \
    --mount=type=cache,target=/app/target \
    cargo build --target x86_64-unknown-linux-musl --release && \
    cp /app/target/x86_64-unknown-linux-musl/release/pentaract /app/pentaract

############################################################################################
####  UI
############################################################################################

FROM node:22-slim AS ui
WORKDIR /app
RUN npm install -g pnpm@9
# Copy only lockfile/manifest first so `pnpm i` is cached separately from
# source changes -- editing a .jsx file shouldn't force a full reinstall.
COPY ./ui/package.json ./ui/pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm i --frozen-lockfile
COPY ./ui .
ENV VITE_API_BASE /api
RUN pnpm build

############################################################################################
####  RUNNING
############################################################################################

# We do not need the Rust toolchain to run the binary!
FROM scratch AS runtime
COPY --from=builder /app/pentaract /
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=ui /app/dist /ui
ENTRYPOINT ["/pentaract"]