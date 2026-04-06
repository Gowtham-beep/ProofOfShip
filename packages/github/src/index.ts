/**
 * GitHub Package
 * 
 * This package provides a typed client for the GitHub API, handles OAuth flows,
 * and processes incoming webhooks.
 */

import type { GitHubUser } from '@proofofship/types';

// Exchange code for GitHub access token
export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange token. Status: ${response.status}`);
  }

  const data: Record<string, any> = await response.json();
  
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }

  return data.access_token;
}

// Fetch authenticated GitHub user using access token
export async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'proofofship',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user. Status: ${response.status}`);
  }

  return response.json();
}

export const getGithubClient = (token: string) => {
  // Placeholder for GitHub API client initialization
  return {
    token,
    client: {}
  };
};
