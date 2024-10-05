import React, { useState } from "react";
import { BoxProps } from "./stylebox";
import CourseDetailsPopup, {
  CourseDetails,
} from "../dialogues/contents/coursedetail";

export interface HoverableBoxProps {
  BoxComponent: React.FC<BoxProps>;
  course_detail: CourseDetails;
  is_enrolled?: boolean;
  group: string;
}

const HoverableBoxComponent: React.FC<HoverableBoxProps> = ({
  BoxComponent,
  course_detail,
  is_enrolled,
  group,
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
        {course_detail && (
          <BoxComponent
            course_no={course_detail.course_no ?? ""}
            course_title_long_en={course_detail.title_long_en}
            course_title_long_th={course_detail.title_long_th}
            credit={course_detail.credit}
            course_category={course_detail.category}
            is_enrolled={is_enrolled}
          />
        )}
      </div>
      {/* Render the Course Detail Popup only when isPopupOpen is true */}
      {isPopupOpen && (
        <CourseDetailsPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)} // Close the popup when clicked
          courseDetails={course_detail}
          group={group}
        />
      )}
    </>
  );
};

export default HoverableBoxComponent;
