"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../components/firebase";
import { format } from "date-fns";
import { toZonedTime } from 'date-fns-tz'; // Import the conversion function
import Breadcrumb from "../../components/Common/Breadcrumb";
import expertsData from "@/data/expertsData";
import axios from "axios";

const CheckoutPage = () => {
  const pageName = "Checkout";
  const description = "Review your consultation details and complete the booking process.";
  const router = useRouter();

  const [searchParams, setSearchParams] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [expert, setExpert] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setUserName(user.displayName || '');
        setUserEmail(user.email || '');
      } else {
        router.push('/signin');
      }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const expertId = urlParams.get('expertId');
    const dateString = urlParams.get('date');
    const time = urlParams.get('time');

    setSearchParams({ expertId, dateString, time });

    if (expertId) {
      const selectedExpert = expertsData.find((e) => e.id === expertId);
      setExpert(selectedExpert);
    }

    return () => unsubscribe();
  }, [router]);

  if (!searchParams) {
    return <p style={{ marginTop: '200px', marginBottom: '200px', textAlign: 'center' }}>Loading...</p>;
  }

  async function initiatePayment(e) {
    e.preventDefault(); // Prevent default button or form submission behavior
  
    const paymentDetails = {
      firstname: userName, // Dynamic value from the form state
      email: userEmail,    // Dynamic value from the form state
      amount: "1.00",      // Dynamic value based on the consultation
      productinfo: `Consultation with ${expert ? `Dr. ${expert.name}` : 'expert'}`, // Dynamic info
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
        payuForm.action = "https://test.payu.in/_payment";
  
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
      alert("Failed to proceed to payment. Please try again.");
    }
  }
  

  const { dateString, time } = searchParams;
  const formattedDate = dateString ? new Date(dateString) : new Date();
  const isValidDate = formattedDate && !isNaN(formattedDate.getTime());
  const finalDate = isValidDate ? formattedDate : new Date();
  const formattedTime = time || 'Not Set';
  const displayDate = format(finalDate, 'dd/MM/yyyy');
  const displayTime = formattedTime;

  return (
    <>
      <Breadcrumb pageName={pageName} description={description} />
      <div className="checkout-page-wrapper">
        <div className="checkout-page-container mt-36 p-8 max-w-4xl mx-auto rounded-lg shadow-lg">
          <h3 className="text-3xl font-semibold text-center">Summary</h3>
          {isValidDate ? (
            <h4 className="text-xl text-center text-gray-600 mt-4">
              Consulting with Expert ID: {searchParams.expertId} on {displayDate} at {displayTime} IST
            </h4>
          ) : (
            <h4 className="text-xl text-center text-red-600 mt-4">Invalid Date</h4>
          )}

          <div className="consultation-summary mt-6">
            <div className="text-center mb-4">
              <p><strong>Expert:</strong> {expert ? `Dr. ${expert.name}` : 'Expert not found'}</p>
              <br />
              <p><strong>Date:</strong> {isValidDate ? displayDate : 'Invalid date'}</p>
              <br />
              <p><strong>Time:</strong> {displayTime} IST</p>
            </div>
          </div>

          <h4 className="text-2xl font-semibold mt-6 mb-4">Check Your Details</h4>
          <form className="space-y-6">
            <div className="input-group">
              <label htmlFor="userName" className="mb-3 block text-sm text-dark dark:text-white">Your Name</label>
              <input
                id="userName"
                type="text"
                value={userName}
                className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none input-field cursor-not-allowed"
                disabled
                style={{ cursor: 'not-allowed' }}
              />
              <p className="text-red-600 text-sm mt-1"> You can update your name on profile page <i><a className='text-primary hover:underline' href='/profile'>here</a></i></p>
            </div>

            <div className="input-group">
              <label htmlFor="userEmail" className="mb-3 block text-sm text-dark dark:text-white">Email</label>
              <input
                id="userEmail"
                type="email"
                value={userEmail}
                className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none input-field cursor-not-allowed"
                disabled
                style={{ cursor: 'not-allowed' }}
              />
              <p className="text-red-600 text-sm mt-1">You cannot change your email ID!</p>
            </div>
            <div className="input-group">
              <label htmlFor="whatsappNumber" className="mb-3 block text-sm text-dark dark:text-white">WhatsApp Number</label>
              <input
                id="whatsappNumber"
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                placeholder="Enter your WhatsApp number"
                required
              />
            </div>

            <div className="text-center mt-8">
              <button
                className="text-white bg-primary hover:bg-primary-dark w-full py-3 px-8 text-lg font-medium transition-all duration-300 rounded-md"
                onClick={(e) => {
                  console.log('Proceeding to pay...');
                  setLoading(true);
                  initiatePayment(e);
                }}
              >
                {loading ? 'Processing...' : 'Proceed to Pay'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};


export default CheckoutPage;
