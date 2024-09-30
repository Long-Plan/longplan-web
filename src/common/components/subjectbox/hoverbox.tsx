import React, { useState } from "react";
import { BoxProps } from "./stylebox";
import CourseDetailsPopup from "../dialogues/contents/coursedetail";

export interface HoverableBoxProps extends BoxProps {
  BoxComponent: React.FC<BoxProps>;
  courseFullName: string;
  courseCategory: string;
  courseRecommendedYear: string;
  coursePrerequisites: string[];
  courseCorequisite?: string;
}

const HoverableBoxComponent: React.FC<HoverableBoxProps> = ({
  BoxComponent,
  course_no,
  course_title,
  course_credit,
  course_group,
  courseFullName,
  courseCategory,
  courseRecommendedYear,
  coursePrerequisites,
  courseCorequisite,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Popup control state

  // Handle click event to toggle popup
  const handleBoxClick = () => {
    setIsPopupOpen(true);
  };

  return (
    <>
      {/* Render the course box */}
      <div onClick={handleBoxClick}>
        <BoxComponent
          course_no={course_no}
          course_title={course_title}
          course_credit={course_credit}
          course_group={course_group}
        />
      </div>
      {/* Render the Course Detail Popup only when isPopupOpen is true */}
      {isPopupOpen && (
        <CourseDetailsPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)} // Close the popup when clicked
          courseDetails={{
            code: course_no,
            name: courseFullName,
            credits: course_credit,
            category: courseCategory, // Example data, replace as needed
            recommendedYear: courseRecommendedYear,
            prerequisites: coursePrerequisites, // Pass the prerequisites data
            corequisite: courseCorequisite, // Pass the corequisite data
          }}
        />
      )}
    </>
  );
};

export default HoverableBoxComponent;
