import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { txnId } = await request.json();  // Extracting txnId from the request body

  try {
    // Communicate with PayU to verify the transaction
    const payuResponse = await axios.post("https://secure.payu.in/verify", {
      txnId,
      key: process.env.PAYU_KEY,
      salt: process.env.PAYU_SALT,
    });

    // Process PayU's response
    if (payuResponse.data.status === "success") {
      return NextResponse.json({
        status: "success",
        transactionDetails: payuResponse.data.transaction,
      });
    } else {
      throw new Error("Transaction not found or invalid.");
    }
  } catch (error) {
    console.error("PayU verification error:", error.message);
    return NextResponse.json(
      { status: "error", message: "Verification failed" },
      { status: 400 }
    );
  }
}

export async function GET(request) {
  return NextResponse.json({ message: "GET method not allowed" }, { status: 405 });
}
