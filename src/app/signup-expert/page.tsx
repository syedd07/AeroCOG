'use client';
import { useEffect, useState } from 'react';
import styles from './signup.module.css';
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../../components/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../components/firebase"; // Import Firebase Storage
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Common/Breadcrumb';
import SEO from '@/components/Common/SEO';
import Alert from '@/components/Common/CustomAlert';

const auth = getAuth();
const user = auth.currentUser;

const ExpertSignUpForm = () => {
  const [isLoading, setIsLoading] = useState(false); // New state for loading
  const [isUploaded, setIsUploaded] = useState(false);
  const [alert, setAlert] = useState(null); // State for managing alerts
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null); // Track authenticated user
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    designation: '',
    bio: '',
    photo: null,
    notableProjects: '',
    socialLinks: { instagram: '', linkedin: '', googleScholar: '' },
    password: '',
  });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set user on auth state change
    });

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []);

  // Handler for input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler for social media fields
  const handleSocialLinksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value,
      },
    }));
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    // Check if file size is within the limit (500KB)
    if (file && file.size <= 2000000) {
      setIsLoading(true);

      try {
        // Simulate upload process (replace with actual upload logic)
        await new Promise((resolve) => setTimeout(resolve, 3000));
        console.log('Photo uploaded successfully:', file);
      } catch (error) {
        console.error('Photo upload failed:', error);
      } finally {
        setIsLoading(false); // Hide loading message
      }


      // Create a reference to store the file in Firebase Storage
      const storageRef = ref(storage, `experts/${file.name}`); // Path where the file is stored

      // Upload the file to Firebase Storage
      uploadBytes(storageRef, file).then((snapshot) => {
        console.log("File uploaded!");

        // Get the download URL of the uploaded file
        getDownloadURL(snapshot.ref).then((downloadURL) => {
          // Set the URL in the form data
          setFormData((prev) => ({
            ...prev,
            photo: downloadURL, // Store the URL in the formData
          }));

          // Set loading to false after upload finishes
          setIsLoading(false);

        });
      }).catch((error) => {
        alert("Error uploading file: " + error.message);
      });
    } else {
      setAlert({ type: 'danger', message: "File size exceeds the limit. Please upload a file less than 2MB." })
    }
  };


  // Validate email format
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validate mobile number (10 digits)
  const validateMobile = (mobile: string) => {
    return /^\d{10}$/.test(mobile);
  };

  // Basic password validation (minimum 8 characters)
  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  // Step navigation function
  const goToNextStep = () => {
    if (step === 9) return; // Prevent going beyond step 9
    if (isFieldValid(step)) {
      setStep(step + 1);
    } else {
      setAlert({ type: 'danger', message: "Please fill in the required field correctly." })
    }
  };

  const goToPreviousStep = () => {
    if (step === 1) return; // Prevent going before step 1
    setStep(step - 1);
  };
  const router = useRouter();

  // Form submission handler
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent form default submit behavior
    if (!user) {
      setAlert({ type: 'danger', message: "You must be logged in to create an expert profile!" })
      return;
    }
    //console.log("Form Data before submission:", formData); // Debugging log

    // Check if email or mobile already exists in the Firestore collection
    const expertsRef = collection(db, "experts");

    // Create queries for email and mobile
    const emailQuery = query(expertsRef, where("email", "==", formData.email));
    const mobileQuery = query(expertsRef, where("mobile", "==", formData.mobile));

    try {
      const emailQuerySnapshot = await getDocs(emailQuery);
      const mobileQuerySnapshot = await getDocs(mobileQuery);

      // If email or mobile already exists, show an alert and return
      if (!emailQuerySnapshot.empty) {
        setAlert({ type: 'danger', message: "An expert with this email already exists. Please use a different email." });
        return;
      }

      if (!mobileQuerySnapshot.empty) {
        setAlert({ type: 'danger', message: "An expert with this mobile number already exists. Please use a different number." });
        return;
      }


      // Validate password or other required fields here
      if (!formData.password || formData.password.length < 6) {
        setAlert({ type: 'danger', message: "Password must be at least 6 characters!" })
        return;
      }

      // Store form data in Firestore
      const docRef = await addDoc(collection(db, "experts"), {
        ...formData,
        photo: formData.photo, // Store the file URL
        createdAt: new Date(),
        userId: user.uid, // Store the authenticated user's UID
      });

      console.log("Document written with ID: ", docRef.id);
      setAlert({ type: 'success', message: "Expert profile created successfully!" })
    } catch (error) {
      console.error("Error adding document: ", error);
      setAlert({ type: 'danger', message: "Failed to create profile. Contact support." })
    }
    router.push('/');
  };


  // Function to check if the current field is valid
  const isFieldValid = (step: number) => {
    if (step === 1) return formData.name.trim().length > 0;
    if (step === 2) return validateEmail(formData.email);
    if (step === 3) return validateMobile(formData.mobile);
    if (step === 4) return formData.designation.trim().length > 0;
    if (step === 5) return formData.bio.trim().length >= 120;
    if (step === 6) return formData.photo !== null;
    if (step === 7) return formData.notableProjects.trim().length > 0;
    if (step === 8) return true; // Social links are optional
    if (step === 9) return validatePassword(formData.password);
    return false;
  };

  return (
    <>
      <SEO
        title="Expert Sign Up"
        description="Sign up to become an expert"
        keywords='expert, sign up, expert sign up, expert registration, Join us as Expert, Aerospace Industries Experts, Aerocog'
      />

      <Breadcrumb pageName="Expert Sign Up" description="Sign up to become an expert" />

      <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[80px]">

        <form onSubmit={handleSubmit} className={styles.signUpForm}>
          <p style={{ textAlign: 'center', color: 'red', fontWeight: 'bold' }} className="text-dark dark:text-white text-lg mb-6">Please login, before onboarding as an expert. <i><a className='text-primary hover:underline' href='/signup'>here</a></i></p>
          <div>
            {/* Render the alert if it exists */}
            {alert &&
              <Alert type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)} // Close the alert
              />}
          </div>

          {/* Step-by-step input rendering */}
          {step >= 1 && (
            <div className={styles.step}>
              <label className="mb-3 block text-sm text-dark dark:text-white">Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                required
              />
            </div>
          )}
          {step >= 2 && (
            <div className={styles.step}>
              <label className="mb-3 block text-sm text-dark dark:text-white">Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                required
              />
            </div>
          )}
          {step >= 3 && (
            <div className={styles.step}>
              <label className="mb-3 block text-sm text-dark dark:text-white">Mobile Number:</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="Enter your mobile number"
                className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                required
              />
            </div>
          )}
          {step >= 4 && (
            <div className={styles.step}>
              <label className="mb-3 block text-sm text-dark dark:text-white">Designation:</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                placeholder="Enter your designation"
                className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                required
              />
            </div>
          )}
          {step >= 5 && (
            <div className={styles.step}>
              <label className="mb-3 block text-sm text-dark dark:text-white">Bio:</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself (at least 120 words)"
                className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                required
                minLength={120}
                spellCheck="true"
              />
            </div>
          )}
          {/* Photo upload */}
          {step >= 6 && (

            <div className="flex items-center justify-center w-full">
              {!formData.photo ? (
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                </div>
                <input 
                id="dropzone-file"
                type="file"
                name='photo'
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
                required
                />
                {isLoading && <div className="loading-spinner"> Please wait Uploading...</div>}
              </label>
              ) : (
              <div className="text-center">
                <p className="text-sm text-green-500 dark:text-green-400">Photo uploaded successfully!</p>
              </div>
              )}
            </div>
            )}
          {/* {step >= 6 && (
            <div className={styles.step}>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="file_input">Photo:</label>
              <input
                id='file_input'
                type="file"
                name="photo"
                onChange={handlePhotoChange}
                accept="image/*"
                className= "block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="file_input" type="file"
                required
              />
              {isLoading && <div className="loading-spinner"> Please wait Uploading...</div>} 
            </div>
          )} */}
          {step >= 7 && (
            <div className={styles.step}>
              <label className="mb-3 block text-sm text-dark dark:text-white">Notable Projects:</label>
              <textarea
                name="notableProjects"
                value={formData.notableProjects}
                onChange={handleInputChange}
                placeholder="Describe your notable projects"
                className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                required
              />
            </div>
          )}
          {step >= 8 && (
            <div className={styles.step}>
              <label className={styles.label}>Social Links (Optional):</label>
              <input
                type="url"
                name="instagram"
                value={formData.socialLinks.instagram}
                onChange={handleSocialLinksChange}
                placeholder="Instagram URL"
                className={styles.input}
              />
              <input
                type="url"
                name="linkedin"
                value={formData.socialLinks.linkedin}
                onChange={handleSocialLinksChange}
                placeholder="LinkedIn URL"
                className={styles.input}
              />
              <input
                type="url"
                name="googleScholar"
                value={formData.socialLinks.googleScholar}
                onChange={handleSocialLinksChange}
                placeholder="Google Scholar URL"
                className={styles.input}
              />
            </div>
          )}
          {step >= 9 && (
            <div className={styles.step}>
              <label className="mb-3 block text-sm text-dark dark:text-white">Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a strong password"
                className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                required
              />
            </div>
          )}

          {/* Navigation buttons */}
          <div className={styles.buttons}>
            {step > 1 && (
              <button type="button" onClick={goToPreviousStep} className={styles.prevButton}>
                Previous
              </button>
            )}
            <button
              type="button"
              onClick={goToNextStep}
              className={styles.nextButton}
              disabled={!isFieldValid(step)}
              style={{ cursor: !isFieldValid(step) ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
            {step === 9 && (
              <button type="submit" className={styles.submitButton}>
                Submit
              </button>
            )}
          </div>
        </form>

        <div className="absolute left-0 top-0 z-[-1]">
          <svg
            width="1440"
            height="969"
            viewBox="0 0 1440 969"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask
              id="mask0_95:1005"
              style={{ maskType: "alpha" }}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="1440"
              height="969"
            >
              <rect width="1440" height="969" fill="#090E34" />
            </mask>
            <g mask="url(#mask0_95:1005)">
              <path
                opacity="0.1"
                d="M1086.96 297.978L632.959 554.978L935.625 535.926L1086.96 297.978Z"
                fill="url(#paint0_linear_95:1005)"
              />
              <path
                opacity="0.1"
                d="M1324.5 755.5L1450 687V886.5L1324.5 967.5L-10 288L1324.5 755.5Z"
                fill="url(#paint1_linear_95:1005)"
              />
            </g>
            <defs>
              <linearGradient
                id="paint0_linear_95:1005"
                x1="1178.4"
                y1="151.853"
                x2="780.959"
                y2="453.581"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_95:1005"
                x1="160.5"
                y1="220"
                x2="1099.45"
                y2="1192.04"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

      </section>
    </>
  );
};

export default ExpertSignUpForm;
