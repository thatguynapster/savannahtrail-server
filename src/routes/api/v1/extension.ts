import multer from "multer";
import express from "express"; 

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });


import { uploadfileControler, uploadMultipleFilesControler } from "../../../controllers/extensions";

router.post("/file/upload", upload.single("file"), uploadfileControler);
router.post("/file/upload-multiple", upload.array("files"), uploadMultipleFilesControler);

export { router as extensionRouter };