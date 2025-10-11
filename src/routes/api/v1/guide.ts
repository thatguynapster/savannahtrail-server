import multer from "multer";
import express from "express";
import { createGuideController, getGuideByIdController, paginateGuidesController } from "../../../controllers/guide";

const app = express();

const upload = multer({ storage: multer.memoryStorage() });

app.get("/", paginateGuidesController);
app.post("/", upload.single("image"), createGuideController);

app.get("/available", paginateGuidesController);
app.get("/:id", getGuideByIdController);
export { app as guidesRouter };
