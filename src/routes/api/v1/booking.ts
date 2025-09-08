import express from "express";
import { createBookingController, deleteBookingController, getAllBookingsController, getBookingByIdController, reassignBookedGuide, updateBookingController } from "../../../controllers/booking";
const app = express();

app.get("/", getAllBookingsController);
app.post("/create", createBookingController);
app.get("/:id", getBookingByIdController);
app.put("/update/:id", updateBookingController);
app.delete("/delete/:id", deleteBookingController);
app.post("/:id/reassign-guide", reassignBookedGuide); //assign guide to booking

export { app as bookingsRouter };
