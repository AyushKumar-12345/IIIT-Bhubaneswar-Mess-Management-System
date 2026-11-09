import crypto from "node:crypto";

// Mock payment provider.
// Instantly "succeeds" so the flow can be tested end-to-end without
// real payment gateway credentials.
export function charge({ amount, userId, billId }) {
  if (amount <= 0) throw new Error("Amount must be positive");
  return {
    provider: "mock",
    providerRef: "MOCK_" + Date.now() + "_" + crypto.randomBytes(6).toString("hex"),
    status: "success",
    paidAt: new Date(),
    metadata: { userId: String(userId), billId: String(billId) }
  };
}