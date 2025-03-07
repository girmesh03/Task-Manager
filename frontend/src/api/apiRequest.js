import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_SERVER_URL;

export const makeRequest = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
});
