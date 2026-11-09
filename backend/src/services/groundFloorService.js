import { SemesterEnrollment } from "../models/SemesterEnrollment.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import { SystemSetting } from "../models/SystemSetting.js";
import { ApiError } from "../utils/ApiError.js";
import * as provider from "./paymentProvider.js";

const ALL_MEALS = ["breakfast", "lunch", "snacks", "dinner"];
const DEFAULT_FEE = 25000;
const DEFAULT_DAYS = 120;

async function getSetting(key, fallback) {
  const s = await SystemSetting.findOne({ key });
  return s ? s.value : fallback;
}

function defaultRange() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + DEFAULT_DAYS);
  return { start, end };
}

export function calculateSemesterFee(baseFee, mealCount) {
  const count = Number(mealCount) || 3;
  if (count >= 4) {
    return baseFee === 25000 ? 30000 : Math.round(baseFee * 1.2);
  }
  return baseFee;
}

export async function getInfo(userId) {
  const feeSetting = await getSetting("groundFloor.fee", DEFAULT_FEE);
  const fee = Number(feeSetting) || DEFAULT_FEE;
  const pricing = await getSetting("billing.perMealPrice", { breakfast: 40, lunch: 80, snacks: 30, dinner: 90 });

  const startSetting = await getSetting("semester.startDate", null);
  const endSetting = await getSetting("semester.endDate", null);
  const def = defaultRange();

  const start = startSetting ? new Date(startSetting) : def.start;
  const end = endSetting ? new Date(endSetting) : def.end;
  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(23, 59, 59, 0);

  // Populate payment so receipt shows method + reference
  const existing = await SemesterEnrollment.findOne({ user: userId, status: "active" })
    .populate("paymentId")
    .lean();

  return {
    fee,
    fee3Meals: fee,
    fee4Meals: calculateSemesterFee(fee, 4),
    perMealPrice: pricing,
    meals: ALL_MEALS,
    minMeals: 3,
    maxMeals: 4,
    semesterStart: start,
    semesterEnd: end,
    totalDays: Math.ceil((end - start) / 86400000),
    enrollment: existing
  };
}

export async function enroll({ userId, meals, method = "upi", provider: customProvider, providerRef: customRef }) {
  if (!Array.isArray(meals) || meals.length < 3) {
    throw new ApiError(400, "Choose at least 3 meals");
  }
  const cleaned = [...new Set(meals)].filter((m) => ALL_MEALS.includes(m));
  if (cleaned.length < 3 || cleaned.length > 4) {
    throw new ApiError(400, "Choose 3 or 4 valid meals");
  }

  const existing = await SemesterEnrollment.findOne({ user: userId, status: "active" });
  if (existing) {
    // Supersede previous active enrollment so student can re-configure or upgrade plan
    existing.status = "superseded";
    await existing.save();
  }

  const info = await getInfo(userId);
  const calculatedFee = calculateSemesterFee(info.fee, cleaned.length);

  const charge = customRef
    ? {
        provider: customProvider || "upi",
        providerRef: customRef,
        status: "success",
        paidAt: new Date()
      }
    : provider.charge({ amount: calculatedFee, userId, billId: null });

  const payment = await Payment.create({
    user: userId,
    amount: calculatedFee,
    method,
    provider: charge.provider,
    providerRef: charge.providerRef,
    status: charge.status,
    paidAt: charge.paidAt,
    metadata: { type: "ground_floor_semester", meals: cleaned }
  });

  const enrollment = await SemesterEnrollment.create({
    user: userId,
    meals: cleaned,
    amount: calculatedFee,
    semesterStart: info.semesterStart,
    semesterEnd: info.semesterEnd,
    paidAt: charge.paidAt,
    paymentId: payment._id,
    status: "active"
  });

  await User.updateOne(
    { _id: userId },
    { messSystem: "ground_floor", activeSemesterEnrollment: enrollment._id }
  );

  // Populate payment for response
  const fullEnrollment = await SemesterEnrollment.findById(enrollment._id)
    .populate("paymentId")
    .lean();

  return { enrollment: fullEnrollment, payment };
}

export async function myEnrollment(userId) {
  return SemesterEnrollment.findOne({ user: userId, status: "active" })
    .populate("paymentId")
    .lean();
}