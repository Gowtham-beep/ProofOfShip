CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  commit_hash VARCHAR(255),
  score INTEGER NOT NULL,
  comprehension_health INTEGER NOT NULL,
  hallucination_debt INTEGER NOT NULL,
  architectural_consistency INTEGER NOT NULL,
  debt_trajectory INTEGER NOT NULL,
  complexity_adjustment INTEGER NOT NULL,
  complexity_tier VARCHAR(20) NOT NULL,
  breakdown JSONB NOT NULL DEFAULT '{}',
  percentile INTEGER,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(repo_id, commit_hash)
);

CREATE INDEX IF NOT EXISTS idx_scores_repo_id ON scores(repo_id);
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);
