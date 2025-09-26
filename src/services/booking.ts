// services/booking.service.ts
import { FilterQuery, PipelineStage, Types } from 'mongoose';
import BookingCollection , {Booking} from '..//models/Bookings'
import { CreatePackageValidate, UpdatePackageValidate } from '../validators/package'
import { getOnePackage } from './packages';


function generateReference(prefix = "tour-INV"): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${y}${m}${day}-${rand}`;
}

export const getAllBookings = async () => {
  const bookings = await BookingCollection.find().sort({ created_at: -1 });
  return bookings;
};

export const paginateBookings = async (query: any, options: any) => {
  const bookings = await BookingCollection.paginate(query, options);
  return bookings;
};

export const aggregatePaginateBookings = async (query: PipelineStage[], options: any) => {
  const bookings = await BookingCollection.aggregatePaginate(
    BookingCollection.aggregate(query), options
);
  return bookings;
};

export const getOneBooking = async (filter: any) => {
    const booking = await BookingCollection.findOne(filter).lean();

    if(!booking) {
        throw new Error('Booking not found');
    }

    return booking;
}

export const getBookingById = async (id: string) => {
  const booking = await BookingCollection.findById(id);
  return booking;
};

export const createBooking = async (data: Booking) => {
  const reference = generateReference();

  const pkg = await getOnePackage({ _id: data.package_id });
  if (!pkg) {
    throw new Error("Invalid package_id");
  }
  
  const booking = await BookingCollection.create({
    reference,
    package_id: data.package_id,
    guest_name: data.guest_name,
    guest_phone: data.guest_phone,
    guest_email: data.guest_email?.toLowerCase() ?? "",
    tour_date: data.tour_date ? new Date(data.tour_date) : null,
    num_guests: data.num_guests,
    addons: data.addons, 
    payment_status: "pending",
    booking_status: "pending",
    total_amount: (pkg.base_price ?? 0) + (data.num_guests || 1) + (data.addons?.reduce((sum, addon) => sum + (addon.price || 0), 0) || 0),
  });

  return booking;
};

export const updateBooking = async (bookingId: string| Types.ObjectId, data: FilterQuery<Booking>) => {
  const updatedBooking = await BookingCollection.findByIdAndUpdate(
    bookingId,
    { $set: data },
    { new: true }
  );

  return updatedBooking;
};

export const deleteBooking = async (bookingId: string) => {
    const deletedBooking = await BookingCollection.findByIdAndDelete(bookingId);
    return deletedBooking;
};
