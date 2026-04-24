import { FastifyInstance } from 'fastify';
import { query } from '../db/client.js';
import { analysisQueue } from '../queue/analysisQueue.js';
import { getPublicRepo, getPublicRepoLanguages, parsePublicGitHubUrl, getRepoCommitCount } from '@proofofship/github';

export default async function guestRoutes(fastify: FastifyInstance) {
  fastify.post('/analyze/guest', async (request, reply) => {
    const { url } = request.body as { url: string };
    
    let owner: string, repoName: string;
    try {
      const parsed = parsePublicGitHubUrl(url);
      owner = parsed.owner;
      repoName = parsed.repo;
    } catch (e: any) {
      return reply.code(400).send({ error: e.message });
    }

    try {
      // Fetch GitHub data
      const token = process.env.GITHUB_PAT || '';
      const repoData = await getPublicRepo(owner, repoName, token);
      const languages = await getPublicRepoLanguages(owner, repoName, token);
      const commitCount = await getRepoCommitCount(owner, repoName, token);

      // Ensure 'guest_user' exists in the database
      let userRes = await query(`SELECT id FROM users WHERE github_username = 'guest_user'`);
      if (userRes.rows.length === 0) {
        userRes = await query(
          `INSERT INTO users (github_id, github_username, github_access_token) VALUES ($1, $2, $3) RETURNING id`,
          [0, 'guest_user', '']
        );
      }
      const userId = userRes.rows[0].id;

      // Upsert the Repo Record
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
        RETURNING id;
      `;

      const params = [
        userId,
        repoData.id,
        repoData.name,
        repoData.full_name,
        repoData.description,
        repoData.language,
        JSON.stringify(languages),
        repoData.private,
        repoData.fork,
        repoData.stargazers_count,
        repoData.forks_count,
        repoData.open_issues_count,
        repoData.size,
        repoData.default_branch,
        repoData.topics || [],
        repoData.has_issues,
        repoData.has_wiki,
        repoData.pushed_at ? new Date(repoData.pushed_at).toISOString() : null,
        new Date(repoData.created_at).toISOString(),
        new Date(repoData.updated_at).toISOString()
      ];

      const { rows } = await query(upsertSql, params);
      const repoId = rows[0].id;

      // Queue the analysis job to BullMQ
      await analysisQueue.add('analyze_guest_repo', {
        userId,
        repoIds: [repoId],
      });

      // Provide the frontend with exactly what it needs to poll for the result
      return reply.send({ success: true, username: 'guest_user', reponame: repoName });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message || 'Failed to process guest analysis' });
    }
  });
}
