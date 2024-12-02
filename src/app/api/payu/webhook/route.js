import axios from "axios";

export async function POST(req) {
  try {
    const data = await req.json(); // PayU sends the transaction data as JSON

    // Log the incoming data for debugging
    console.log("Webhook Data:", data);

    // Extract the required fields from PayU response
    const { mihpayid, txnid, status, amount, email, phone } = data;

    // Check if the payment status is "success"
    if (status === "success") {
      // Process the successful payment (e.g., store it in Firestore, etc.)
      // Retrieve appointment details from Firestore using txnid
      const appointmentRef = db.collection("appointments").doc(txnid); // Use txnid to locate the correct appointment
      await appointmentRef.update({
        paymentStatus: "Success", // Mark the payment as successful
        amountPaid: amount, // Store the amount paid
        mihpayid: mihpayid, // Store PayU's transaction ID
      });

      console.log("Payment successful:", txnid, amount, email);

      // Step 1: Redirect to the success page with mihpayid as a query parameter
      const successUrl = `https://aerocog.tech/success?mihpayid=${mihpayid}`;

      // Step 2: Redirect the user to the success page with the mihpayid
      return new Response(
        JSON.stringify({ status: "success", message: "Payment successful", redirectUrl: successUrl }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      // If payment failed, update the status in Firestore
      const appointmentRef = db.collection("appointments").doc(txnid); // Locate the appointment with txnid
      await appointmentRef.update({
        paymentStatus: "Failed", // Mark the payment as failed
      });

      console.error("Payment failed or other status:", data);

      // Return an error response for failure
      return new Response(
        JSON.stringify({ status: "error", message: "Payment failed" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    // Catch any errors during the webhook processing
    console.error("Error in webhook handling:", error);

    // Return an error response for unexpected issues
    return new Response(
      JSON.stringify({
        status: "error",
        message: "An unexpected error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
