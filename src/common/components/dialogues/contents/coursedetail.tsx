export interface CourseDetails {
  course_no: string;
  title_long_th: string;
  title_long_en: string;
  course_desc_th: string;
  course_desc_en: string;
  credit: number;
  category?: string;
  recommendedYear?: string;
  recommendedSemester?: string;
  prerequisites: string;
}

interface CourseDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  courseDetails: CourseDetails;
}

export default function CourseDetailsPopup({
  isOpen,
  onClose,
  courseDetails,
}: CourseDetailsPopupProps) {
  // Return null if the popup is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-80 flex justify-center items-center z-50">
      {/* Overlay to close on click */}
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Popup Content */}
      <div className="bg-white rounded-xl p-12 w-full max-w-2xl shadow-2xl relative z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-gray-200 rounded-full p-2"
        >
          ✕
        </button>

        {/* Course Information */}
        <h2 className="text-lg font-semibold mb-4 text-center">
          รายละเอียดวิชา
        </h2>
        <div className="space-y-2 text-start text-black">
          <p>
            <strong>รหัสวิชา:</strong> {courseDetails.course_no}
          </p>
          <p>
            <strong>ชื่อวิชา (TH) :</strong> {courseDetails.title_long_th}
          </p>
          <p>
            <strong>ชื่อวิชา (EN) :</strong> {courseDetails.title_long_en}
          </p>
          <p>
            <strong>หน่วยกิต:</strong> {courseDetails.credit}
          </p>
          <p>
            <strong>หมวดหมู่:</strong>{" "}
            <span className="text-blue-shadeb5">{courseDetails.category}</span>
          </p>
          <p>
            <strong>ปีและภาคเรียนที่แนะนำ:</strong> {"ปี  "}
            {courseDetails.recommendedYear} {"ภาคเรียนที่  "}
            {courseDetails.recommendedSemester}
          </p>
        </div>

        <hr className="my-4" />

        {/* Prerequisite Section */}
        <h3 className="font-semibold my-4 text-start">
          วิชาที่ต้องผ่านก่อน (Pre-Requisite)
        </h3>
        <div className="space-y-2 text-start">
          {courseDetails.prerequisites &&
          courseDetails.prerequisites.length > 0 ? (
            <ul className="list-disc ml-5">
              <li className="text-blue-shadeb5">
                {courseDetails.prerequisites}
              </li>
            </ul>
          ) : (
            <p className="font-semibold text-gray-400">
              ไม่มีวิชาที่ต้องผ่านก่อน
            </p> // If no prerequisites
          )}
        </div>
      </div>
    </div>
  );
}