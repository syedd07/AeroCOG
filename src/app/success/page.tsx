"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/compat/router";
import axios from "axios";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../components/firebase";

const SuccessPage = () => {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [transactionData, setTransactionData] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      //const params = new URLSearchParams(window.location.search);
      const { mihpayid } = router.query;

      if (!mihpayid) {
        alert("Transaction ID not found. Please contact support@aerocog.tech");
        router.push("/experts");
        return;
      }

      try {
        setStep(1); // Payment Initiated
        const response = await axios.post("/api/payu/verify", { mihpayid });

        if (response.data.status === "success") {
          const { transactionDetails } = response.data;
          setTransactionData(transactionDetails);
          setStep(2); // Payment Verified

          // Prepare Firestore document
          const appointment = {
            createdAt: new Date().toISOString(),
            date: transactionDetails.date,
            expertId: transactionDetails.expertId,
            expertEmail: transactionDetails.expertEmail,
            expertName: transactionDetails.expertName,
            userEmail: transactionDetails.userEmail,
            userName: transactionDetails.userName,
            time: transactionDetails.time,
            whatsappNumber: transactionDetails.whatsappNumber,
            amount: transactionDetails.amount,
            status: "Paid",
          };

          await addDoc(collection(db, "appointments"), appointment);

          setStep(3); // Booking Confirmed
        } else {
          throw new Error("Transaction verification failed");
        }
      } catch (error) {
        console.error("Error verifying payment:", error.message);
        alert("Payment verification failed. Please contact support@aerocog.tech");
        router.push("/experts");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [router]);
 
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" />
        <p className="ml-4">Verifying payment status, please wait...</p>
      </div>
    );
  }

  return (
    <div className="success-page-wrapper">
      <h2 className="text-center text-xl font-bold mt-4">Transaction Successful</h2>
      {transactionData && (
        <div className="mt-4 text-center">
          <p>
            <strong>Transaction ID:</strong> {transactionData.txnId}
          </p>
          <p>
            <strong>Date:</strong> {transactionData.date}
          </p>
          <p>
            <strong>Amount:</strong> ₹{transactionData.amount}
          </p>
        </div>
      )}

      <div style={{ marginTop: "200px", marginBottom: "150px", justifyItems: "center", justifyContent: "center" }}>
        <ol className="relative text-gray-500 border-l border-gray-200 dark:border-gray-700 dark:text-gray-400 mt-8">
          <li className={`mb-10 ml-6 ${step >= 1 ? "text-green-600" : ""}`}>
            <span
              className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-4 ring-white ${
                step >= 1 ? "bg-green-200 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              {step >= 1 ? (
                <svg
                  className="w-3.5 h-3.5 text-green-500 dark:text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 16 12"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 5.917 5.724 10.5 15 1.5"
                  />
                </svg>
              ) : (
                <span className="w-3.5 h-3.5 text-gray-500">1</span>
              )}
            </span>
            <h3 className="font-medium leading-tight">Payment Initiated</h3>
            <p className="text-sm">We are verifying your payment.</p>
          </li>

          <li className={`mb-10 ml-6 ${step >= 2 ? "text-green-600" : ""}`}>
            <span
              className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-4 ring-white ${
                step >= 2 ? "bg-green-200 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              {step >= 2 ? (
                <svg
                  className="w-3.5 h-3.5 text-green-500 dark:text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 16 12"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 5.917 5.724 10.5 15 1.5"
                  />
                </svg>
              ) : (
                <span className="w-3.5 h-3.5 text-gray-500">2</span>
              )}
            </span>
            <h3 className="font-medium leading-tight">Payment Verified</h3>
            <p className="text-sm">Your payment was successful.</p>
          </li>

          <li className={`ml-6 ${step >= 3 ? "text-green-600" : ""}`}>
            <span
              className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-4 ring-white ${
                step >= 3 ? "bg-green-200 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              {step >= 3 ? (
                <svg
                  className="w-3.5 h-3.5 text-green-500 dark:text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 16 12"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 5.917 5.724 10.5 15 1.5"
                  />
                </svg>
              ) : (
                <span className="w-3.5 h-3.5 text-gray-500">3</span>
              )}
            </span>
            <h3 className="font-medium leading-tight">Booking Confirmed</h3>
            <p className="text-sm">Your appointment is booked.</p>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default SuccessPage;
