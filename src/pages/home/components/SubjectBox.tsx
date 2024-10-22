import { useState } from "react";
import { CourseDetail } from "../../../types";
import CourseDetailModal from "./CourseDetailModal";

interface Props {
  primaryColor: string;
  secondColor: string;
  isEnrolled: boolean;
  courseDetail: CourseDetail;
  year: number;
  semester: number;
  group: string;
}

function SubjectBox({
  primaryColor,
  secondColor,
  isEnrolled,
  courseDetail,
  semester,
  year,
  group,
}: Props) {
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Popup control state

  // Handle click event to toggle popup
  const handleBoxClick = () => {
    setIsPopupOpen(true);
  };
  return (
    <>
      {isPopupOpen && (
        <CourseDetailModal
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)} // Close the popup when clicked
          courseDetails={courseDetail}
          group={group}
          year={year}
          semester={semester}
        />
      )}

      <div
        onClick={handleBoxClick} // Added onClick event to open the popup
        style={{
          backgroundColor: isEnrolled ? secondColor : "white",
          borderColor: primaryColor,
        }}
        className={`relative inline-flex items-start justify-end gap-[10px] pl-0 pr-[5px] py-0 rounded-[10px] border border-solid shadow-box-shadow cursor-pointer transition-all duration-300 transform group hover:scale-110 w-[105px] h-[45px]`} // Added cursor-pointer for visual feedback
      >
        <div
          style={{ backgroundColor: primaryColor }}
          className={`absolute left-0 w-[7px] h-[44px] rounded-l-[10px]`}
        />
        <div
          style={{ color: primaryColor }}
          className={`w-[64px] font-h7 text-[16px] text-center tracking-[0] leading-[21px]`}
        >
          <div>
            <span
              style={{ color: primaryColor }}
              className={`font-h7 text-[13px] tracking-[0] leading-[21px] font-semibold`}
            >
              {courseDetail.course_no}
              <br />
            </span>
            <p
              style={{ color: primaryColor }}
              className={`text-[11px] leading-[19.7px] truncate`}
            >
              {courseDetail.title_long_en}
            </p>
          </div>
        </div>
        <div className="inline-flex flex-col h-[19px] items-start justify-end gap-[10px] relative flex-[0_0_auto]">
          <div
            style={{ color: primaryColor }}
            className={`font-h2 text-[10px]
          } text-center tracking-[0] leading-[15.8px] whitespace-nowrap font-semibold`}
          >
            {isEnrolled ? courseDetail.credit : "?"}
          </div>
        </div>
      </div>
    </>
  );
}

export default SubjectBox;
