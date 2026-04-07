import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { query } from '../db/client.js';

export default async function scoresRoutes(fastify: FastifyInstance) {
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

  fastify.get('/scores', async (request, reply) => {
    const userId = (request as any).user.id;
    try {
      // Query: latest score per repo
      const sql = `
        SELECT DISTINCT ON (repo_id) s.*, r.full_name, r.name,
          r.language, r.description
        FROM scores s
        JOIN repos r ON r.id = s.repo_id
        WHERE s.user_id = $1
        ORDER BY repo_id, version DESC
      `;
      const { rows } = await query(sql, [userId]);
      
      // The instructions say "Return array sorted by score DESC"
      // DISTINCT ON requires repo_id as the first ORDER BY column,
      // so we sort in JS after fetching.
      const formatted = rows.map(r => ({
        id: r.id,
        repoId: r.repo_id,
        userId: r.user_id,
        score: r.score,
        comprehensionHealth: r.comprehension_health,
        hallucinationDebt: r.hallucination_debt,
        architecturalConsistency: r.architectural_consistency,
        debtTrajectory: r.debt_trajectory,
        complexityAdjustment: r.complexity_adjustment,
        complexityTier: r.complexity_tier,
        breakdown: r.breakdown,
        percentile: r.percentile,
        version: r.version,
        createdAt: r.created_at,
        repo: {
          fullName: r.full_name,
          name: r.name,
          language: r.language,
          description: r.description
        }
      }));

      formatted.sort((a, b) => b.score - a.score);

      return formatted;
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch scores' });
    }
  });

  fastify.get('/scores/summary', async (request, reply) => {
    const userId = (request as any).user.id;
    try {
      // Get the latest score per repo
      const sql = `
        SELECT DISTINCT ON (repo_id) s.*, r.full_name
        FROM scores s
        JOIN repos r ON r.id = s.repo_id
        WHERE s.user_id = $1
        ORDER BY repo_id, version DESC
      `;
      const { rows } = await query(sql, [userId]);

      if (rows.length === 0) {
        return {
          averageScore: 0,
          totalRepos: 0,
          topRepo: null,
          complexityDistribution: { trivial: 0, simple: 0, moderate: 0, complex: 0, advanced: 0 },
          lastAnalyzedAt: null
        };
      }

      let totalScore = 0;
      let topRepo = { fullName: '', score: -1 };
      const distr: Record<string, number> = {
        trivial: 0, simple: 0, moderate: 0, complex: 0, advanced: 0
      };

      for (const r of rows) {
        totalScore += r.score;
        if (r.score > topRepo.score) {
          topRepo = { fullName: r.full_name, score: r.score };
        }
        
        const tier = r.complexity_tier || 'trivial';
        distr[tier] = (distr[tier] || 0) + 1;
      }

      // Find the most recent analysis time overall
      const lastAnalyzedAt = rows.reduce(
        (max, r) => (new Date(r.created_at) > new Date(max) ? r.created_at : max),
        rows[0].created_at
      );

      return {
        averageScore: Math.round(totalScore / rows.length),
        totalRepos: rows.length,
        topRepo,
        complexityDistribution: distr,
        lastAnalyzedAt
      };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch summary' });
    }
  });

  fastify.get('/scores/:repoId', async (request, reply) => {
    const userId = (request as any).user.id;
    const { repoId } = request.params as { repoId: string };
    
    // Quick handle of /scores/summary routing conflict
    // Fastify processes specific routes before parameterized routes
    // generally but since we defined summary above this, we are good.
    if (repoId === 'summary') return;

    try {
      const sql = `
        SELECT * FROM scores
        WHERE user_id = $1 AND repo_id = $2
        ORDER BY version DESC
      `;
      const { rows } = await query(sql, [userId, repoId]);
      
      const formatted = rows.map(r => ({
        id: r.id,
        repoId: r.repo_id,
        userId: r.user_id,
        score: r.score,
        comprehensionHealth: r.comprehension_health,
        hallucinationDebt: r.hallucination_debt,
        architecturalConsistency: r.architectural_consistency,
        debtTrajectory: r.debt_trajectory,
        complexityAdjustment: r.complexity_adjustment,
        complexityTier: r.complexity_tier,
        breakdown: r.breakdown,
        percentile: r.percentile,
        version: r.version,
        createdAt: r.created_at,
      }));

      return formatted;
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch score history' });
    }
  });
}
