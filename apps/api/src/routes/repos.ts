import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { query } from '../db/client.js';
import { ingestUserRepos } from '../services/ingestion.js';

export default async function reposRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) return reply.code(401).send({ error: 'Token missing' });

    try {
      const jwtSecret = process.env.JWT_SECRET!;
      const payload = jwt.verify(token, jwtSecret) as any;
      (request as any).user = payload;
    } catch (error) {
      return reply.code(401).send({ error: 'Invalid token' });
    }
  });

  fastify.post('/repos/ingest', async (request, reply) => {
    const userId = (request as any).user.id;

    try {
      const { rows } = await query('SELECT github_access_token FROM users WHERE id = $1', [userId]);
      if (rows.length === 0) {
        return reply.code(404).send({ error: 'User not found in DB' });
      }

      const accessToken = rows[0].github_access_token;
      const result = await ingestUserRepos(userId, accessToken);

      return { message: "Ingestion complete", ingested: result.ingested, updated: result.updated };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Ingestion failed', details: error.message });
    }
  });

  fastify.get('/repos', async (request, reply) => {
    const userId = (request as any).user.id;
    try {
      const sql = 'SELECT * FROM repos WHERE user_id = $1 ORDER BY pushed_at DESC';
      const { rows } = await query(sql, [userId]);

      const formatted = rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        githubRepoId: Number(r.github_repo_id),
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        language: r.language,
        languages: r.languages,
        isPrivate: r.is_private,
        isFork: r.is_fork,
        stargazersCount: r.stargazers_count,
        forksCount: r.forks_count,
        openIssuesCount: r.open_issues_count,
        sizeKb: r.size_kb,
        defaultBranch: r.default_branch,
        topics: r.topics,
        pushedAt: r.pushed_at,
        ingestedAt: r.ingested_at
      }));

      return formatted;
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch repos' });
    }
  });

  fastify.get('/repos/:fullName', async (request, reply) => {
    const userId = (request as any).user.id;
    const { fullName } = request.params as { fullName: string };
    
    try {
      const sql = 'SELECT * FROM repos WHERE user_id = $1 AND full_name = $2 LIMIT 1';
      const { rows } = await query(sql, [userId, fullName]);
      
      if (rows.length === 0) {
        return reply.code(404).send({ error: 'Repo not found' });
      }

      const r = rows[0];
      return {
        id: r.id,
        userId: r.user_id,
        githubRepoId: Number(r.github_repo_id),
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        language: r.language,
        languages: r.languages,
        isPrivate: r.is_private,
        isFork: r.is_fork,
        stargazersCount: r.stargazers_count,
        forksCount: r.forks_count,
        openIssuesCount: r.open_issues_count,
        sizeKb: r.size_kb,
        defaultBranch: r.default_branch,
        topics: r.topics,
        pushedAt: r.pushed_at,
        ingestedAt: r.ingested_at
      };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch repo' });
    }
  });
}
