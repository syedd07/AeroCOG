import crypto from 'crypto';
import { NextResponse } from 'next/server';

export const POST = async (req) => {
  try {
    let body;

    // Parse the JSON body
    try {
      body = await req.json();
    } catch (error) {
      console.error("Invalid JSON input:", error);
      return NextResponse.json({ error: "Invalid JSON input" }, { status: 400 });
    }

    const { firstname, email, amount, productinfo, txnid, phone } = body;

    // Validate required fields
    if (!firstname || !email || !amount || !productinfo || !txnid) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Define PayU Merchant Credentials
    const key = process.env.PAYU_KEY;
    const salt = process.env.PAYU_SALT;

    // Prepare the payload
    const payload = {
      key,               // Merchant Key
      txnid,             // Transaction ID (Unique for every transaction)
      amount,            // Transaction Amount
      productinfo,       // Product Description
      firstname,         // Customer's First Name
      email,             // Customer's Email
      udf1: body.udf1 || "",
      udf2: body.udf2 || "",
      udf3: body.udf3 || "",
      udf4: body.udf4 || "",
      udf5: body.udf5 || "",
      udf6: body.udf6 || "",
      udf7: body.udf7 || "",
      udf8: body.udf8 || "",
      udf9: body.udf9 || "",
      udf10: body.udf10 || "",
      phone,             // Customer's Phone (optional)
      service_provider: "payu_paisa", // Service Provider
      surl: "https://aerocog.tech/api/payu/callback", // Success URL
      furl: "https://aerocog.tech/api/payu/callback", // Failure URL
      curl: "https://aerocog.tech/api/payu/callback", // Cancel URL
    };

    // Construct the string for hash generation
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|${salt}`;
    
    // Generate the hash using SHA-512
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');
    payload.hash = hash;
    

    // Return the payload for client-side submission to PayU
    return NextResponse.json({ payload }, { status: 200 });
  } catch (error) {
    console.error("Error in /payu/initiate:", error);
    return NextResponse.json({ error: "Internal Server Error contact support@aerocog.tech" }, { status: 500 });
    
  }
};
