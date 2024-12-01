import axios from "axios";

export async function POST(req) {
  const { txnId } = await req.json();

  if (!txnId) {
    return new Response(JSON.stringify({ status: "error", message: "Missing txnId" }), { status: 400 });
  }

  try {
    const payuResponse = await axios.post(
      "https://secure.payu.in/verify",
      { txnId },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYU_AUTH_TOKEN}`,
        },
      }
    );

    if (payuResponse.data.status === "success") {
      return new Response(JSON.stringify({ status: "success", transactionDetails: payuResponse.data.transaction }), {
        status: 200,
      });
    } else {
      throw new Error(payuResponse.data.message || "Verification failed.");
    }
  } catch (error) {
    console.error("PayU verification error:", error.response?.data || error.message);
    return new Response(JSON.stringify({ status: "error", message: "Verification failed" }), { status: 400 });
  }
}
