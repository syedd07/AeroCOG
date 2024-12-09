"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
//import "react-calendar/dist/Calendar.css";
import expertsData from "@/data/expertsData";
import Alert from "./Common/CustomAlert";
import 'flowbite';

const ConsultForm = ({ selectedExpert }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const expertId = searchParams.get("expertId");
  const expertName = searchParams.get("expertName");

  const [expert, setExpert] = useState(selectedExpert || null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [alert, setAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // New state variable

  const timeSlots = [
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "06:00 PM",
    "07:00 PM",
    "08:00 PM",
    "08:30 PM",
  ];

  useEffect(() => {
    if (expertId && !selectedExpert) {
      const fetchedExpert = expertsData.find((e) => e.id === expertId);
      if (fetchedExpert) {
        setExpert(fetchedExpert);
      }
    } else if (selectedExpert) {
      setExpert(selectedExpert);
    }
  }, [expertId, selectedExpert]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
  };

  const handleProceedToCheckout = () => {
    if (expert && selectedDate && selectedTime) {
      console.log("Proceeding with Checkout:", {
        expertId: expert.id,
        date: selectedDate.toString(),
        time: selectedTime,
      });
      router.push(
        `/checkout?expertId=${expert.id}&date=${encodeURIComponent(
          selectedDate.toString(),
        )}&time=${selectedTime}`,
      );
    } else {
      setAlert({
        message: "Please select a date, and time slot.",
        type: "danger",
      });
    }
  };

  if (!expert) {
    return (
      <div
        role="status"
        className="text-center"
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
          {/* SVG paths */}
        </svg>
        <span className="sr-only">Loading expert information...</span>
      </div>
    );
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

        {/* Date Picker */}
        <button
          type="button"
          data-modal-target="timepicker-modal"
          data-modal-toggle="timepicker-modal"
          onClick={() => setIsModalOpen(true)} // Open modal on click
          className="inline-flex items-center justify-center mx-auto rounded-lg border border-gray-200 bg-white mb-5 px-5 py-2.5 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        >
          <svg
            className="w4 h-4 me-1"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
              clipRule="evenodd"
            />
          </svg>
          Schedule appointment
        </button>

        {/* Main modal */}
        {isModalOpen && (
          <div
            id="timepicker-modal"
            tabIndex={-1}
            aria-hidden="true"
            className="fixed inset-0 z-50 max-h-full w-full flex items-center justify-center overflow-y-auto overflow-x-hidden md:inset-0"
            onClick={() => setIsModalOpen(false)} // Close modal when clicking outside
          >
            <div className="relative max-h-full w-full max-w-[23rem] p-4">
              <div
                className="relative rounded-lg bg-white shadow dark:bg-gray-800"
                onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
              >
                <div className="flex items-center justify-between rounded-t border-b p-4 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Schedule an appointment
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)} // Close modal on click
                    className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                    data-modal-toggle="timepicker-modal"
                  >
                    <svg
                      className="h-3 w-3"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>
                </div>

                <div className="p-4 pt-0">
                  {/* Date Picker */}

                  <div
                    inline-datepicker
                    datepicker-autoselect-today
                    className="mx-auto sm:mx-0 flex justify-center my-5 [&>div>div]:shadow-none [&>div>div]:bg-gray-50 [&_div>button]:bg-gray-50"
                  ></div>

                  <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 mt-0 block">
                    Pick a date
                  </label>

                  <input
                    type="date"
                    id="date"
                    name="date"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={selectedDate || ""}
                    onChange={handleDateChange}
                  />


                  {/* Time Slots */}
                  <label className="mb-2 mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Pick your time
                  </label>
                  <ul
                    id="timetable"
                    className="grid w-full grid-cols-3 gap-2 mb-5"
                  >
                    {timeSlots.map((time) => (
                      <li key={time}>
                        <input
                          type="radio"
                          id={time}
                          value={time}
                          className="hidden peer"
                          name="timetable"
                          onChange={() => handleTimeChange(time)}
                          checked={selectedTime === time}
                        />
                        <label
                          htmlFor={time}
                          className={`inline-flex items-center justify-center w-full px-2 py-1 text-sm font-medium text-center hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 border rounded-lg cursor-pointer text-gray-500 border-gray-200 dark:border-gray-700 dark:peer-checked:border-blue-500 peer-checked:border-blue-700 dark:hover:border-gray-600 dark:peer-checked:text-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-600 dark:peer-checked:bg-blue-900 ${selectedTime === time
                              ? "dark:peer-checked:text-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-600 dark:peer-checked:bg-blue-900"
                              : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                            }`}
                        >
                          {time}
                        </label>
                      </li>
                    ))}
                  </ul>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                      }}
                      className="mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      data-modal-hide="timepicker-modal"
                      onClick={() => setIsModalOpen(false)}
                      className="mb-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}



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
