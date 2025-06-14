// backend/utils/GetDateIntervals.js
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

// Extend dayjs with plugins for robust timezone handling.
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Calculates various date intervals based on a given date, adjusted for the server's timezone.
 * This is essential for generating consistent date ranges for database queries and reports.
 * @param {string} [currentDateStr] - The target date in "YYYY-MM-DD" format. Defaults to today.
 * @returns {object|null} An object containing various date ranges and labels, or null if the input date is invalid.
 */
export const getDateIntervals = (
  currentDateStr = dayjs().format("YYYY-MM-DD")
) => {
  const serverTimezone = dayjs.tz.guess();

  // Create a dayjs object at the start of the given day in the server's timezone.
  const today = dayjs(currentDateStr).tz(serverTimezone).startOf("day");

  if (!today.isValid()) {
    return null;
  }

  // Define date ranges for dashboard queries.
  const last30DaysStart = today.subtract(29, "days").toDate();
  const last30DaysEnd = today.endOf("day").toDate();

  const previous30DaysStart = today.subtract(59, "days").toDate();
  const previous30DaysEnd = today.subtract(30, "days").endOf("day").toDate();

  const sixMonthsAgo = today.subtract(5, "month").startOf("month").toDate();

  // Generate arrays for chart labels and query ranges.
  const dateRange = Array.from({ length: 30 }, (_, i) =>
    today.subtract(29 - i, "day").format("YYYY-M-D")
  );

  const sixMonthLabels = Array.from({ length: 6 }, (_, i) =>
    today.subtract(5 - i, "month").format("MMM")
  );

  const sixMonthRange = Array.from({ length: 6 }, (_, i) =>
    today.subtract(5 - i, "month").format("YYYY-MM")
  );

  return {
    last30DaysStart,
    last30DaysEnd,
    previous30DaysStart,
    previous30DaysEnd,
    sixMonthsAgo,
    dateRange,
    sixMonthLabels,
    sixMonthRange,
  };
};
