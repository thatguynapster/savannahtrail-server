import moment from "moment";
import BookingModel from "../models/Bookings";

export const getDashboardKpis = async (date_from?: Date, date_to?: Date) => {
    const startDate = date_from ? moment(date_from).startOf("day") : moment().subtract(30, "days").startOf("day");
    const endDate = date_to ? moment(date_to).endOf("day") : moment().endOf("day");

    const matchQuery: any = {
        created_at: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate(),
        },
    };

    const totalBookings = await BookingModel.countDocuments(matchQuery);

    const revenueResult = await BookingModel.aggregate([
        {
            $match: {
                ...matchQuery,
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

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const successfulBookings = await BookingModel.countDocuments({
        ...matchQuery,
        payment_status: "success",
    });

    const averageBookingValue = successfulBookings > 0 ? totalRevenue / successfulBookings : 0;

    const kpis = {
        //we still dont know what kpis to actually measure soo
        totalRevenue,
        totalBookings,
        occupancyRate: 0,
        averageBookingValue,
    };

    return kpis;
};
