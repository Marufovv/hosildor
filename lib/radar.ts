export type RadarLot = {
  id: string;
  productId: string;
  grams: number;
  reserved: number;
  expires: string;
};

export type RadarOrderLine = {
  productId: string;
  grams: number;
};

export type RadarOrder = {
  at: string;
  status: string;
  lines: RadarOrderLine[];
};

export type RadarRecommendation = {
  id: string;
  productId: string;
  productName: string;
  type: "shortage" | "surplus" | "expiry" | "order";
  risk: "red" | "amber" | "green";
  title: string;
  action: string;
  reason: string;
  forecastKg: number;
  availableKg: number;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  resolvedAt?: string;
};

export function calculateDemandForecast(
  orders: RadarOrder[],
  productId: string,
  day: Date,
  historyDays = 28,
) {
  const buckets = Array.from({ length: historyDays }, (_, index) => {
    const date = new Date(day);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - (historyDays - 1 - index));
    return { date, grams: 0 };
  });

  for (const order of orders) {
    if (order.status === "cancelled") continue;
    const orderDate = new Date(order.at);
    const bucket = buckets.find(
      (entry) =>
        entry.date.toISOString().slice(0, 10) === orderDate.toISOString().slice(0, 10),
    );
    if (!bucket) continue;
    bucket.grams += order.lines
      .filter((line) => line.productId === productId)
      .reduce((total, line) => total + line.grams, 0);
  }

  const movingAverage = buckets.reduce((total, bucket) => total + bucket.grams, 0) /
    Math.max(historyDays, 1);
  const weekdayFactor = [1.05, 1, 0.95, 1, 1.08, 1.15, 1.12][day.getUTCDay()];
  const seasonalFactor = [0.9, 0.9, 1, 1.08, 1.12, 1.1, 1.05, 1.05, 1, 0.95, 0.9, 0.95][day.getUTCMonth()];
  return Math.max(0, Math.round(movingAverage * weekdayFactor * seasonalFactor));
}

export function expiryRisk(lot: RadarLot, now: Date) {
  const remainingDays = Math.ceil(
    (new Date(`${lot.expires}T00:00:00Z`).getTime() - now.getTime()) / 86_400_000,
  );
  if (remainingDays <= 2) return "red" as const;
  if (remainingDays <= 4) return "amber" as const;
  return "green" as const;
}

export function buildDailyRadar(
  products: Array<{ id: string; name: string; enabled: boolean }>,
  lots: RadarLot[],
  orders: RadarOrder[],
  now = new Date(),
) {
  const recommendations: RadarRecommendation[] = [];

  for (const product of products.filter((item) => item.enabled)) {
    const availableGrams = lots
      .filter((lot) => lot.productId === product.id)
      .reduce((total, lot) => total + Math.max(0, lot.grams - lot.reserved), 0);
    const forecastGrams = calculateDemandForecast(orders, product.id, now);
    const availableKg = availableGrams / 1000;
    const forecastKg = forecastGrams / 1000;

    if (availableGrams + 5000 < forecastGrams) {
      recommendations.push({
        id: `RADAR-${product.id}-${now.toISOString().slice(0, 10)}`,
        productId: product.id,
        productName: product.name,
        type: "shortage",
        risk: "red",
        title: `${product.name}: zaxira yetishmasligi`,
        action: "Fermer taklifini tekshiring yoki ortiqcha buyurtmalarni muddatga ko‘chiring.",
        reason: `Prognoz ${(forecastKg).toFixed(1)} kg, mavjud zaxira esa ${availableKg.toFixed(1)} kg.`,
        forecastKg,
        availableKg,
        createdAt: now.toISOString(),
        status: "pending",
      });
    }

    const riskyLots = lots.filter(
      (lot) => lot.productId === product.id && expiryRisk(lot, now) !== "green",
    );
    if (riskyLots.length) {
      const riskyKg = riskyLots.reduce(
        (total, lot) => total + Math.max(0, lot.grams - lot.reserved),
        0,
      ) / 1000;
      recommendations.push({
        id: `RADAR-${product.id}-expiry-${now.toISOString().slice(0, 10)}`,
        productId: product.id,
        productName: product.name,
        type: "expiry",
        risk: riskyLots.some((lot) => expiryRisk(lot, now) === "red") ? "red" : "amber",
        title: `${product.name}: yaroqlilik xavfi`,
        action: "Yaqin muddatli lotlarni avval sotishni rejalashtiring.",
        reason: `${riskyKg.toFixed(1)} kg lotning yaroqlilik muddati yaqinlashgan.`,
        forecastKg,
        availableKg,
        createdAt: now.toISOString(),
        status: "pending",
      });
    }

    if (availableGrams > forecastGrams * 1.8 && forecastGrams > 0) {
      recommendations.push({
        id: `RADAR-${product.id}-surplus-${now.toISOString().slice(0, 10)}`,
        productId: product.id,
        productName: product.name,
        type: "surplus",
        risk: "amber",
        title: `${product.name}: ortiqcha zaxira`,
        action: "Yangi kirimni kechiktiring va lotlarni sotish navbatiga joylashtiring.",
        reason: `Mavjud zaxira prognozdan 80% dan ko‘p ortiqcha.`,
        forecastKg,
        availableKg,
        createdAt: now.toISOString(),
        status: "pending",
      });
    }
  }

  return recommendations;
}
