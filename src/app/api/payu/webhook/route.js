import { json } from "express"; 

export async function POST(req) {
  try {
    const data = await req.json(); // Parse incoming JSON data from PayU
    console.log("Webhook Data:", data); // Log for debugging

    const { mihpayid, txnid, status, amount, email, phone } = data;

    // Check payment status
    if (status === "success") {
      console.log("Payment successful:", txnid, mihpayid);

      // Redirect to the `/success` page with parameters in the query string
      const successUrl = `https://aerocog.tech/success?status=success&mihpayid=${mihpayid}&txnid=${txnid}&amount=${amount}`;

      return new Response(
        JSON.stringify({
          status: "success",
          message: "Payment processed successfully",
          redirectUrl: successUrl,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      console.error("Payment failed for transaction:", txnid);

      // Redirect to failure page with parameters
      const failureUrl = `https://aerocog.tech/success?status=failed&txnid=${txnid}`;

      return new Response(
        JSON.stringify({
          status: "error",
          message: "Payment failed",
          redirectUrl: failureUrl,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error processing webhook:", error);

    return new Response(
      JSON.stringify({
        status: "error",
        message: "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
