import crypto from "crypto";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const body = await req.formData();
    const data = Object.fromEntries(body);

    const { txnid, amount, status, productinfo, firstname, email, hash } = data;

    // Validate the hash
    const salt = process.env.PAYU_SALT;
    const key = process.env.PAYU_KEY;

    // Correctly build the hash string
    const hashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const calculatedHash = crypto
      .createHash("sha512")
      .update(hashString)
      .digest("hex");

    console.log("Calculated Hash:", calculatedHash);
    console.log("Received Hash:", data.hash);

    // Validate the hash
    if (calculatedHash !== hash) {
      return NextResponse.json(
        { error: "Hash validation failed" },
        { status: 400 }
      );
    }

    // Perform actions based on status
    if (status === "success") {
      console.log("Payment success:", txnid);
      // Redirect to the success page with query parameters
      return NextResponse.redirect(
        `https://aerocog.tech/success?txnid=${txnid}&status=${status}&amount=${amount}`
      );
    } else {
      console.log("Payment failed:", txnid);
      // Redirect to the failure page
      return NextResponse.redirect(
        `https://aerocog.tech/failure?txnid=${txnid}&status=failed`
      );
    }
  } catch (error) {
    console.error("Error in PayU callback:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
