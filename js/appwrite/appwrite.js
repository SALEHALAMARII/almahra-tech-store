import { Client, Account, Databases, Storage, ID, Query } from "https://cdn.jsdelivr.net/npm/appwrite@16.1.0/+esm";
import { appwriteConfig } from "./config.js";

export const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, Query, appwriteConfig };
