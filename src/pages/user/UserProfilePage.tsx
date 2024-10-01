import { PageContainer } from "../../common/components/container/PageContainer";
import FitContainer from "../../common/components/container/FitContainer";
import useAccountContext from "../../common/contexts/AccountContext";
import { coreApi } from "../../core/connections";
import { useEffect, useMemo, useState, useCallback } from "react";
import React from "react";
import { CourseDetails } from "../../common/components/dialogues/contents/coursedetail";
import { getCourseDetailByCourseNo } from "../../common/components/utils/courseDetail";
import ContainerWithoutHeader from "../../common/components/container/WithoutHeaderContainer";

type ApiResponse = {
  success: boolean;
  message: string;
  result: MappingEnrolledCourse[];
};

type EnrolledCourse = {
  CourseNo: string;
  Credit: string;
  Grade: string;
};

type MappingEnrolledCourse = {
  Year: string;
  Semester: string;
  Courses: EnrolledCourse[];
};

async function getEnrolledCourses(): Promise<ApiResponse> {
  try {
    const response = await coreApi.get(
      `http://10.10.182.135:8000/api/v1/enrolled-courses`
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch enrolled courses.");
  }
}

const GeneralInfo = () => {
  const { accountData } = useAccountContext();

  return (
    <div className="flex bg-[#ECEEFA] rounded-t-[20px] shadow-[20px] items-center justify-center bg-cover bg-bottom bg-[url('/imgs/ClockBG.svg')] w-[1300px] h-full p-8">
      <div className="flex flex-row items-center">
        <div className="drop-shadow-[10px] rounded-[20px] backdrop-blur-md w-full items-center jusify-center bg-white/10 px-16">
          <div className="flex flex-row items-center justify-center">
            <img
              src="/imgs/ProfilePics.png"
              width="150px"
              className="my-5 mx-2 rounded-full"
              alt="Profile"
            />
            <div className="items-center justify-center">
              <p className="text-lg font-medium mb-4 text-white">
                {accountData?.userData?.firstname}{" "}
                {accountData?.userData?.lastname}
              </p>
              <h1 className="text-lg font-medium mb-4 text-white">
                {accountData?.studentData?.code}
              </h1>
              <h4 className="px-4 text-sm font-normal bg-blue-shadeb5 rounded-lg text-white w-min-full h-[20px] text-center">
                {accountData?.studentData?.major_id || "ไม่มีข้อมูล"}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseInfo = () => {
  const { accountData } = useAccountContext();
  const [enrolledCourses, setEnrolledCourses] = useState<
    MappingEnrolledCourse[] | null
  >(null);
  const [courseDetails, setCourseDetails] = useState<
    Record<string, CourseDetails>
  >({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYearSemester, setSelectedYearSemester] = useState<{
    year: string | null;
    semester: string | null;
  }>({ year: "1", semester: "1" });

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const data = await getEnrolledCourses();
        setEnrolledCourses(data.result);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
        setLoading(false);
      }
    };
    fetchEnrolledCourses();
  }, []);

  // Fetch course details for each course
  useEffect(() => {
    if (enrolledCourses) {
      enrolledCourses.forEach((courseGroup) => {
        courseGroup.Courses.forEach(async (course) => {
          if (!courseDetails[course.CourseNo]) {
            const details = await getCourseDetailByCourseNo(course.CourseNo);
            setCourseDetails((prevDetails) => ({
              ...prevDetails,
              [course.CourseNo]: details,
            }));
          }
        });
      });
    }
  }, [enrolledCourses, courseDetails]);

  // Group courses by year and semester
  const groupedByYear = useMemo(() => {
    const yearSemesterMap = new Map();
    enrolledCourses?.forEach((course) => {
      if (!yearSemesterMap.has(course.Year)) {
        yearSemesterMap.set(course.Year, new Set());
      }
      yearSemesterMap.get(course.Year).add(course.Semester);
    });
    return Array.from(yearSemesterMap.entries()).map(([year, semesters]) => ({
      year,
      semesters: Array.from(semesters),
    }));
  }, [enrolledCourses]);

  const filteredCourses = useMemo(() => {
    if (selectedYearSemester.year && selectedYearSemester.semester) {
      return (
        enrolledCourses?.filter(
          (course) =>
            course.Year === selectedYearSemester.year &&
            course.Semester === selectedYearSemester.semester
        ) || null
      );
    }
    return enrolledCourses;
  }, [enrolledCourses, selectedYearSemester]);

  const gradeToNumber = (grade: string): number => {
    switch (grade) {
      case "A":
        return 4.0;
      case "B+":
        return 3.5;
      case "B":
        return 3.0;
      case "C+":
        return 2.5;
      case "C":
        return 2.0;
      case "D+":
        return 1.5;
      case "D":
        return 1.0;
      case "F":
        return 0.0;
      case "W":
        return 0.0; // For withdrawn courses
      default:
        return 0.0; // Default to 0 for unknown grades
    }
  };

  // Calculate sum of credits for the selected year and semester
  const sumOfCredits = useMemo(() => {
    if (!filteredCourses?.length) return 0;
    return filteredCourses.reduce((total: number, course) => {
      return (
        total +
        course.Courses.reduce((sum: number, enrolledCourse: EnrolledCourse) => {
          return sum + parseFloat(enrolledCourse.Credit);
        }, 0)
      );
    }, 0);
  }, [filteredCourses]);

  // Calculate the average grade based on the total grade-credit product and total credits
  const averageGrade = useMemo(() => {
    if (!filteredCourses?.length) return 0;

    let totalGradePoints = 0;
    let totalCredits = 0;

    filteredCourses.forEach((course) => {
      course.Courses.forEach((enrolledCourse) => {
        const gradeValue = gradeToNumber(enrolledCourse.Grade);
        const credit = parseFloat(enrolledCourse.Credit);

        // Include only valid grades and credits
        if (
          !isNaN(gradeValue) &&
          gradeValue > 0 &&
          !isNaN(credit) &&
          credit > 0
        ) {
          totalGradePoints += gradeValue * credit;
          totalCredits += credit;
        }
      });
    });

    return totalCredits > 0 ? totalGradePoints / totalCredits : 0;
  }, [filteredCourses]);

  const handleYearSemesterChange = useCallback(
    (year: string, semester: string) => {
      setSelectedYearSemester({ year, semester });
    },
    []
  );

  if (loading) return <div>Loading courses...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-row justify-center gap-8">
      <div className="flex flex-col my-4">
        <div className="flex flex-col mt-6">
          {groupedByYear.map(({ year, semesters }) => (
            <div key={year} className="flex flex-col">
              {semesters.map((semester) => (
                <button
                  key={`${year}-${semester}`}
                  onClick={() =>
                    handleYearSemesterChange(year as string, semester as string)
                  }
                  className={`m-[5px] rounded-[10px] h-[36px] text-center text-[12.5px] w-[150px] ${
                    selectedYearSemester.year === year &&
                    selectedYearSemester.semester === semester
                      ? "bg-blue-shadeb5 text-white"
                      : "bg-white text-blue-shadeb5 transition duration-100 hover:bg-blue-shadeb05 hover:border-blue-shadeb2"
                  } border border-solid border-gray-400`}
                >
                  {"ภาคเรียนที่  " +
                    semester +
                    "/" +
                    (Number(
                      accountData?.studentData?.code
                        ?.toString()
                        .substring(0, 2) ?? "0"
                    ) +
                      (Number(year) - 1))}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-row mt-10 top-0 ml-8">
        <table className="table-auto rounded-[20px] w-fit mr-8">
          <thead className="bg-blue-shadeb05 text-blue-shadeb5 text-md">
            <tr>
              <th className="border-b border-blue-shadeb05 w-max px-8 py-2 text-center rounded-tl-[18px]">
                รหัสวิชา
              </th>
              <th className="border-b border-blue-shadeb05 px-4 w-[450px] py-2 text-left">
                ชื่อวิชา
              </th>
              <th className="border-b border-blue-shadeb05 w-[40px] px-4 py-2 text-center">
                หน่วยกิต
              </th>
              <th className="border-b border-blue-shadeb05 w-[40px] px-4 py-2 text-center">
                เกรด
              </th>
              <th className="border-b border-blue-shadeb05 w-[200px] px-4 py-2 text-center rounded-tr-[18px]">
                หมวดหมู่
              </th>
            </tr>
          </thead>
          {filteredCourses?.map((course, courseIndex) => (
            <tbody key={`${course.Year}-${course.Semester}`}>
              {course.Courses.map((enrolledCourse) => (
                <tr
                  key={enrolledCourse.CourseNo}
                  className={`border-b border-gray-300 ${
                    courseIndex % 2 === 0 ? "bg-white" : "bg-gray-100"
                  } transition duration-300 ease-in-out hover:bg-blue-shadeb1 bg-opacity-70 hover:scale-105 text-sm`}
                >
                  <td className="px-4 py-2 text-center">
                    {enrolledCourse.CourseNo}
                  </td>
                  <td className="px-4 py-2 text-left">
                    {courseDetails[enrolledCourse.CourseNo]?.title_long_en ||
                      "Loading..."}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {enrolledCourse.Credit}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {enrolledCourse.Grade}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {courseDetails[enrolledCourse.CourseNo]?.category || "N/A"}
                  </td>
                </tr>
              ))}
              <tr className="bg-blue-shadeb05 text-blue-shadeb5 text-sm">
                <td
                  className="px-4 py-2 text-right rounded-bl-[18px] font-bold"
                  colSpan={2}
                >
                  หน่วยกิตรวม
                </td>
                <td className="px-4 py-2 text-center font-bold">
                  {sumOfCredits}
                </td>
                <td className="px-4 py-2 text-center font-bold" colSpan={1}>
                  {averageGrade.toFixed(2)}
                </td>
                <td
                  className="px-4 py-2 text-center rounded-br-[18px]"
                  colSpan={1}
                ></td>
              </tr>
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
};

function UserPage() {
  return (
    <PageContainer>
      <FitContainer>
        <GeneralInfo />
        <div className="py-10">
          <p className="text-center text-xl">ข้อมูลการลงทะเบียนเรียน</p>
          <CourseInfo />
        </div>
      </FitContainer>
    </PageContainer>
  );
}

export default UserPage;
