import { Schema, model, Document } from 'mongoose';

export interface DashboardKPI extends Document {
    date: Date;
    bookings_today: number;
    revenue_today: number;
    pending_payments: number;
    failed_webhooks: number;
    total_bookings: number;
    total_revenue: number;
    conversion_rate: number;
    average_booking_value: number;
    created_at: Date;
}

const DashboardKPISchema = new Schema<DashboardKPI>({
    date: { type: Date, required: true, unique: true },
    bookings_today: { type: Number, default: 0 },
    revenue_today: { type: Number, default: 0 },
    pending_payments: { type: Number, default: 0 },
    failed_webhooks: { type: Number, default: 0 },
    total_bookings: { type: Number, default: 0 },
    total_revenue: { type: Number, default: 0 },
    conversion_rate: { type: Number, default: 0 },
    average_booking_value: { type: Number, default: 0 },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false },
});

const DashboardKPIModel = model<DashboardKPI>('DashboardKPI', DashboardKPISchema, 'DashboardKPIs');

export default DashboardKPIModel;
