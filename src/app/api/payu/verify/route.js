import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { txnId } = req.body;

    try {
      // Communicate with PayU to verify the transaction
      const payuResponse = await axios.post("https://secure.payu.in/verify", {
        txnId,
        key: process.env.PAYU_KEY,
        salt: process.env.PAYU_SALT,
      });

      // Process PayU's response
      if (payuResponse.data.status === "success") {
        res.status(200).json({
          status: "success",
          transactionDetails: payuResponse.data.transaction,
        });
      } else {
        throw new Error("Transaction not found or invalid.");
      }
    } catch (error) {
      console.error("PayU verification error:", error.message);
      res.status(400).json({ status: "error", message: "Verification failed" });
    }
  } else {
    res.status(405).send({ message: "Only POST requests allowed" });
  }
}
