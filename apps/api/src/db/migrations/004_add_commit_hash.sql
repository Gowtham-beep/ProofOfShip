-- Add commit_hash column to scores if it doesn't already exist
ALTER TABLE scores ADD COLUMN IF NOT EXISTS commit_hash VARCHAR(255);

-- Add unique constraint on (repo_id, commit_hash) if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'scores_repo_id_commit_hash_key'
      AND conrelid = 'scores'::regclass
  ) THEN
    ALTER TABLE scores ADD CONSTRAINT scores_repo_id_commit_hash_key UNIQUE (repo_id, commit_hash);
  END IF;
END;
$$;
