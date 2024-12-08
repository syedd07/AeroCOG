"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { format } from "date-fns";
import Breadcrumb from "../../components/Common/Breadcrumb";
import expertsData from "@/data/expertsData";
import Alert from "../../components/Common/CustomAlert";
import { toast } from "react-hot-toast";

const CheckoutPage = () => {
  const [alert, setAlert] = useState(null); // State for managing alerts
  const pageName = "Checkout";
  const description =
    "Review your consultation details and complete the booking process.";
  const router = useRouter();

  const [searchParams, setSearchParams] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [expert, setExpert] = useState(null);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "");
        setUserEmail(user.email || "");
      } else {
        toast.error("Please sign in to continue.");
        router.push("/signin");
      }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const expertId = urlParams.get("expertId");
    const dateString = urlParams.get("date");
    const time = urlParams.get("time");

    // Only update the searchParams if they are different from the current state
    setSearchParams((prevSearchParams) => {
      // Ensure prevSearchParams is never null or undefined, fallback to an empty object
      const currentParams = prevSearchParams || {};

      if (
        currentParams.expertId !== expertId ||
        currentParams.dateString !== dateString ||
        currentParams.time !== time
      ) {
        return { expertId, dateString, time };
      }
      return currentParams; // No change, return previous state
    });

    if (expertId) {
      const selectedExpert = expertsData.find((e) => e.id === expertId);
      setExpert(selectedExpert);
    }

    // Clear previous appointment details and set the new one
    const newAppointmentDetails = {
      expertId,
      date: dateString,
      time,
      whatsappNumber,
    };
    localStorage.setItem(
      "appointmentDetails",
      JSON.stringify(newAppointmentDetails),
    );

    return () => unsubscribe();
  }, [whatsappNumber, expert, searchParams, router]); // Add whatsappNumber to dependencies to trigger when it changes

  if (!searchParams) {
    return (
      <div
        className="text-center"
        role="status"
        style={{
          textAlign: "center",
          marginTop: "200px",
          marginBottom: "200px",
        }}
      >
        <svg
          aria-hidden="true"
          className="inline h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  async function initiatePayment(e) {
    e.preventDefault(); // Prevent default button or form submission behavior
    setLoading(true);

    // Ensure the latest details are in localStorage
    const updatedDetails = {
      expertId: searchParams.expertId,
      date: searchParams.dateString,
      time: searchParams.time,
    };
    localStorage.setItem("appointmentDetails", JSON.stringify(updatedDetails));

    const paymentDetails = {
      firstname: userName, // Dynamic value from the form state
      email: userEmail, // Dynamic value from the form state
      amount: expert.amount, // Dynamic value based on the consultation
      productinfo: `Consultation with ${expert ? `Dr. ${expert.name}` : "expert"}`, // Dynamic info
      txnid: "txn_" + new Date().getTime(), // Unique transaction ID
      phone: whatsappNumber, // Dynamic value from the form state
    };

    try {
      // Call the backend to get the payment payload
      const response = await fetch("/api/payu/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentDetails),
      });

      const { payload } = await response.json();

      if (payload) {
        // Redirect to PayU with the generated payload
        const payuForm = document.createElement("form");
        payuForm.method = "POST";
        payuForm.action = "https://secure.payu.in/_payment";

        // Add payload fields to the form
        for (const key in payload) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = payload[key];
          payuForm.appendChild(input);
        }

        document.body.appendChild(payuForm);
        payuForm.submit();
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      setAlert({
        type: "danger",
        message: "Failed to proceed to payment. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  const { dateString, time } = searchParams;
  const formattedDate = dateString ? new Date(dateString) : new Date();
  const isValidDate = formattedDate && !isNaN(formattedDate.getTime());
  const finalDate = isValidDate ? formattedDate : new Date();
  const formattedTime = time || "Not Set";
  const displayDate = format(finalDate, "dd/MM/yyyy");
  const displayTime = formattedTime;

  return (
    <>
      <Breadcrumb pageName={pageName} description={description} />
      <div className="checkout-page-wrapper">
        <div className="checkout-page-container mx-auto mt-36 max-w-4xl rounded-lg p-8 shadow-lg">
          <h3 className="text-center text-3xl font-semibold">Summary</h3>
          {isValidDate ? (
            <h4 className="mt-4 text-center text-xl text-gray-600">
              Consulting with Expert ID: {searchParams.expertId} on{" "}
              {displayDate} at {displayTime} IST
            </h4>
          ) : (
            <h4 className="mt-4 text-center text-xl text-red-600">
              Invalid Date
            </h4>
          )}

          <div className="consultation-summary mt-6">
            <div className="mb-4 text-center">
              <p>
                <strong>Expert:</strong>{" "}
                {expert ? `Dr. ${expert.name}` : "Expert not found"}
              </p>
              <br />
              <p>
                <strong>Date:</strong>{" "}
                {isValidDate ? displayDate : "Invalid date"}
              </p>
              <br />
              <p>
                <strong>Time:</strong> {displayTime} IST
              </p>
              <br />
              <p>
                <strong>Expert Fee:</strong> ₹{expert ? expert.amount : 0}
              </p>
            </div>
          </div>

          <h4 className="mb-4 mt-6 text-2xl font-semibold">
            Check Your Details
          </h4>
          <div>
            {/* Render the alert if it exists */}
            {alert && (
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            )}
          </div>
          <form className="space-y-6">
            <div className="input-group">
              <label
                htmlFor="userName"
                className="mb-3 block text-sm text-dark dark:text-white"
              >
                Your Name
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                className="border-stroke input-field w-full cursor-not-allowed rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                disabled
                style={{ cursor: "not-allowed" }}
              />
              <p className="mt-1 text-sm text-red-600">
                {" "}
                You can update your name on profile page{" "}
                <i>
                  <a className="text-primary hover:underline" href="/profile">
                    here
                  </a>
                </i>
              </p>
            </div>

            <div className="input-group">
              <label
                htmlFor="userEmail"
                className="mb-3 block text-sm text-dark dark:text-white"
              >
                Email
              </label>
              <input
                id="userEmail"
                type="email"
                value={userEmail}
                className="border-stroke input-field w-full cursor-not-allowed rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                disabled
                style={{ cursor: "not-allowed" }}
              />
              <p className="mt-1 text-sm text-red-600">
                You cannot change your email ID!
              </p>
            </div>
            <div className="input-group">
              <label
                htmlFor="whatsappNumber"
                className="mb-3 block text-sm text-dark dark:text-white"
              >
                WhatsApp Number
              </label>
              <input
                id="whatsappNumber"
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="required border-stroke w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                placeholder="Enter your WhatsApp number"
              />
            </div>

            <div className="mt-8 text-center">
              <button
                className="hover:bg-primary-dark ... w-full rounded-md bg-primary px-8 py-3 text-lg font-medium text-white transition-all duration-300 hover:bg-sky-700"
                onClick={(e) => {
                  console.log("Proceeding to pay...");
                  setLoading(true);
                  initiatePayment(e);
                }}
              >
                {loading ? "Processing..." : "Proceed to Pay ₹" + expert.amount}
              </button>
            </div>
            <div className="mt-4 text-center">
              <p className="mt-4 text-center text-sm text-gray-600">
                By clicking on the &#8220 Proceed to Pay &#8221 button, you agree to our{" "}
                <a
                  href="/_docs/terms-of-use.html"
                  className="text-primary hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/_docs/privacy-policy.html"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </p>
              </div>
              
          </form>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
