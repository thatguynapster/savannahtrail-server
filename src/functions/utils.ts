export const parseDateRange = (q: { start_date: any; end_date: any; date: any; })=>{
    const hasRange = q.start_date && q.end_date;
    if (hasRange) {
      const start = new Date(String(q.start_date));
      const end = new Date(String(q.end_date));
      if (Number.isNaN(+start) || Number.isNaN(+end)) {
        throw Object.assign(new Error("Invalid start_date/end_date"), { statusCode: 400 });
      }
      // make end exclusive by bumping 1 ms if dates are equal or ensure end > start
      if (end <= start) {
        throw Object.assign(new Error("end_date must be after start_date"), { statusCode: 400 });
      }
      return { start, end, isSingleDay: false };
    }
  
    if (!q.date) {
      throw Object.assign(new Error("Provide either ?date=YYYY-MM-DD or ?start_date=&end_date="), { statusCode: 400 });
    }
  
    const day = new Date(String(q.date));
    if (Number.isNaN(+day)) {
      throw Object.assign(new Error("Invalid date"), { statusCode: 400 });
    }
  
    // Use UTC day bounds (adjust if you need Africa/Accra specifically)
    const start = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, 0, 0, 0));
    const end = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate() + 1, 0, 0, 0, 0));
    return { start, end, isSingleDay: true };

}