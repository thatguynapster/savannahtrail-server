import moment from "moment";
import BookingModel from "../models/Bookings";
import DashboardKPIModel from "../models/DashboardKPI";

export const calculateAndSaveKpis = async (forDate: Date) => {
    const startDate = moment(forDate).startOf("day");
    const endDate = moment(forDate).endOf("day");

    const bookingsToday = await BookingModel.countDocuments({
        created_at: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate(),
        },
    });

    const revenueTodayResult = await BookingModel.aggregate([
        {
            $match: {
                created_at: {
                    $gte: startDate.toDate(),
                    $lte: endDate.toDate(),
                },
                payment_status: "success",
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$total_amount" },
            },
        },
    ]);

    const revenueToday = revenueTodayResult.length > 0 ? revenueTodayResult[0].total : 0;

    const pendingPayments = await BookingModel.countDocuments({
        payment_status: "pending",
    });

    const totalBookings = await BookingModel.countDocuments();

    const totalRevenueResult = await BookingModel.aggregate([
        {
            $match: {
                payment_status: "success",
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$total_amount" },
            },
        },
    ]);

    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    const successfulBookings = await BookingModel.countDocuments({ payment_status: "success" });

    const averageBookingValue = successfulBookings > 0 ? totalRevenue / successfulBookings : 0;

    const kpis = {
        date: startDate.toDate(),
        bookings_today: bookingsToday,
        revenue_today: revenueToday,
        pending_payments: pendingPayments,
        failed_webhooks: 0,
        total_bookings: totalBookings,
        total_revenue: totalRevenue,
        conversion_rate: 0,
        average_booking_value: averageBookingValue,
    };

    await DashboardKPIModel.findOneAndUpdate({ date: startDate.toDate() }, kpis, { upsert: true });
};

export const getKpis = async (date_from: Date, date_to: Date) => {
    return await DashboardKPIModel.find({
        date: {
            $gte: date_from,
            $lte: date_to,
        },
    }).sort({ date: "asc" });
};
