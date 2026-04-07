import { query } from '../db/client.js';
import { getUserRepos, getRepoLanguages } from '@proofofship/github';

export async function ingestUserRepos(
  userId: string,
  accessToken: string
): Promise<{ ingested: number; updated: number }> {
  let ingested = 0;
  let updated = 0;

  console.log(`Ingesting repos for user ${userId}`);
  const repos = await getUserRepos(accessToken);
  console.log(`Found ${repos.length} repos to process.`);

  for (const repo of repos) {
    let languages = {};
    try {
      languages = await getRepoLanguages(accessToken, repo.full_name);
    } catch (e: any) {
      console.error(`Failed to fetch languages for ${repo.full_name}:`, e.message);
    }
    
    // 100ms delay to respect github limits
    await new Promise(resolve => setTimeout(resolve, 100));

    const upsertSql = `
      INSERT INTO repos (
        user_id, github_repo_id, name, full_name, description, language,
        languages, is_private, is_fork, stargazers_count, forks_count,
        open_issues_count, size_kb, default_branch, topics, has_issues,
        has_wiki, pushed_at, github_created_at, github_updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      )
      ON CONFLICT (user_id, github_repo_id) DO UPDATE SET
        name = EXCLUDED.name,
        full_name = EXCLUDED.full_name,
        description = EXCLUDED.description,
        language = EXCLUDED.language,
        languages = EXCLUDED.languages,
        is_private = EXCLUDED.is_private,
        is_fork = EXCLUDED.is_fork,
        stargazers_count = EXCLUDED.stargazers_count,
        forks_count = EXCLUDED.forks_count,
        open_issues_count = EXCLUDED.open_issues_count,
        size_kb = EXCLUDED.size_kb,
        default_branch = EXCLUDED.default_branch,
        topics = EXCLUDED.topics,
        has_issues = EXCLUDED.has_issues,
        has_wiki = EXCLUDED.has_wiki,
        pushed_at = EXCLUDED.pushed_at,
        github_created_at = EXCLUDED.github_created_at,
        github_updated_at = EXCLUDED.github_updated_at,
        updated_at = NOW()
      RETURNING (xmax = 0) AS is_insert;
    `;

    const params = [
      userId,
      repo.id,
      repo.name,
      repo.full_name,
      repo.description,
      repo.language,
      JSON.stringify(languages),
      repo.private,
      repo.fork,
      repo.stargazers_count,
      repo.forks_count,
      repo.open_issues_count,
      repo.size,
      repo.default_branch,
      repo.topics || [],
      repo.has_issues,
      repo.has_wiki,
      repo.pushed_at ? new Date(repo.pushed_at).toISOString() : null,
      new Date(repo.created_at).toISOString(),
      new Date(repo.updated_at).toISOString()
    ];

    const { rows } = await query(upsertSql, params);
    
    if (rows[0] && rows[0].is_insert) {
      ingested++;
    } else {
      updated++;
    }
  }

  return { ingested, updated };
}
