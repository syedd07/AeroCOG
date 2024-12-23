import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());
    
    const {
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      status,
      hash,
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
      udf11
    } = data;

    // Define the PayU Merchant Credentials (ensure these are correct)
    const salt = process.env.PAYU_SALT;
    const key = process.env.PAYU_KEY;
    console.log("Received Data:", data);
    // Construct the hash string as per PayU guidelines (without additionalCharges)
    const hashSequence = [
      salt,
      status,
      udf11 || "",
      udf10 || "",
      udf9 || "",
      udf8 || "",
      udf7 || "",
      udf6 || "",
      udf5 || "",
      udf4 || "",
      udf3 || "",
      udf2 || "",
      udf1 || "",
      email || "",
      firstname || "",
      productinfo || "",
      amount || "",
      txnid || "",
      key,
    ].join("|");

    // const hashString = hashSequence.join("|");

    // Generate the calculated hash
    const calculatedHash = crypto
      .createHash("sha512")
      .update(hashSequence)
      .digest("hex");

    // Log the calculated and received hash values
    console.log("Calculated Hash:", calculatedHash);
    console.log("Received Hash:", hash);
    
    // Validate the hash
    if (calculatedHash === hash) {
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
    } else {
      console.error("Hash validation failed");
      // You can choose to redirect to an error page or handle it accordingly
      return NextResponse.redirect(
        `https://aerocog.tech/failure?txnid=${txnid}&status=hash_failed`,
      );
    }
  } catch (error) {
    console.error("Error in PayU callback:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
