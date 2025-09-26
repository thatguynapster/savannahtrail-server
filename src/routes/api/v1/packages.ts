import express from "express";

const app = express();

import multer from "multer";
import { getAllPackagesController, paginatePackagesController, createPackageController, updatePackageByIdController, deletePackageByIdController, getPackageByIdController } from "../../../controllers/packages";

const upload = multer({ storage: multer.memoryStorage() });

app.get("/", getAllPackagesController);
app.get('/:id', getPackageByIdController);
app.get("/paginate", paginatePackagesController);
app.post("/create", createPackageController);
app.put("/:id", updatePackageByIdController);
app.delete("/:id", deletePackageByIdController);

export { app as packagesRouter };