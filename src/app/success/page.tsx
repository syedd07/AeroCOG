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
    const paymentStatus = params.get("status"); // This will come from PayU
    const transactionId = params.get("txnid"); // PayU's transaction ID

    // Retrieve the appointment data from the query params (sent from the Checkout page)
    const expertId = params.get("expertId");
    const userName = params.get("userName");
    const userEmail = params.get("userEmail");
    const whatsappNumber = params.get("whatsappNumber");
    const dateString = params.get("date");
    const time = params.get("time");


    if (paymentStatus === "success") {
      const appointment = {
        expertId,
        expertName: "Expert Name", // This would come from your expert data
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
      alert("Payment failed or was cancelled. contact support@aerocog.tech");
      router.push("/experts");
    }
  }, [router]);

  return (
    <div className="success-page-wrapper">
      <h2>Payment Success</h2>
      <p>Your payment was successful. Please check your booking details.</p>
    </div>
  );
};

export default SuccessPage;
