CREATE TABLE IF NOT EXISTS repos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  github_repo_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  description TEXT,
  language VARCHAR(100),
  languages JSONB DEFAULT '{}',
  is_private BOOLEAN NOT NULL DEFAULT false,
  is_fork BOOLEAN NOT NULL DEFAULT false,
  stargazers_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  open_issues_count INTEGER DEFAULT 0,
  size_kb INTEGER DEFAULT 0,
  default_branch VARCHAR(100) DEFAULT 'main',
  topics TEXT[] DEFAULT '{}',
  has_issues BOOLEAN DEFAULT true,
  has_wiki BOOLEAN DEFAULT false,
  pushed_at TIMESTAMPTZ,
  github_created_at TIMESTAMPTZ,
  github_updated_at TIMESTAMPTZ,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, github_repo_id)
);

CREATE INDEX IF NOT EXISTS idx_repos_user_id ON repos(user_id);
CREATE INDEX IF NOT EXISTS idx_repos_full_name ON repos(full_name);
CREATE INDEX IF NOT EXISTS idx_repos_language ON repos(language);
