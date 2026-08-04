import axios from 'axios';

export const openLibraryClient = axios.create({
  baseURL: process.env.OPENLIB_API_URL,
  timeout: 30000,
});
