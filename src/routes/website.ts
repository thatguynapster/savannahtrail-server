import express, { Request, Response } from "express";
const app = express();

app.get("/", (req: Request, res : Response) => {
    return res.redirect("https://currentmillis.com/");
});

export default app;