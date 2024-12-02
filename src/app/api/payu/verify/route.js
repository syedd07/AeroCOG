import axios from "axios";

export async function POST(req) {
  try {
    const { txnId } = await req.json();

    if (!txnId) {
      return new Response(JSON.stringify({ status: "error", message: "Missing txnId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 1: Generate the PayU Token
    const tokenResponse = await axios.post(
      "https://secure.payu.in/auth/token",
      {
        grant_type: "client_credentials",
        client_id: process.env.PAYU_KEY, // Merchant Key
        client_secret: process.env.PAYU_SALT, // Merchant Salt
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000, // Optional: 10-second timeout
      }
    );

    if (!tokenResponse.data || !tokenResponse.data.access_token) {
      console.error("Error generating PayU token:", tokenResponse.data);
      return new Response(JSON.stringify({ status: "error", message: "Token generation failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const accessToken = tokenResponse.data.access_token;

    // Step 2: Verify the Transaction with the Generated Token
    const verifyResponse = await axios.post(
      "https://secure.payu.in/verify",
      { txnId },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    if (verifyResponse.data && verifyResponse.data.status === "success") {
      return new Response(
        JSON.stringify({ status: "success", transactionDetails: verifyResponse.data.transaction }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      console.error("PayU verification failed:", verifyResponse.data.message || "Unknown error");
      return new Response(JSON.stringify({ status: "error", message: "Verification failed" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("PayU API error:", error.response?.data || error.message);
    return new Response(JSON.stringify({ status: "error", message: "An unexpected error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
