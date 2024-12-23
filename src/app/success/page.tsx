"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../components/firebase";
import { getAuth } from "firebase/auth";
import Alert from "@/components/Common/CustomAlert";  // Import the Alert component
import expertsData from "@/data/expertsData";
import { toast } from "react-hot-toast";

const SuccessPage = () => {
  const router = useRouter();

  const [step, setStep] = useState(0);    // 0 = Summary, 1 = Payment Verification, 2 = Create Doc, 3 = Completed
  const [loading, setLoading] = useState(false);   // Indicates document creation
  const [appointmentDetails, setAppointmentDetails] = useState(null); // Appointment details
  const [user, setUser] = useState(null);  // Authenticated user
  const [alert, setAlert] = useState(null); // State for managing alerts


  // State variables for query parameters
  const [txnid, setTxnid] = useState("");
  const [status, setStatus] = useState("");
  const [amount, setAmount] = useState("");


  useEffect(() => {
    // Parse query parameters from the URL
    const params = new URLSearchParams(window.location.search);
    const txnidParam = params.get("txnid");
    const statusParam = params.get("status");
    const amountParam = params.get("amount");

    setTxnid(txnidParam || "");
    setStatus(statusParam || "");
    setAmount(amountParam || "");


    // Fetch appointment details from local storage
    const storedAppointmentDetails = JSON.parse(
      localStorage.getItem("appointmentDetails")
    );
    setAppointmentDetails(storedAppointmentDetails);

    if (!storedAppointmentDetails) {
      // Alert the user if no appointment details are found in local storage
      setAlert({
        type: 'danger',
        message: `Either you've not completed the payment or there was a technical error. If you have made the payment, please contact support@aerocog.tech.`,
      });
      toast.error("Something went wrong! Please contact support@aerocog.tech immediately.");
      // Hide the "Verify and Proceed" button by setting step to -1
      setStep(-1);
    } else if (status === "success") {
      // Payment was successful
      toast.success("Payment successful! Proceeding to appointment booking.");
    }

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
      toast.error("Error creating appointment. Contact support@aerocog.tech");
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
      toast.success(`Appointment booked successfully! ${docRef.id}`);
    } catch (error) {
      console.error("Error creating Firestore document:", error);
      setAlert({ type: 'danger', message: "Failed to book appointment. Contact support@aerocog.tech." });
    } finally {
      setLoading(false); // Stop spinner
    }
  };

  return (
    <div className="text-center">
      
      {alert &&
      <div className="flex items-center justify-center min-h-screen">
        <Alert type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)} // Close the alert
        />
        </div>
        }
        
        {step === 0 && (
        <div className="text-center">
          <h2 className="text-xl font-bold mb-10 mt-40 underline decoration-sky-500 underline-offset-[3px]">Appointment Summary</h2>
          {/* Render appointment details */}
          {appointmentDetails && (
            <div>
              <p className="mb-4 text-gray-500 dark:text-gray-400"><strong>Expert Name:</strong> Dr. {expertsData.find(expert => expert.id === appointmentDetails.expertId)?.name}</p>
              <p className="mb-4 text-gray-500 dark:text-gray-400"><strong>Expert Id: </strong>{expertsData.find(expert => expert.id === appointmentDetails.expertId)?.id}</p>
              <p className="mb-4 text-gray-500 dark:text-gray-400"><strong>Appointment Date:</strong> {new Date(appointmentDetails.date).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
              <p className="mb-4 text-gray-500 dark:text-gray-400"><strong>Appointment Time:</strong> {appointmentDetails.time}</p>
              <p className="mb-4 text-gray-500 dark:text-gray-400"><strong>Mobile Number:</strong> {appointmentDetails.whatsappNumber}</p>
              
              <div className="inline-flex items-center justify-center w-full">
                <hr className="w-64 h-px my-8 bg-gray-800 border-0 dark:bg-gray-300" />
                <span className="absolute px-3 font-strong text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-900 ">Transaction Details</span>
              </div>
              <p className="mb-4 text-gray-500 dark:text-gray-400"><strong>Transaction Id:</strong> {txnid}</p>
              <p className="mb-4 text-gray-500 dark:text-gray-400"><strong>Appointment Fee: </strong>₹ {amount}</p>
              <p className="mb-4 text-gray-500 dark:text-gray-400"><strong>Payment Status:</strong> {status}</p>
              </div>

          )}
          {step >= 0 && (
            <button
              onClick={handleVerifyAndProceed}
              className="mt-4 mb-12 px-6 py-2 bg-blue-500 text-white rounded hover:bg-sky-700 ..."
            >
              Verify and Proceed
            </button>
          )}
        </div>
      )}

      {step > 0 && (
        <div className="mt-36 mb-28" style={{ justifyItems: 'center' }}>
          <h2 className="text-center text-xl font-bold mt-4 mb-8">
            {step === 3 ? "Appointment Booked!" : "Booking Your Appointment"}
          </h2>

          <br />

          {/* Timeline Stepper */}
          <div className="flex justify-center">
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
                  Verifying Payment...
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
                        d="M18 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM6.5 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.014 13.021l.157-.625A3.427 3.427 0 0 1 6.5 9.571a3.426 3.426 0 0 1 3.322 2.805l.159.622-6.967.023ZM16 12h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Z"
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
                        d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2ZM7 2h4v3H7V2Zm5.7 8.289-3.975 3.857a1 1 0 0 1-1.393 0L5.3 12.182a1.002 1.002 0 1 1 1.4-1.436l1.328 1.289 3.28-3.181a1 1 0 1 1 1.392 1.435Z"
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
        </div>
      )}
    </div>
  );
};

export default SuccessPage;
