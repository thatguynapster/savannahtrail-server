// index.ts
import "dotenv/config"; // load env FIRST

import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import compression from "compression";
import mongoosePaginate from "mongoose-paginate-v2";

// IMPORTANT for ESM: use .js extension for local imports
import router from "./src/routes/routes";

// --- Environment ---
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = Number(process.env.PORT || 4000);
const DB_URL = process.env.DB_URL;

if (!DB_URL) {
  // Fail fast if DB_URL not set
  // eslint-disable-next-line no-console
  console.error("Missing DB_URL in environment");
  process.exit(1);
}

console.log(`Running Environment: ${NODE_ENV}`);

// Optional: predictable find() behavior
mongoose.set("strictQuery", true);

// --- Connect to MongoDB ---
(async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log("Database Connected");

    mongoose.connection.on("connected", () => console.log("Database Connection Established"));
    mongoose.connection.on("error", (err) => console.error("Database Connection Error:", err));
    mongoose.connection.on("reconnected", () => console.log("Database Connection Reconnected"));
  } catch (err) {
    console.error("Error connecting Database:", err);
    process.exit(1);
  }
})();

// --- Mongoose paginate custom labels ---
mongoosePaginate.paginate.options = {
  customLabels: {
    totalDocs: "total",
    limit: "limit",
    page: "page",
    totalPages: "pages",
    pagingCounter: false,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: false,
    nextPage: false,
  },
};

// --- Express app ---
const app = express();

app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "100mb" })); // once is enough
app.use(compression());

// CORS
app.use(
  cors({
    origin: "*",
    optionsSuccessStatus: 200,
    methods: "GET, PUT, POST, DELETE, OPTIONS",
  })
);
app.options("*", cors({ origin: "*", optionsSuccessStatus: 200 }));

// Security-ish headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.removeHeader("X-Powered-By");
  res.removeHeader("Date");
  res.removeHeader("Connection");
  res.setHeader("Server", "SSV Normandy");
  next();
});

// Health check
app.get("/health", (_req, res) => {
  const mongoState = mongoose.connection.readyState; // 1=connected
  res.json({ ok: true, mongo: mongoState });
});

// Routes
app.use(router);

// Not found
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    details: NODE_ENV === "production" ? undefined : err?.details || err,
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Savannah Server Running on port: ${PORT}`);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down...`);
  server.close(async () => {
    await mongoose.disconnect().catch(() => {});
    process.exit(0);
  });
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
