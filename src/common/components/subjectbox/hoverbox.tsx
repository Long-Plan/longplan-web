import React, { useState } from "react";
import { BoxProps } from "./stylebox";
import CourseDetailsPopup from "../dialogues/contents/coursedetail";
import { CourseDetails } from "../../../types/course";

export interface HoverableBoxProps {
  BoxComponent: React.FC<BoxProps>;
  course_detail: CourseDetails;
  is_enrolled?: boolean;
  group: string;
  year?: number;
  semester?: number;
}

const HoverableBoxComponent: React.FC<HoverableBoxProps> = ({
  BoxComponent,
  course_detail,
  is_enrolled = false,
  group,
  year,
  semester,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Popup control state

  // Handle click event to toggle popup
  const handleBoxClick = () => {
    setIsPopupOpen(true);
  };

  return (
    <>
      {/* Render the course box only if course details exist */}
      {course_detail && (
        <div onClick={handleBoxClick}>
          <BoxComponent
            course_no={course_detail.course_no ?? ""}
            course_title_long_en={course_detail.title_long_en}
            course_title_long_th={course_detail.title_long_th}
            credit={course_detail.credit}
            is_enrolled={is_enrolled}
          />
        </div>
      )}

      {/* Render the Course Detail Popup only when isPopupOpen is true */}
      {isPopupOpen && (
        <CourseDetailsPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)} // Close the popup when clicked
          courseDetails={course_detail}
          group={group}
          year={year}
          semester={semester}
        />
      )}
    </>
  );
};

export default HoverableBoxComponent;
