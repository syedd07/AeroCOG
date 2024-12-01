"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../components/firebase";

const SuccessPage = () => {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    console.log("Params received on success page:", Object.fromEntries(params.entries()));
    
    // Extracting PayU's payment status and transaction ID
    const paymentStatus = params.get("status"); // This will come from PayU
    const transactionId = params.get("txnid"); // PayU's transaction ID

    // Retrieve the appointment data from the query params
    const expertId = params.get("expertId");
    const expertName = params.get("expertName");
    const userName = params.get("userName");
    const userEmail = params.get("userEmail");
    const whatsappNumber = params.get("whatsappNumber");
    const dateString = params.get("date");
    const time = params.get("time");

    // Validate the headers (origin validation, optional)
    const allowedOrigins = [
      "https://aerocog.tech",
      "https://secure.payu.in" // Allow PayU's origin
    ];
    const origin = window.location.origin;
    const forwardedHost = window.location.host;

    if (!allowedOrigins.includes(origin) && forwardedHost !== "aerocog.tech") {
      console.error("Invalid origin or forwarded host", { origin, forwardedHost });
      alert("Unauthorized access. Please contact support@aerocog.tech");
     // router.push("/experts");
      return;
    }

    // Only proceed if the payment status is successful
    if (paymentStatus === "success") {
      const appointment = {
        expertId,
        expertName, 
        userName,
        userEmail,
        whatsappNumber,
        date: dateString,
        time,
        createdAt: new Date().toISOString(),
      };

      // If payment is successful, create the appointment document
      addDoc(collection(db, "appointments"), appointment)
        .then((docRef) => {
          // Successfully added the document
          alert("Appointment successfully booked!");
          // Redirect to the confirmation page with the booking ID
          router.push(`/confirmation?bookingId=${docRef.id}`);
        })
        .catch((error) => {
          console.error("Error adding document: ", error.message);
          alert("There was an error with the booking. Please contact support@aerocog.tech");
        });
    } else {
      // If payment is not successful, redirect or show error
      alert("Payment failed or was cancelled. Please contact support@aerocog.tech");
      //router.push("/experts");
    }
  }, [router]);

  return (
    <div className="success-page-wrapper" style={{ marginTop: '200px', marginBottom: '200px', textAlign: 'center' }}>
      <h2 >Payment Success</h2>
      <p>Your payment was successful. Please check your booking details.</p>
    </div>
  );
};

export default SuccessPage;
