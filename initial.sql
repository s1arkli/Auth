CREATE DATABASE post;
CREATE DATABASE "user";

-- ======== auth ========
CREATE TABLE IF NOT EXISTS account (
    id       BIGSERIAL    PRIMARY KEY,
    uid      BIGINT       NOT NULL UNIQUE,
    account  VARCHAR(64)  NOT NULL UNIQUE,
    password VARCHAR(128) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_uid ON account(uid);
COMMENT ON COLUMN account.uid      IS '用户唯一标识';
COMMENT ON COLUMN account.account  IS '账号';
COMMENT ON COLUMN account.password IS '密码';

-- ======== post ========
\c post
CREATE TABLE IF NOT EXISTS post (
    id            BIGSERIAL    PRIMARY KEY,
    uid           BIGINT       NOT NULL,
    title         VARCHAR(200) NOT NULL,
    content       TEXT         NOT NULL,
    is_topped     BOOLEAN      NOT NULL DEFAULT false,
    is_draft      BOOLEAN      NOT NULL DEFAULT false,
    post_type     SMALLINT     NOT NULL DEFAULT 1, -- 1=技术，2=生活，3=分享
    like_count    INTEGER      NOT NULL DEFAULT 0,
    comment_count INTEGER      NOT NULL DEFAULT 0,
    collect_count INTEGER      NOT NULL DEFAULT 0,
    view_count    INTEGER      NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_uid        ON post(uid);
CREATE INDEX IF NOT EXISTS idx_created_at ON post(created_at DESC) WHERE deleted_at IS NULL;

-- ======== user ========
\c user
CREATE TABLE IF NOT EXISTS "user" (
    uid        BIGINT      NOT NULL,
    nickname   VARCHAR(64) NOT NULL,
    avatar     TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_uid ON "user"(uid);
