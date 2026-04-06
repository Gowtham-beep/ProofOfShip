import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { exchangeCodeForToken, getGitHubUser } from '@proofofship/github';
import { query } from '../db/client.js';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.get('/auth/github', async (request, reply) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return reply.code(500).send({ error: 'GITHUB_CLIENT_ID not configured' });
    }
    
    const redirectUri = process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/auth/github/callback';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user,user:email&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    return reply.redirect(githubAuthUrl);
  });

  fastify.get('/auth/github/callback', async (request, reply) => {
    const { code } = request.query as { code?: string };
    
    if (!code) {
      return reply.code(400).send({ error: 'Authorization code missing' });
    }

    const clientId = process.env.GITHUB_CLIENT_ID!;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET!;
    const jwtSecret = process.env.JWT_SECRET!;

    try {
      const accessToken = await exchangeCodeForToken(code, clientId, clientSecret);
      const githubProfile = await getGitHubUser(accessToken);
      
      const insertSql = `
        INSERT INTO users (
          github_id, github_username, github_display_name, github_avatar_url, github_access_token, email
        ) VALUES (
          $1, $2, $3, $4, $5, $6
        )
        ON CONFLICT (github_id) DO UPDATE SET
          github_access_token = EXCLUDED.github_access_token,
          github_display_name = EXCLUDED.github_display_name,
          github_avatar_url = EXCLUDED.github_avatar_url,
          email = EXCLUDED.email,
          updated_at = NOW()
        RETURNING id, github_id, github_username, plan
      `;
      
      const params = [
        githubProfile.id,
        githubProfile.login,
        githubProfile.name || null,
        githubProfile.avatar_url,
        accessToken,
        githubProfile.email || null
      ];

      const { rows } = await query(insertSql, params);
      const user = rows[0];

      const token = jwt.sign(
        { id: user.id, githubId: user.github_id.toString(), username: user.github_username, plan: user.plan },
        jwtSecret,
        { expiresIn: '7d' }
      );

      return reply.redirect(`http://localhost:3000/auth/callback?token=${token}`);
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'OAuth flow failed', details: error.message });
    }
  });

  fastify.get('/auth/me', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) return reply.code(401).send({ error: 'Token missing' });

    try {
      const jwtSecret = process.env.JWT_SECRET!;
      const payload = jwt.verify(token, jwtSecret) as any;
      
      const { rows } = await query('SELECT id, github_username as username, github_avatar_url as "avatarUrl", plan FROM users WHERE id = $1', [payload.id]);
      
      if (rows.length === 0) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return rows[0];
    } catch (error) {
      return reply.code(401).send({ error: 'Invalid token' });
    }
  });
}
