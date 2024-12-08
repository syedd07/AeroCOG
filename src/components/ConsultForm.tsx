'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import expertsData from '@/data/expertsData';
import Alert from './Common/CustomAlert';


const ConsultForm = ({ selectedExpert }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Fetch expert ID and name from URL parameters
  const expertId = searchParams.get('expertId');
  const expertName = searchParams.get('expertName');

  // State declarations
  const [expert, setExpert] = useState(selectedExpert || null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [alert, setAlert] = useState(null);

  // Predefined time slots
  const timeSlots = [
    { label: '10:00 AM', value: '10:00' },
    { label: '2:00 PM', value: '14:00' },
    { label: '5:00 PM', value: '17:00' },
    { label: '8:00 PM', value: '20:00' },
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
      console.log('Proceeding with Checkout:', {
        expertId: expert.id,
        date: selectedDate.toISOString(), // Save date as ISO string
        time: selectedTimeSlot,
      });
      router.push(
        `/checkout?expertId=${expert.id}&date=${encodeURIComponent(
          selectedDate.toISOString() // Send ISO string
        )}&time=${selectedTimeSlot}`
      );
    } else {
      setAlert({
        message: 'Please select a date, and time slot.',
        type: 'danger',
      });

    }
  };

  if (!expert) {
    return <p style={{ marginTop: '200px', marginBottom: '200px', textAlign: 'center' }}>Loading expert information...</p>;
  }

  return (
    <div className="consult-form-wrapper" style={{ backgroundColor: 'transparent' }}>
      <div className="consult-form-container mx-auto p-6 max-w-lg rounded-lg shadow-md">
        

        {/* Expert Details Section */}
        <div className="text-center mb-8">
          {expert.photo ? (
            <img
              src={expert.photo}
              alt={expert.name}
              className="w-40 h-40 rounded-full object-cover mx-auto border-4 border-primary"
            />
          ) : (
            <span>Image not available</span>
          )}
          <h2 className="text-3xl font-semibold mt-4">Dr. {expert.name}</h2>
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
            value={selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''}
            onFocus={() => setIsCalendarVisible(true)}
            className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
            readOnly
            placeholder='Select a date'
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
                maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
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
              className={`time-slot-button ${selectedTimeSlot === slot.value ? 'selected' : ''}`}
            >
              {slot.label}
            </button>
          ))}

        </div>
        <br />
        <p className='text-red-400'>* Experts reserves the right to change time, they may contact you in case of rescheduling </p>

        {/* Proceed Button */}
        <div className="text-center">
          <button onClick={handleProceedToCheckout} className="btn btn-primary p-3 px-6 rounded-md bg-blue-500 text-white">
            Proceed to Checkout
          </button>
        </div>
        <br />
        <span>
          By consulting, means you agree to the
          <a href="/_docs/terms-of-use.html" className="text-primary hover:underline" target='_blank'>
            {" "}
            Consultation Policy{" "}
          </a>
          , and our
          <a href="/_docs/privacy-policy.html" className="text-primary hover:underline" target='_black'>
            {" "}
            Privacy Policy{" "}

          </a>
        </span>
      </div>
    </div>
  );
};

export default ConsultForm;
