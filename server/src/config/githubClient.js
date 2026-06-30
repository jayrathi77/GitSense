import axios from 'axios';
import config from './env.js';

export const githubClient = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `token ${config.githubToken}`,
    Accept: 'application/vnd.github.v3+json',
  },
});

export default githubClient;
