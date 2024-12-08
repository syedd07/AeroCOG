//V1 - chat
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ExpertCard } from "@/components/ExpertCard";
import Breadcrumb from "@/components/Common/Breadcrumb";
//import expertsData from '@/data/expertsData'; // Import expert data
import SEO from '@/components/Common/SEO';

interface Expert {
  id: string;
  name: string;
  designation: string;
  mentorshipFocus: string;
  shortIntro: string;
  photo: string;

}
interface ExpertsPageProps {
  onSelectExpert?: (expert: Expert) => void;
}

const ExpertsPage: React.FC<ExpertsPageProps> = ({ onSelectExpert }) => {
  const router = useRouter();

  const handleSelectExpert = (expert: Expert) => {
    if (onSelectExpert) {
      onSelectExpert(expert); // This allows `ConsultPage` to directly render `ConsultForm`
    } else {
      router.push(`/experts/${expert.id}`); // This pushes to `ExpertDetailPage` for the expert
    }
  };


  React.useEffect(() => {
    document.title = "Our Experts - AeroCOG";
  }, []);

  const experts: Expert[] = [
    { id: 'A112401', name: 'Kannan Brahmaputran', designation: 'Aerospace Engineering', mentorshipFocus: 'Technical advisory', shortIntro: 'Gas Turbine, Aircraft Engines-Military and civil, Combustion, Thermodynamics, CFD.', photo: '/images/experts/kannan.jpg' },
    { id: 'test', name: 'Yousuf Ali', designation: 'Web Dev', shortIntro: 'Focused on nothing!', mentorshipFocus: '', photo: '/images/experts/ali.jpg' },

  ];

  return (
    <>
      <SEO
        title="Our Experts"
        description="Connect with top aerospace professionals ready to bring their knowledge and expertise to your projects."
        keywords='aerospace, experts, professionals, mentorship, advisory, Aerospace Engineering, Gas Turbine, Aircraft Engines-Military and civil, Combustion, Thermodynamics, CFD'
      />
      <Breadcrumb
        pageName="Our Experts"
        description="Connect with top aerospace professionals ready to bring their knowledge and expertise to your projects."
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container" style={{ backgroundColor: 'transparent' }}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experts.map((expert) => (
              <div
                key={expert.id}
                onClick={() => handleSelectExpert(expert)}
                className="cursor-pointer transform transition duration-300 hover:scale-105"
              >
                <ExpertCard expert={expert} />
              </div>
            ))}
          </div>


          <div className="-mx-4 flex flex-wrap" data-wow-delay=".15s">
            <div className="w-full px-4">
              <ul className="flex items-center justify-center pt-8">
                <li className="mx-1">
                  <a
                    href="#0"
                    className="flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white"
                  >
                    Prev
                  </a>
                </li>
                <li className="mx-1">
                  <a
                    href="#0"
                    className="flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white"
                  >
                    1
                  </a>
                </li>
                <li className="mx-1">
                  <a
                    href="#0"
                    className="flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white"
                  >
                    2
                  </a>
                </li>
                <li className="mx-1">
                  <a
                    href="#0"
                    className="flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white"
                  >
                    3
                  </a>
                </li>
                <li className="mx-1">
                  <span className="flex h-9 min-w-[36px] cursor-not-allowed items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color">
                    ...
                  </span>
                </li>
                <li className="mx-1">
                  <a
                    href="#0"
                    className="flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white"
                  >
                    12
                  </a>
                </li>
                <li className="mx-1">
                  <a
                    href="#0"
                    className="flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white"
                  >
                    Next
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ExpertsPage;
