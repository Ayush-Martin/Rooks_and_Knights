import crypto from "crypto";

// Helper function to verify payment
export const verifyPayment = (
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  secret
) => {
  const generated_signature = crypto
    .createHmac("sha256", secret)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  return generated_signature === razorpay_signature;
};
