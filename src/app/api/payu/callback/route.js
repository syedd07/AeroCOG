import crypto from "crypto";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const body = await req.formData();
    const data = Object.fromEntries(body);

    // Log the received data to debug the fields
    console.log("Received Data:", data);

    const {
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      status,
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
      udf6,
      udf7,
      udf8,
      udf9,
      udf10,
    } = data;

    // Define the PayU Merchant Credentials (ensure these are correct)
    const salt = process.env.PAYU_SALT;
    const key = process.env.PAYU_KEY;

// Construct the hash string as per PayU guidelines (without additionalCharges)
const hashSequence = [
  salt,
  status,
  udf10 || '',
  udf9 || '',
  udf8 || '',
  udf7 || '',
  udf6 || '',
  udf5 || '',
  udf4 || '',
  udf3 || '',
  udf2 || '',
  udf1 || '',
  email || '',
  firstname || '',
  productinfo || '',
  amount || '',
  txnid || '',
  key,
];

const hashString = hashSequence.join('|');

// Generate the calculated hash
const calculatedHash = crypto
  .createHash('sha512')
  .update(hashString)
  .digest('hex');

    // Log the calculated and received hash values
    console.log("Calculated Hash:", calculatedHash);
    console.log("Received Hash:", hash);
    console.log("Expected vs Received Data:", {
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      status,
    });

    // Compare the calculated hash with the received hash
    if (calculatedHash !== hash) {
      console.log("Hash validation failed");
      return NextResponse.json(
        { error: "Hash validation failed" },
        { status: 400 },
      );
    }

    // Perform actions based on the status
    if (status === "success") {
      console.log("Payment success:", txnid);
      // Redirect to the success page with query parameters
      return NextResponse.redirect(
        `https://aerocog.tech/success?txnid=${txnid}&status=${status}&amount=${amount}`,
      );
    } else {
      console.log("Payment failed:", txnid);
      // Redirect to the failure page
      return NextResponse.redirect(
        `https://aerocog.tech/failure?txnid=${txnid}&status=failed`,
      );
    }
  } catch (error) {
    console.error("Error in PayU callback:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
