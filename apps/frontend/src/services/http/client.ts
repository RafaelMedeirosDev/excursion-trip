import axios from "axios";
import { env } from "@/config/env";
import { setupInterceptors } from "./interceptors";

export const httpClient = axios.create({
  baseURL: env.apiUrl,
});

setupInterceptors(httpClient);
