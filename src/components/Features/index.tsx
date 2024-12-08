import SectionTitle from "../Common/SectionTitle";
import SingleFeature from "./SingleFeature";
import featuresData from "./featuresData";
import React from "react";
import CustomButton from "../Common/CustomButton";

const Features: React.FC = () => {
  return (
    <>
      <section id="features" className="py-16 md:py-20 lg:py-28">
        <div className="container">
          <SectionTitle
            title="How we help you grow "
            paragraph="Aerocog helps your aerospace startup grow."
            center
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3 ">
            {featuresData.map((feature) => (
              <SingleFeature key={feature.id} feature={feature} />
            ))}
          </div>
        </div>
        <div>
          <CustomButton />
        </div>
      </section>
    </>
  );
};

export default Features;
