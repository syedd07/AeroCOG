'use client';
import { useRouter } from 'next/navigation';
import expertsData from '@/data/expertsData'; // Import expert data
import Image from 'next/image';
import Breadcrumb from '@/components/Common/Breadcrumb';
import React from 'react';
import SEO from '@/components/Common/SEO';


const ExpertDetailPage = ({ params }) => {
  const pageName = "Details of Experts";
  const description = "Review your consultation details and complete the booking process. Our experts are here to help you with their extensive knowledge and experience.";
  const { expertId, } = params; // Get expertId from URL params

  const router = useRouter();

  // Find the expert data based on the expertId from the URL
  const expert = expertsData.find((e) => e.id === expertId);

  if (!expert) {
    return <div style={{ marginTop: '200px', marginBottom: '200px', textAlign: 'center', color: 'red' }}>Expert not found! <i><a className='text-primary hover:underline ' href='/experts'>Find here!</a></i></div>; // Handle invalid expert ID
  }

  const handleConsult = () => {
    // Redirect to the consult page with the expertId
    router.push(`/consult?expertId=${expert.id}&expertName=${expert.name}&expertAmount=${expert.amount}`); // Redirect to the consult page with the expertId
  };

  return (
    <>
      <SEO
        title='Expert Details'
        description='Review your consultation details and complete the booking process. Our experts are here to help you with their extensive knowledge and experience.'
        keywords='Expert Details, Consultation, Expertise, Knowledge, Experience, get know about our experts'
      />
      <Breadcrumb pageName={pageName} description={description} />
      <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[80px]">


        <section className="py-5 px-2" >
          <div className="container mx-auto" >
            <div className="flex flex-col items-center space-y-8">
              {/* Profile Picture */}
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary">
                <Image src={expert.photo} alt={expert.name} width={160} height={160} />
              </div>

              {/* Expert Information */}
              <div className="text-center">
                <h2 className="text-2xl font-bold">{expert.name}</h2>
                <p className="text-lg font-medium text-gray-600">{expert.designation}</p>
                <p className="text-base text-gray-500 mt-2">{expert.shortIntro}</p>
              </div>

              {/* Notable Projects and Social Links */}
              <div className="flex justify-center gap-8 mt-6">
                <div>
                  <h3 className="font-bold">Notable Projects</h3>
                  <ul>
                    {expert.notableProjects.map((project, index) => (
                      <li key={index}>
                        <a href={project.link} className="text-blue-500">{project.name}</a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold">Social Links</h3>
                  <ul>
                    {expert.socialLinks.map((social, index) => (
                      <li key={index}>
                        <a href={social.link} className="text-blue-500">{social.platform}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 text-right max-w-2x1 mx-auto text-xl underline decoration-indigo-500 underline-offset-2">
                <h1>
                  About the Expert
                </h1>

              </div>

              {/* Expert Biography */}
              <div className="mt-8 text-justify max-w-4xl mx-auto text-base">
                <p>{expert.bio}</p>
              </div>
              <br />
              <div className="mt-8 text-right max-w-2x1 mx-auto text-xl underline decoration-indigo-500 underline-offset-2">
                <h1>
                  Consultation Fee: ₹{expert.amount}
                </h1>
              </div>

              {/* Consult Button */}
              <div className="mt-8">
                <button
                  onClick={handleConsult}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition duration-300"
                >
                  Consult with Dr. {expert.name} 
                </button>
              </div>
            </div>
          </div>
        </section>
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

export default ExpertDetailPage;
