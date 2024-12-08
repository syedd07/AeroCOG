"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";
import expertsData from "@/data/expertsData";
import Alert from "./Common/CustomAlert";

const ConsultForm = ({ selectedExpert }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch expert ID and name from URL parameters
  const expertId = searchParams.get("expertId");
  const expertName = searchParams.get("expertName");

  // State declarations
  const [expert, setExpert] = useState(selectedExpert || null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [alert, setAlert] = useState(null);

  // Predefined time slots
  const timeSlots = [
    { label: "10:00 AM", value: "10:00" },
    { label: "2:00 PM", value: "14:00" },
    { label: "5:00 PM", value: "17:00" },
    { label: "8:00 PM", value: "20:00" },
  ];

  // Fetch expert details if expertId is available and no selectedExpert is provided
  useEffect(() => {
    if (expertId && !selectedExpert) {
      const fetchedExpert = expertsData.find((e) => e.id === expertId);
      if (fetchedExpert) {
        setExpert(fetchedExpert);
      } else {
      }
    } else if (selectedExpert) {
      setExpert(selectedExpert);
    }
  }, [expertId, selectedExpert]);

  // Handle date selection from calendar
  const handleDateChange = (date) => {
    //  console.log('Selected Date:', date);
    setSelectedDate(date);
    setIsCalendarVisible(false);
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (value) => {
    // console.log('Selected Time Slot:', value);
    setSelectedTimeSlot(value);
  };

  // Handle proceeding to checkout
  const handleProceedToCheckout = () => {
    if (expert && selectedDate && selectedTimeSlot) {
      console.log("Proceeding with Checkout:", {
        expertId: expert.id,
        date: selectedDate.toISOString(), // Save date as ISO string
        time: selectedTimeSlot,
      });
      router.push(
        `/checkout?expertId=${expert.id}&date=${encodeURIComponent(
          selectedDate.toISOString(), // Send ISO string
        )}&time=${selectedTimeSlot}`,
      );
    } else {
      setAlert({
        message: "Please select a date, and time slot.",
        type: "danger",
      });
    }
  };

  if (!expert) {
    <div
      role="status"
      className="text-center"
      style={{ textAlign: "center", marginTop: "200px", marginBottom: "200px" }}
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
      <span className="sr-only">Loading expert information...</span>
    </div>;
    return;
  }

  return (
    <div
      className="consult-form-wrapper"
      style={{ backgroundColor: "transparent" }}
    >
      <div className="consult-form-container mx-auto max-w-lg rounded-lg p-6 shadow-md">
        {/* Expert Details Section */}
        <div className="mb-8 text-center">
          {expert.photo ? (
            <img
              src={expert.photo}
              alt={expert.name}
              className="mx-auto h-40 w-40 rounded-full border-4 border-primary object-cover"
            />
          ) : (
            <span>Image not available</span>
          )}
          <h2 className="mt-4 text-3xl font-semibold">Dr. {expert.name}</h2>
          <p className="text-xl text-gray-600">{expert.designation}</p>
        </div>
        {/* Alert */}
        {alert && (
          <Alert
            message={alert.message}
            type="danger"
            onClose={() => setAlert(null)}
          />
        )}

        {/* Date Selection */}
        <h4>Select a Date</h4>
        <div className="relative mb-6">
          <input
            type="text"
            value={selectedDate ? format(selectedDate, "dd/MM/yyyy") : ""}
            onFocus={() => setIsCalendarVisible(true)}
            className="border-stroke w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
            readOnly
            placeholder="Select a date"
          />
          <span
            className="calendar-icon absolute right-3 top-3 cursor-pointer"
            onClick={() => setIsCalendarVisible(!isCalendarVisible)}
          >
            📅
          </span>
          {isCalendarVisible && (
            <div className="calendar-popup absolute">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                minDate={new Date()}
                maxDate={
                  new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                }
                tileDisabled={({ date }) => date.getDay() === 0}
                showNeighboringMonth={false}
                calendarType="iso8601"
              />
            </div>
          )}
        </div>

        {/* Time Slot Selection */}
        <h4>Select a Time Slot</h4>
        <br />
        <div className="time-slot-buttons flex justify-center space-x-4">
          {timeSlots.map((slot) => (
            <button
              key={slot.value}
              onClick={() => handleTimeSlotSelect(slot.value)}
              className={`time-slot-button ${selectedTimeSlot === slot.value ? "selected" : ""}`}
            >
              {slot.label}
            </button>
          ))}
        </div>
        <br />
        <p className="text-red-400">
          * Experts reserves the right to change time, they may contact you in
          case of rescheduling{" "}
        </p>

        {/* Proceed Button */}
        <div className="text-center">
          <button
            onClick={handleProceedToCheckout}
            className="btn btn-primary rounded-md bg-blue-500 p-3 px-6 text-white"
          >
            Proceed to Checkout
          </button>
        </div>
        <br />
        <span>
          By consulting, means you agree to the
          <a
            href="/_docs/terms-of-use.html"
            className="text-primary hover:underline"
            target="_blank"
          >
            {" "}
            Consultation Policy{" "}
          </a>
          , and our
          <a
            href="/_docs/privacy-policy.html"
            className="text-primary hover:underline"
            target="_black"
          >
            {" "}
            Privacy Policy{" "}
          </a>
        </span>
      </div>
    </div>
  );
};

export default ConsultForm;
