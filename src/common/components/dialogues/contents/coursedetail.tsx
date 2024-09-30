export interface CourseDetails {
  code: string;
  name: string;
  credits: number;
  category: string;
  recommendedYear: string;
  prerequisites?: string[]; // Make prerequisites optional in case it's missing
  corequisite?: string; // Make corequisite optional as well
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
            <strong>รหัสวิชา:</strong> {courseDetails.code}
          </p>
          <p>
            <strong>ชื่อวิชา:</strong> {courseDetails.name}
          </p>
          <p>
            <strong>หน่วยกิต:</strong> {courseDetails.credits}
          </p>
          <p>
            <strong>หมวดหมู่:</strong>{" "}
            <span className="text-blue-shadeb5">{courseDetails.category}</span>
          </p>
          <p>
            <strong>ปีและภาคเรียนที่แนะนำ:</strong>{" "}
            {courseDetails.recommendedYear}
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
              {courseDetails.prerequisites.map((prerequisite, index) => (
                <li key={index} className="text-blue-shadeb5">
                  {prerequisite}
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-semibold text-gray-400">
              ไม่มีวิชาที่ต้องผ่านก่อน
            </p> // If no prerequisites
          )}
        </div>

        {/* Corequisite Section */}
        <h3 className="font-semibold my-4 text-start">
          วิชาที่ต้องเรียนคู่กัน (Co-requisite)
        </h3>
        <div className="space-y-2 text-start">
          {courseDetails.corequisite ? (
            <ul className="list-disc ml-5">
              <li className="text-blue-shadeb5">{courseDetails.corequisite}</li>
            </ul>
          ) : (
            <p className="font-semibold text-gray-400">
              ไม่มีวิชาที่ต้องเรียนคู่กัน
            </p> // If no corequisite
          )}
        </div>
      </div>
    </div>
  );
}
