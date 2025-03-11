import { Injectable, OnModuleInit } from "@nestjs/common";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as sqlite3 from "better-sqlite3";
import * as schema from "./schema";

@Injectable()
export class DatabaseService implements OnModuleInit {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const sqlite = new sqlite3("sqlite.db");
    this.db = drizzle(sqlite, { schema });
  }

  async onModuleInit() {
    // You can add any initialization logic here
    // For example, running migrations
  }

  getDb() {
    return this.db;
  }
}
