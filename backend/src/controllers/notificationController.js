import { sendSuccess } from "../utils/apiResponse.js";
import * as s from "../services/notificationService.js";

export async function my(req, res, next) {
  try {
    const items = await s.my(req.user._id);
    sendSuccess(res, { data: { notifications: items } });
  } catch (e) { next(e); }
}

export async function markRead(req, res, next) {
  try {
    await s.markRead({ userId: req.user._id, id: req.params.id });
    sendSuccess(res, { message: "Marked as read" });
  } catch (e) { next(e); }
}

export async function markAllRead(req, res, next) {
  try {
    await s.markAllRead(req.user._id);
    sendSuccess(res, { message: "All notifications marked as read" });
  } catch (e) { next(e); }
}

export async function clearRead(req, res, next) {
  try {
    const result = await s.clearRead(req.user._id);
    sendSuccess(res, { message: "Cleared read notifications", data: result });
  } catch (e) { next(e); }
}

export async function clearAll(req, res, next) {
  try {
    const result = await s.clearAll(req.user._id);
    sendSuccess(res, { message: "All notifications cleared", data: result });
  } catch (e) { next(e); }
}

export async function deleteOne(req, res, next) {
  try {
    await s.deleteOne({ userId: req.user._id, id: req.params.id });
    sendSuccess(res, { message: "Notification deleted" });
  } catch (e) { next(e); }
}
