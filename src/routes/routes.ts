import express, { Request, Response, NextFunction } from "express";
const app = express();
import cors from "cors";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

app.use(
    cors({
        origin: "*",
        optionsSuccessStatus: 200,
    })
);
app.options(
    "*",
    cors({
        origin: "*",
        optionsSuccessStatus: 200,
    })
);

app.get("/health-check", (req: Request, res: Response, next: NextFunction) => {
    try {
        return res.status(200).send("OK");
    } catch (err) {
        return next(err);
    }
});

import { bookingsRouter } from "./api/v1/booking";
app.use("/api/v1.0/bookings", bookingsRouter);

import { guidesRouter } from "./api/v1/guide";
app.use("/api/v1.0/guides", guidesRouter);

import { packagesRouter } from "./api/v1/packages";
app.use("/api/v1.0/packages", packagesRouter);

// import { usersRouter } from "./api/v1/user";
// app.use("/api/v1.0/users", usersRouter);

import { extensionRouter } from "./api/v1/extension";
app.use("/api/v1.0/extensions", extensionRouter);

import { authRouter } from "./api/v1/auth";
app.use("/api/v1.0/auth", authRouter);

export default app;
