"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../components/firebase";
import { getAuth } from "firebase/auth";
import Alert from "@/components/Common/CustomAlert";  // Import the Alert component
import expertsData from "@/data/expertsData";

const SuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams(); // Get URL search params

  const [step, setStep] = useState(0);    // 0 = Summary, 1 = Payment Verification, 2 = Create Doc, 3 = Completed
  const [loading, setLoading] = useState(false);   // Indicates document creation
  const [appointmentDetails, setAppointmentDetails] = useState(null); // Appointment details
  const [user, setUser] = useState(null);  // Authenticated user
  const [alert, setAlert] = useState(null); // State for managing alerts


    // Extract query parameters
    const txnid = searchParams.get("txnid");
    const status = searchParams.get("status");
    const amount = searchParams.get("amount");


  useEffect(() => {
    // Fetch appointment details from local storage
    const storedAppointmentDetails = JSON.parse(
      localStorage.getItem("appointmentDetails")
    );
    setAppointmentDetails(storedAppointmentDetails);

    if (!storedAppointmentDetails) {
      // Alert the user if no appointment details are found in local storage
      setAlert({ type: 'danger', message: `Either you've not done the payment or there is a technical error in the backend, If you have done the payemnt. Please contact support@aerocog.tech` });

    } else if (status === "success") {
      // Payment was successful
      toast.success("Payment successful! Proceeding to appointment booking.");
      
    }
    
    setAppointmentDetails(storedAppointmentDetails);

    // Get current authenticated user
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      setUser({
        userEmail: currentUser.email,
        userName: currentUser.displayName,
      });
    } else {
      // Ensure we wait for user authentication
      auth.onAuthStateChanged((user) => {
        if (user) {
          setUser({
            userEmail: user.email,
            userName: user.displayName,
          });
        }
      });
    }
  }, []);


  const handleVerifyAndProceed = async () => {
    setStep(1); // Move to Payment Verification
    setTimeout(() => {
      setStep(2); // Move to Create Doc
      handleCreateDoc(); // Start Firestore document creation
    }, 2000);
  };

  const handleCreateDoc = async () => {
    if (!appointmentDetails || !user) {
      console.error("Missing required data:", { appointmentDetails, user });
      setAlert({ type: 'danger', message: "Error creating appointment. Contact support@aerocog.tech" });
      return;
    }

    setLoading(true);
    const expert = expertsData.find(expert => expert.id === appointmentDetails.expertId);
    if (!expert) {
      setAlert({ type: 'danger', message: "Error fetching expert details. Contact support@aerocog.tech." });
      setLoading(false);
      return;
    }

    const appointmentData = {
      createdAt: new Date().toISOString(),
      date: appointmentDetails.date,
      expertEmail: expert.email,
      expertId: appointmentDetails.expertId,
      expertName: expert.name,
      time: appointmentDetails.time,
      userEmail: user.userEmail,
      userName: user.userName,
      TransactionId: txnid,
      Amount: amount,
      Status: status,
      // whatsappNumber: appointmentDetails.whatsappNumber,
    };

    try {
      const docRef = await addDoc(collection(db, "appointments"), appointmentData);
      setStep(3); // Move to Completed

      // Clear local storage for security reasons (AFTER document creation)
      localStorage.removeItem("appointmentDetails");
      router.push(`/Confirmation?bookingId=${docRef.id}`);
    } catch (error) {
      console.error("Error creating Firestore document:", error);
      setAlert({ type: 'danger', message: "Failed to book appointment. Contact support@aerocog.tech." });
    } finally {
      setLoading(false); // Stop spinner
    }
  };

  return (
    <div className="success-page-wrapper">
      {step === 0 && (
        <div className="text-center">
          <h2 className="text-xl font-bold mb-10 mt-40 underline decoration-sky-500 underline-offset-[3px]">Appointment Summary</h2>
          <div>
            {/* Render the alert if it exists */}
            {alert &&
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />}
          </div>
          {appointmentDetails && (
            <div>
              <p><strong>Expert Name:</strong> Dr. {expertsData.find(expert => expert.id === appointmentDetails.expertId)?.name}</p>
              <br />
              <p><strong>Expert Id: </strong>{expertsData.find(expert => expert.id === appointmentDetails.expertId)?.id}</p>
              <br />
              <p><strong>Appointment Date:</strong> {new Date(appointmentDetails.date).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
              <br />
              <p><strong>Appointment Time:</strong> {appointmentDetails.time}</p>
              <br />
              <p><strong>Mobile Number:</strong> {appointmentDetails.whatsappNumber}</p>
              <hr />
              <h3> Transaction Details</h3>
              <br />
              <p><strong>Transaction Id:</strong> {txnid}</p>
              <br />
              <p><strong>Amount:</strong>₹ {amount}</p>
              <br />
              <p><strong>Status:</strong> {status}</p>

            </div>
          )}
          <button
            onClick={handleVerifyAndProceed}
            className="mt-4 mb-12 px-6 py-2 bg-blue-500 text-white rounded hover:bg-sky-700 ..."
          >
            Verify and Proceed
          </button>
        </div>
      )}

      {step > 0 && (
        <div className="mt-36 mb-28" style={{ justifyItems: 'center' }}>
          <h2 className="text-center text-xl font-bold mt-4 mb-8">
            {step === 3 ? "Appointment Booked!" : "Processing Your Appointment"}
          </h2>

          {/* Render the alert if it exists */}
          {alert &&
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />}
            <br />

          {/* Timeline Stepper */}

          <ol className="relative text-gray-500 border-s border-gray-200 dark:border-gray-700 dark:text-gray-400">
            {/* Step 1: Payment Verification */}
            <li className="mb-10 ms-6">
              <span
                className={`absolute flex items-center justify-center w-8 h-8 ${step >= 1 ? "bg-green-200" : "bg-gray-100"
                  } rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 ${step >= 1 ? "dark:bg-green-900" : "dark:bg-gray-700"
                  }`}
              >
                {step >= 1 ? (
                  <svg
                    className="w-3.5 h-3.5 text-green-500 dark:text-green-400"
                    aria-hidden="true"
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
                  <span className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400">1</span>
                )}
              </span>
              <h3 className={`font-medium leading-tight ${step >= 1 ? "text-green-500" : "text-gray-500"}`}>
                Verifying Payment
              </h3>
            </li>

            {/* Step 2: Create Document */}
            <li className="mb-10 ms-6">
              <span
                className={`absolute flex items-center justify-center w-8 h-8 ${step >= 2 ? "bg-green-200" : "bg-gray-100"
                  } rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 ${step >= 2 ? "dark:bg-green-900" : "dark:bg-gray-700"
                  }`}
              >
                {step >= 2 ? (
                  <svg
                    className="w-3.5 h-3.5 text-green-500 dark:text-green-400"
                    aria-hidden="true"
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
                  <span className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400">2</span>
                )}
              </span>
              <h3 className={`font-medium leading-tight ${step >= 2 ? "text-green-500" : "text-gray-500"}`}>
                Booking Your Appointment
              </h3>
            </li>

            {/* Step 3: Confirmation */}
            <li className="ms-6">
              <span
                className={`absolute flex items-center justify-center w-8 h-8 ${step === 3 ? "bg-green-200" : "bg-gray-100"
                  } rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 ${step === 3 ? "dark:bg-green-900" : "dark:bg-gray-700"
                  }`}
              >
                {step === 3 ? (
                  <svg
                    className="w-3.5 h-3.5 text-green-500 dark:text-green-400"
                    aria-hidden="true"
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
                  <span className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400">3</span>
                )}
              </span>
              <h3 className={`font-medium leading-tight ${step === 3 ? "text-green-500" : "text-gray-500"}`}>
                Confirmation
              </h3>
              <p className={`text-sm ${step === 3 ? "text-green-500" : "text-gray-500"}`}>
                Your appointment has been booked.
              </p>
            </li>
          </ol>


        </div>
      )}
    </div>
  );
};

export default SuccessPage;
