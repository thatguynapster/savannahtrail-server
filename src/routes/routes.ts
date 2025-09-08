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
export default app;
