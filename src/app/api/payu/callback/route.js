import crypto from "crypto";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const body = await req.formData();
    const data = Object.fromEntries(body);

    // Log the received data to debug the fields
    console.log("Received Data:", data);

    const { txnid, amount, status, productinfo, firstname, email, hash } = data;

    // Define the PayU Merchant Credentials (ensure these are correct)
    const salt = process.env.PAYU_SALT;
    const key = process.env.PAYU_KEY;

    // Construct the string for hash generation
    const hashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    
    console.log("Hash String for Validation:", hashString);

    // Generate the calculated hash
    const calculatedHash = crypto.createHash("sha512").update(hashString).digest("hex");

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
      return NextResponse.json({ error: "Hash validation failed" }, { status: 400 });
    }

    // Perform actions based on the status
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
