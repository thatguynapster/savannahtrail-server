import { Express, Request, Response } from "express";
import { login, logout, refreshToken } from "./controllers/authController";
function routes(app: Express) {
  app.get("/api/healthcheck", (req: Request, res: Response) => {
    return res.send("it works!");
  });

  app.post("/api/auth/login", login);
  app.post("/api/auth/logout", logout);
  app.post("/api/auth/refresh",  refreshToken);


}
export default routes;
