import axios from "axios";

export async function POST(req) {
  try {
    const { mihpayid } = await req.json();

    if (!mihpayid) {
      return new Response(JSON.stringify({ status: "error", message: "Missing mihpayid" }), {
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
        headers: { "Content-Type": "application/json" },
        timeout: 20000, // 20-second timeout
      }
    );

    if (!tokenResponse?.data?.access_token) {
      console.error("Token generation failed:", tokenResponse.data);
      return new Response(
        JSON.stringify({ status: "error", message: "Token generation failed" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const accessToken = tokenResponse.data.access_token;

    // Step 2: Verify the Transaction with the Generated Token
    const verifyResponse = await axios.post(
      "https://secure.payu.in/verify",
      { mihpayid }, // Use mihpayid for verification
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    if (verifyResponse?.data?.status === "success") {
      return new Response(
        JSON.stringify({
          status: "success",
          transactionDetails: verifyResponse.data.transaction,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      console.error("PayU verification failed:", 
        verifyResponse?.data?.message || "Unknown error"
      );
      return new Response(
        JSON.stringify({
           status: "error",
            message: "Verification failed" 
          }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("PayU API error:", error.response?.data || error.message);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "An unexpected error occurred" 
      }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
