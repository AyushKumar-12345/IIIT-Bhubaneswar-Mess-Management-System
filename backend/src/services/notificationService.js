import { Notification } from "../models/Notification.js";
import { ApiError } from "../utils/ApiError.js";

export async function my(userId) {
  return Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(40).lean();
}

export async function markRead({ userId, id }) {
  const n = await Notification.findById(id);
  if (!n) throw new ApiError(404, "Not found");
  if (String(n.user) !== String(userId)) throw new ApiError(403, "Not yours");
  n.readAt = new Date();
  await n.save();
  return n;
}

export async function markAllRead(userId) {
  await Notification.updateMany({ user: userId, readAt: null }, { readAt: new Date() });
}

export async function clearRead(userId) {
  const result = await Notification.deleteMany({ user: userId, readAt: { $ne: null } });
  return { deletedCount: result.deletedCount };
}

export async function clearAll(userId) {
  const result = await Notification.deleteMany({ user: userId });
  return { deletedCount: result.deletedCount };
}

export async function deleteOne({ userId, id }) {
  const n = await Notification.findById(id);
  if (!n) throw new ApiError(404, "Not found");
  if (String(n.user) !== String(userId)) throw new ApiError(403, "Not yours");
  await Notification.deleteOne({ _id: id });
  return { deleted: true };
}
