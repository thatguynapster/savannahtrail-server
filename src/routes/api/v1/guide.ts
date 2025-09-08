import multer from "multer";
import express from "express";
import { createGuideController, paginateGuidesController } from "../../../controllers/guide";

const app = express();

const upload = multer({ storage: multer.memoryStorage() });

app.get("/", paginateGuidesController);
app.post("/", upload.single("image"), createGuideController);

app.get("/available", paginateGuidesController);
export { app as guidesRouter };
