/**
 * GitHub Package
 * 
 * This package provides a typed client for the GitHub API, handles OAuth flows,
 * and processes incoming webhooks.
 */

import type { GitHubUser, GitHubRepo } from '@proofofship/types';

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

export async function getUserRepos(
  accessToken: string
): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let url = 'https://api.github.com/user/repos?per_page=100&sort=updated&type=all';

  while (url) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'proofofship',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch repos. Status: ${response.status}`);
    }

    const data: GitHubRepo[] = await response.json();
    repos.push(...data);

    const linkHeader = response.headers.get('link');
    url = '';
    if (linkHeader) {
      const links = linkHeader.split(', ');
      const nextLink = links.find(link => link.includes('rel="next"'));
      if (nextLink) {
        const match = nextLink.match(/<([^>]+)>/);
        if (match) {
          url = match[1];
        }
      }
    }
  }

  return repos;
}

export async function getRepoLanguages(
  accessToken: string,
  fullName: string
): Promise<Record<string, number>> {
  const response = await fetch(`https://api.github.com/repos/${fullName}/languages`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'proofofship',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch languages for ${fullName}. Status: ${response.status}`);
  }

  return response.json();
}

export async function getPublicRepo(
  owner: string,
  repo: string,
  token?: string
): Promise<GitHubRepo> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'proofofship',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch repo ${owner}/${repo}. Status: ${response.status}`);
  }
  return response.json();
}

export async function getPublicRepoLanguages(
  owner: string,
  repo: string,
  token?: string
): Promise<Record<string, number>> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'proofofship',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch languages for ${owner}/${repo}. Status: ${response.status}`);
  }
  return response.json();
}

export function parsePublicGitHubUrl(url: string): { owner: string; repo: string } {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) throw new Error('Invalid GitHub URL');
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

export async function getRepoCommitCount(
  owner: string,
  repo: string,
  token?: string
): Promise<number> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'proofofship',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Fetch only 1 commit, and look at the Link header to find the last page index
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, { headers });
  if (!response.ok) return 0; // fallback

  const linkHeader = response.headers.get('link');
  if (!linkHeader) {
    // If there's no link header, there is likely only 1 page of commits.
    const commits = await response.json();
    return commits.length;
  }

  // Parse the 'last' link rel. e.g. <https://api.github.com/repositories/123/commits?per_page=1&page=42>; rel="last"
  const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  return 0;
}
