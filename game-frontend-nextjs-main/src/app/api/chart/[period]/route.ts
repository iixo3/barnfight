//@ts-ignore
import { adminGetDocument } from "@/shared/utils/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import queryDatabase from "@/shared/utils/db";

const get1HourVariation = async () => {
  const result = await queryDatabase(`
        WITH time_series AS (
    SELECT generate_series(
        date_trunc('minute', NOW() - INTERVAL '2 hours'), 
        date_trunc('minute', NOW()), 
        INTERVAL '1 minute'
    ) AS date
),
last_available_price AS (
    SELECT 
        AVG(price) AS avg_price
    FROM (
        SELECT price
        FROM graphic
        ORDER BY time DESC
        LIMIT 1
    ) AS most_recent_record
),
aggregated_data AS (
    SELECT 
        date_trunc('minute', time) AS date, 
        AVG(price) AS avg_price
    FROM graphic
    WHERE time >= NOW() - INTERVAL '2 hours'
    GROUP BY date
),
filled_data AS (
    SELECT 
        ts.date, 
        COALESCE(
            ad.avg_price, 
            (SELECT avg_price FROM last_available_price),
            0
        ) AS avg_price
    FROM time_series ts
    LEFT JOIN aggregated_data ad ON ts.date = ad.date
    WHERE ts.date >= (SELECT MIN(date) FROM time_series)
),
hourly_aggregates AS (
    SELECT
        date_trunc('hour', date) AS hour,
        AVG(avg_price) AS avg_price
    FROM filled_data
    GROUP BY date_trunc('hour', date)
),
variation AS (
    SELECT 
        current_hour.avg_price AS current_hour_avg,
        previous_hour.avg_price AS previous_hour_avg,
        current_hour.avg_price - previous_hour.avg_price AS variation
    FROM (
        SELECT * 
        FROM hourly_aggregates 
        WHERE hour = date_trunc('hour', NOW() - INTERVAL '1 hour')
    ) current_hour
    CROSS JOIN (
        SELECT * 
        FROM hourly_aggregates 
        WHERE hour = date_trunc('hour', NOW() - INTERVAL '2 hours')
    ) previous_hour
)
SELECT variation 
FROM variation;`);
  return result?.[0].variation ?? 0;
};

const get24HoursVariation = async () => {
  const result = await queryDatabase(`
        WITH time_series AS (
    SELECT generate_series(
        date_trunc('hour', NOW() - INTERVAL '48 hours'), 
        date_trunc('hour', NOW()), 
        INTERVAL '1 hour'
    ) AS date
),
last_available_price AS (
    SELECT 
        AVG(price) AS avg_price
    FROM (
        SELECT price
        FROM graphic
        ORDER BY time DESC
        LIMIT 1
    ) AS most_recent_record
),
aggregated_data AS (
    SELECT 
        date_trunc('hour', time) AS date, 
        AVG(price) AS avg_price
    FROM graphic
    WHERE time >= NOW() - INTERVAL '48 hours'
    GROUP BY date
),
combined_data AS (
    SELECT 
        ts.date, 
        COALESCE(
            ad.avg_price, 
            (SELECT avg_price FROM last_available_price),
            0
        ) AS avg_price
    FROM time_series ts
    LEFT JOIN aggregated_data ad ON ts.date = ad.date
    WHERE ts.date >= (SELECT MIN(date) FROM time_series)
),
daily_aggregates AS (
    SELECT
        date_trunc('day', date) AS day,
        AVG(avg_price) AS avg_price
    FROM combined_data
    GROUP BY date_trunc('day', date)
),
variation AS (
    SELECT 
        current_day.avg_price AS last_24_hours_avg,
        previous_day.avg_price AS previous_24_hours_avg,
        current_day.avg_price - previous_day.avg_price AS variation
    FROM (
        SELECT 
            AVG(avg_price) AS avg_price
        FROM combined_data
        WHERE date >= NOW() - INTERVAL '24 hours'
        AND date < NOW()
    ) current_day,
    (
        SELECT 
            AVG(avg_price) AS avg_price
        FROM combined_data
        WHERE date >= NOW() - INTERVAL '48 hours'
        AND date < NOW() - INTERVAL '24 hours'
    ) previous_day
)
SELECT variation
FROM variation;`);
  return result?.[0].variation ?? 0;
};

const get1WeekVariation = async () => {
  const result = await queryDatabase(`
        WITH time_series AS (
    SELECT generate_series(
        date_trunc('day', NOW() - INTERVAL '14 days'), 
        date_trunc('day', NOW()), 
        INTERVAL '1 day'
    ) AS date
),
last_available_price AS (
    SELECT 
        AVG(price) AS avg_price
    FROM (
        SELECT price
        FROM graphic
        ORDER BY time DESC
        LIMIT 1
    ) AS most_recent_record
),
aggregated_data AS (
    SELECT 
        date_trunc('day', time) AS date, 
        AVG(price) AS avg_price
    FROM graphic
    WHERE time >= NOW() - INTERVAL '14 days'
    GROUP BY date_trunc('day', time)
),
combined_data AS (
    SELECT 
        ts.date, 
        COALESCE(
            ad.avg_price, 
            (SELECT avg_price FROM last_available_price),
            0
        ) AS avg_price
    FROM time_series ts
    LEFT JOIN aggregated_data ad ON ts.date = ad.date
),
weekly_aggregates AS (
    SELECT
        CASE 
            WHEN date >= date_trunc('day', NOW() - INTERVAL '7 days') THEN 'last_7_days'
            WHEN date < date_trunc('day', NOW() - INTERVAL '7 days') THEN 'previous_7_days'
        END AS period,
        AVG(avg_price) AS avg_price
    FROM combined_data
    WHERE date >= date_trunc('day', NOW() - INTERVAL '14 days')
    GROUP BY period
),
variation AS (
    SELECT 
        last_7_days.avg_price AS last_7_days_avg,
        previous_7_days.avg_price AS previous_7_days_avg,
        last_7_days.avg_price - previous_7_days.avg_price AS variation
    FROM (
        SELECT avg_price 
        FROM weekly_aggregates 
        WHERE period = 'last_7_days'
    ) last_7_days
    CROSS JOIN (
        SELECT avg_price 
        FROM weekly_aggregates 
        WHERE period = 'previous_7_days'
    ) previous_7_days
)
SELECT * 
FROM variation;`);
  return result?.[0].variation ?? 0;
};

const get1Hour = async () => {
  const result = await queryDatabase(`
            WITH time_series AS (
    SELECT generate_series(
        date_trunc('minute', NOW() - INTERVAL '1 hour'), 
        date_trunc('minute', NOW()), 
        INTERVAL '1 minute'
    ) AS date
),
last_available_price AS (
    SELECT 
        AVG(price) AS avg_price
    FROM (
        SELECT price
        FROM graphic
        ORDER BY time DESC
        LIMIT 1
    ) AS most_recent_record
),
aggregated_data AS (
    SELECT 
        date_trunc('minute', time) AS date, 
        AVG(price) AS avg_price
    FROM graphic
    WHERE time >= NOW() - INTERVAL '1 hour'
    GROUP BY date
),
filled_data AS (
    SELECT 
        ts.date, 
        COALESCE(
            ad.avg_price, 
            (SELECT avg_price FROM last_available_price),
            0
        ) AS avg_price
    FROM time_series ts
    LEFT JOIN aggregated_data ad ON ts.date = ad.date
    WHERE ts.date >= (SELECT MIN(date) FROM time_series)
)
SELECT * 
FROM filled_data
ORDER BY date;
        `);
  return result ?? [];
};

const get24Hours = async () => {
  const result = await queryDatabase(`
            WITH time_series AS (
    SELECT generate_series(
        date_trunc('hour', NOW() - INTERVAL '24 hours'), 
        date_trunc('hour', NOW()), 
        INTERVAL '1 hour'
    ) AS date
),
last_available_price AS (
    SELECT 
        AVG(price) AS avg_price
    FROM (
        SELECT price
        FROM graphic
        ORDER BY time DESC
        LIMIT 1
    ) AS most_recent_record
),
aggregated_data AS (
    SELECT 
        date_trunc('hour', time) AS date, 
        AVG(price) AS avg_price
    FROM graphic
    WHERE time >= NOW() - INTERVAL '24 hours'
    GROUP BY date
),
combined_data AS (
    SELECT 
        ts.date, 
        COALESCE(
            ad.avg_price, 
            (SELECT avg_price FROM last_available_price),
            0
        ) AS avg_price
    FROM time_series ts
    LEFT JOIN aggregated_data ad ON ts.date = ad.date
    WHERE ts.date >= (SELECT MIN(date) FROM time_series)
)
SELECT * 
FROM combined_data
ORDER BY date;
        `);

  // Log the result to check if it's empty
  // console.log('24h data:', result);

  // Send an empty array if result is empty
  return result ?? [];
};

const get1Week = async () => {
  const result = await queryDatabase(`
WITH time_series AS (
    SELECT generate_series(
        date_trunc('day', NOW() - INTERVAL '7 days'), 
        date_trunc('day', NOW()), 
        INTERVAL '1 day'
    ) AS date
),
last_available_price AS (
    SELECT 
        AVG(price) AS avg_price
    FROM (
        SELECT price
        FROM graphic
        ORDER BY time DESC
        LIMIT 1
    ) AS most_recent_record
),
aggregated_data AS (
    SELECT 
        date_trunc('day', time) AS date, 
        AVG(price) AS avg_price
    FROM graphic
    WHERE time >= NOW() - INTERVAL '7 days'
    GROUP BY date_trunc('day', time)
),
combined_data AS (
    SELECT 
        ts.date, 
        COALESCE(
            ad.avg_price, 
            (SELECT avg_price FROM last_available_price),
            0
        ) AS avg_price
    FROM time_series ts
    LEFT JOIN aggregated_data ad ON ts.date = ad.date
    WHERE ts.date >= (SELECT MIN(date) FROM time_series)
)
SELECT * 
FROM combined_data
ORDER BY date;
        `);

  return result ?? [];
};

export async function GET(
  request: NextRequest,
  context: { params: { period: string } }
) {
  // Do whatever you want
  let data: { date: Date | string; avg_price: number }[] = [];
  let variation = 0;
  switch (context.params.period) {
    case "1H":
      data = await get1Hour();
      variation = await get1HourVariation();
      break;
    case "24H":
      data = await get24Hours();
      variation = await get24HoursVariation();
      break;
    case "1W":
      data = await get1Week();
      variation = await get1WeekVariation();
      break;
    default:
      return new NextResponse("Invalid period", { status: 400 });
  }
  const nextResponse = new NextResponse(JSON.stringify({ data, variation }), {
    status: 200,
  });
  nextResponse.headers.append(
    "Cache-Control",
    "public, max-age=500, immutable"
  );
  nextResponse.headers.append("Content-Type", "application/json");
  return nextResponse;
}
