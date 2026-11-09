import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as paymentService from "../services/paymentService.js";

export async function pay(req, res, next) {
  try {
    const payment = await paymentService.payDirect({
      userId: req.user._id,
      amount: req.body.amount,
      method: req.body.method
    });
    sendSuccess(res, { statusCode: 201, message: "Payment successful", data: { payment } });
  } catch (err) { next(err); }
}

export async function initiate(req, res, next) {
  try {
    const { amount, method } = req.body;
    const payment = await paymentService.initiatePayment({
      userId: req.user._id,
      amount,
      method
    });
    sendSuccess(res, { statusCode: 201, message: "Payment initiated", data: { payment } });
  } catch (err) { next(err); }
}

export async function my(req, res, next) {
  try {
    const payments = await paymentService.myPayments(req.user._id);
    sendSuccess(res, { data: { payments } });
  } catch (err) { next(err); }
}

export async function all(req, res, next) {
  try {
    const result = await paymentService.allPayments(req.query);
    sendSuccess(res, { data: result });
  } catch (err) { next(err); }
}
