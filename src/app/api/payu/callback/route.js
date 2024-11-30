import crypto from "crypto";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    // Parse the incoming form data (PayU sends data as form-urlencoded)
    const body = await req.formData();
    const data = Object.fromEntries(body);

    const {
      txnid,
      amount,
      status,
      key,
      productinfo,
      firstname,
      email,
      hash,
    } = data;

    // Validate the hash using your PayU salt
    const salt = process.env.PAYU_SALT;
    const hashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const calculatedHash = crypto.createHash("sha512").update(hashString).digest("hex");

    if (calculatedHash !== hash) {
      return NextResponse.json({ error: "Hash validation failed" }, { status: 400 });
    }

    // Perform actions based on the status
    if (status === "success") {
      console.log("Payment success:", txnid);
      // Update your database with successful payment
    } else {
      console.log("Payment failed:", txnid);
      // Handle failure logic here
    }

    return NextResponse.json({ message: "Callback processed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in PayU callback:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
