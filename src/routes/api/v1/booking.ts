import express, { Request, Response, NextFunction } from "express";
import { createBookingController, deleteBookingController, getAllBookingsController, getBookingByIdController, updateBookingController } from "../../../controllers/booking";
const app = express();

app.get('/', getAllBookingsController);
app.post('/create', createBookingController);
app.get('/:id', getBookingByIdController);
app.put('/update/:id', updateBookingController);
app.delete('/delete/:id', deleteBookingController);

export { app as bookingsRouter };