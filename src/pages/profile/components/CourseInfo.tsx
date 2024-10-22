import { useState, useEffect, useMemo, useCallback } from "react";
import { Category, CategoryType } from "../../../types/category";
import useAccountContext from "../../../common/contexts/AccountContext";
import {
  CourseDetail,
  EnrolledCourse,
  EnrolledCourseCycle,
  StudentCurriculum,
} from "../../../types";
import { yearMap, semesterMap } from "../../../common/components/utils/utils";
import { getCourseDetailsByCourseNo } from "../../../common/apis/coursedetails/queries";
import {
  getCategoriesByCurriculumID,
  getCategoryTypes,
} from "../../../common/apis/category/queries";
import {
  CategoryDetailOfCourse,
  getCategoryAnswerFiltered,
  getCategoryDetailOfCourse,
  getDetailOfCategory,
  getDetailOfCategoryType,
} from "../../../common/components/utils/categoryProcess";

interface Props {
  enrolledCourses: EnrolledCourseCycle[];
  studentCurriculum: StudentCurriculum | null;
}

const CourseInfo = ({ enrolledCourses, studentCurriculum }: Props) => {
  const { accountData } = useAccountContext();
  const [courseDetails, setCourseDetails] = useState<
    Record<string, CourseDetail | undefined>
  >({});
  const [categoryData, setCategoryData] = useState<Category | null>(null);
  const [categoryTypesData, setCategoryTypesData] = useState<CategoryType[]>(
    []
  );
  const [selectedYearSemester, setSelectedYearSemester] = useState<{
    year: string | null;
    semester: string | null;
  }>({
    year: "1",
    semester: "1",
  });

  useEffect(() => {
    if (studentCurriculum) {
      getCategoriesByCurriculumID(studentCurriculum.curriculum_id).then(
        (data) => {
          if (data.result) {
            setCategoryData(
              getCategoryAnswerFiltered(data.result, studentCurriculum.answers)
            );
          } else setCategoryData(null);
        }
      );
    }
    getCategoryTypes().then((data) => {
      setCategoryTypesData(data.result ?? []);
    });
  }, [studentCurriculum]);

  // Fetch course details when enrolledCourses change
  useEffect(() => {
    const preparedCourseDetails: Record<string, CourseDetail | undefined> =
      courseDetails;
    if (enrolledCourses) {
      enrolledCourses.forEach((courseGroup) => {
        courseGroup.courses.forEach(async (course) => {
          if (!preparedCourseDetails[course.course_no]) {
            const details = await getCourseDetailsByCourseNo(course.course_no);
            preparedCourseDetails[course.course_no] = details.result;
          }
        });
      });
      setCourseDetails(preparedCourseDetails);
    }
  }, [enrolledCourses, courseDetails]);

  const groupedByYear = useMemo(() => {
    const yearSemesterMap = new Map();
    enrolledCourses
      .sort(
        (a, b) =>
          parseInt(a.year) * 10 +
          parseInt(a.semester) -
          (parseInt(b.year) * 10 + parseInt(b.semester))
      )
      ?.forEach((course) => {
        if (!yearSemesterMap.has(course.year)) {
          yearSemesterMap.set(course.year, new Set());
        }
        yearSemesterMap.get(course.year)?.add(course.semester);
      });
    return Array.from(yearSemesterMap.entries()).map(([year, semesters]) => ({
      year,
      semesters: Array.from(semesters),
    }));
  }, [enrolledCourses]);

  const filteredCourses = useCallback(() => {
    if (!enrolledCourses || !studentCurriculum || !categoryData) return null;

    const filtered = enrolledCourses?.filter(
      (course) =>
        course.year === selectedYearSemester.year &&
        course.semester === selectedYearSemester.semester
    );

    const categoryDetailOfCourses: (CategoryDetailOfCourse & {
      course_no: string;
    })[] = [];

    filtered?.forEach((courseGroup) => {
      courseGroup.courses.forEach((enrolledCourse) => {
        const categoryDetail = getCategoryDetailOfCourse(
          enrolledCourse.course_no,
          categoryData
        );
        if (categoryDetail) {
          categoryDetailOfCourses.push({
            ...categoryDetail,
            course_no: enrolledCourse.course_no,
          });
        }
      });
    });

    const getGroupRank = (courseNo: string): number => {
      const categoryDetail = categoryDetailOfCourses.find(
        (detail) => detail.course_no === courseNo
      );
      if (!categoryDetail) return 999999;
      return (
        (categoryDetail.categoryTypeID ?? 0) * 100000 +
        (categoryDetail.categoryDisplayID ?? 0)
      );
    };

    const sortedCourses = filtered?.map((courseGroup) => ({
      ...courseGroup,
      courses: courseGroup.courses.sort(
        (a, b) => getGroupRank(a.course_no) - getGroupRank(b.course_no)
      ),
    }));

    return sortedCourses;
  }, [
    enrolledCourses,
    studentCurriculum,
    categoryData,
    selectedYearSemester.year,
    selectedYearSemester.semester,
  ]);

  const currentSemesterCourseGroupCredits = useMemo(() => {
    if (!categoryData) return {};
    const categoryDisplayRecord: Record<number, number> = {};
    filteredCourses()?.forEach((courseGroup) => {
      courseGroup.courses.forEach((enrolledCourse) => {
        const categoryDetail = getCategoryDetailOfCourse(
          enrolledCourse.course_no,
          categoryData
        );
        if (enrolledCourse.grade !== "W" && enrolledCourse.grade !== "F") {
          if (categoryDetail) {
            const detail = getDetailOfCategory(
              getCategoryDetailOfCourse(enrolledCourse.course_no, categoryData)
                ?.categoryDisplayID ?? 0,
              categoryData
            )?.id;
            if (categoryDisplayRecord[detail ?? 0]) {
              categoryDisplayRecord[detail ?? 0] += parseFloat(
                enrolledCourse.credit
              );
            } else {
              categoryDisplayRecord[detail ?? 0] = parseFloat(
                enrolledCourse.credit
              );
            }
          }
        }
      });
    });
    return categoryDisplayRecord;
  }, [categoryData, filteredCourses]);

  const allYearCourseGroupCredits = useMemo(() => {
    if (!categoryData) return {};
    const categoryDisplayRecord: Record<number, number> = {};
    enrolledCourses?.forEach((courseGroup) => {
      courseGroup.courses.forEach((enrolledCourse) => {
        const categoryDetail = getCategoryDetailOfCourse(
          enrolledCourse.course_no,
          categoryData
        );
        if (enrolledCourse.grade !== "W" && enrolledCourse.grade !== "F") {
          if (categoryDetail) {
            const detail = getDetailOfCategory(
              getCategoryDetailOfCourse(enrolledCourse.course_no, categoryData)
                ?.categoryDisplayID ?? 0,
              categoryData
            )?.id;
            if (categoryDisplayRecord[detail ?? 0]) {
              categoryDisplayRecord[detail ?? 0] += parseFloat(
                enrolledCourse.credit
              );
            } else {
              categoryDisplayRecord[detail ?? 0] = parseFloat(
                enrolledCourse.credit
              );
            }
          }
        }
      });
    });

    return categoryDisplayRecord;
  }, [categoryData, enrolledCourses]);

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
      case "W":
        return 0.0;
      default:
        return 0.0;
    }
  };

  const sumOfCredits = useMemo(() => {
    if (!filteredCourses()?.length) return 0;
    return filteredCourses()?.reduce((total: number, course) => {
      return (
        total +
        course.courses.reduce((sum: number, enrolledCourse: EnrolledCourse) => {
          if (enrolledCourse.grade !== "W" && enrolledCourse.grade !== "F") {
            return sum + parseFloat(enrolledCourse.credit);
          }
          return sum;
        }, 0)
      );
    }, 0);
  }, [filteredCourses]);

  const averageGrade = useMemo(() => {
    if (!filteredCourses()?.length) return 0;

    let totalGradePoints = 0;
    let totalCredits = 0;

    filteredCourses()?.forEach((course) => {
      course.courses.forEach((enrolledCourse) => {
        const gradeValue = gradeToNumber(enrolledCourse.grade);
        const credit = parseFloat(enrolledCourse.credit);

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

  return (
    <>
      <div className="flex flex-row justify-center gap-8">
        <div className="flex flex-col my-4">
          <div className="flex flex-col mt-6 ml-8 bg-blue-shadeb05 p-2 rounded-[20px]">
            {groupedByYear.map(({ year, semesters }) => (
              <div key={year} className="flex flex-col">
                {semesters.map((semester) => (
                  <button
                    key={`${year}-${semester}`}
                    onClick={() =>
                      handleYearSemesterChange(
                        year as string,
                        semester as string
                      )
                    }
                    className={`m-[5px] rounded-[10px] h-[36px] text-center text-[12.5px] w-[150px] ${
                      selectedYearSemester.year === year &&
                      selectedYearSemester.semester === semester
                        ? "bg-blue-shadeb5 text-white"
                        : "bg-white text-blue-shadeb5 hover:bg-blue-shadeb3 hover:text-white hover:border-blue-shadeb2"
                    } border border-solid border-gray-400`}
                  >
                    {"ภาคเรียนที่ " +
                      semester +
                      "/" +
                      (Number(
                        accountData?.studentData?.code
                          ?.toString()
                          ?.substring(0, 2) ?? "0"
                      ) +
                        (Number(year) - 1))}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-row mt-10">
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
                <th className="border-b border-blue-shadeb05 w-[250px] px-4 py-2 text-center rounded-tr-[18px]">
                  หมวดหมู่
                </th>
              </tr>
            </thead>
            {categoryData &&
              filteredCourses()?.map((course) => (
                <tbody key={`${course.year}-${course.semester}`}>
                  {course.courses.map((enrolledCourse, index) => (
                    <tr
                      key={enrolledCourse.course_no}
                      className={`border-b border-gray-300 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-100"
                      } hover:bg-blue-shadeb1 hover:scale-105 text-sm duration-200 transition-all cursor-default`}
                    >
                      <td className="px-4 py-2 text-center">
                        {enrolledCourse.course_no}
                      </td>
                      <td className="px-4 py-2 text-left">
                        {courseDetails[enrolledCourse.course_no]
                          ?.title_long_en || "Loading..."}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {enrolledCourse.credit}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {enrolledCourse.grade}
                      </td>
                      <td className="px-4 py-2 text-center flex items-center justify-center">
                        <>
                          <div
                            style={{
                              backgroundColor: `${
                                getDetailOfCategory(
                                  getCategoryDetailOfCourse(
                                    enrolledCourse.course_no,
                                    categoryData
                                  )?.categoryDisplayID ?? 0,
                                  categoryData
                                )?.primary_color
                              }`,
                              borderColor: `${
                                getDetailOfCategory(
                                  getCategoryDetailOfCourse(
                                    enrolledCourse.course_no,
                                    categoryData
                                  )?.categoryDisplayID ?? 0,
                                  categoryData
                                )?.primary_color
                              }`,
                            }}
                            className="inline-block px-2 text-sm w-[50px] font-medium text-white rounded-l-[10px] border border-solid "
                          >
                            {
                              getDetailOfCategoryType(
                                getCategoryDetailOfCourse(
                                  enrolledCourse.course_no,
                                  categoryData
                                )?.categoryTypeID ?? 0,
                                categoryTypesData
                              )?.short_name
                            }
                          </div>
                          <div
                            style={{
                              backgroundColor: `${
                                getDetailOfCategory(
                                  getCategoryDetailOfCourse(
                                    enrolledCourse.course_no,
                                    categoryData
                                  )?.categoryDisplayID ?? 0,
                                  categoryData
                                )?.secondary_color
                              }`,
                              borderColor: `${
                                getDetailOfCategory(
                                  getCategoryDetailOfCourse(
                                    enrolledCourse.course_no,
                                    categoryData
                                  )?.categoryDisplayID ?? 0,
                                  categoryData
                                )?.primary_color
                              }`,
                            }}
                            className="inline-block pl-2 w-[120px] text-left text-sm font-medium rounded-r-[10px] border border-solid truncate"
                          >
                            {
                              getDetailOfCategory(
                                getCategoryDetailOfCourse(
                                  enrolledCourse.course_no,
                                  categoryData
                                )?.categoryDisplayID ?? 0,
                                categoryData
                              )?.name_en
                            }
                          </div>
                        </>
                        {/* {(() => {
												const courseGroup = getLookupForCourse(
													enrolledCourse.course_no
												);
												if (
													courseGroup === "Core" ||
													courseGroup === "Major Required" ||
													courseGroup === "Major Elective"
												) {
													return (
														<>
															<div className="inline-block px-2 text-sm w-[50px] font-medium text-white bg-blue-shadeb4 rounded-l-[10px] border border-solid border-blue-shadeb4">
																Major
															</div>
															<div className="inline-block pl-2 w-[100px] text-left text-sm font-medium bg-blue-shadeb1 rounded-r-[10px] text-blue-shadeb5 border border-solid border-blue-shadeb5">
																{courseGroup.replace("Major ", "")}
															</div>
														</>
													);
												}
												if (
													courseGroup === "Learner Person" ||
													courseGroup === "Innovative Co-creator" ||
													courseGroup === "Active Citizen" ||
													courseGroup === "GE Elective"
												) {
													return (
														<>
															<div className="inline-block px-2 text-sm w-[40px] font-medium text-yellow-700 bg-yellow-400 rounded-l-[10px] border border-solid border-yellow-300">
																GE
															</div>
															<div className="inline-block px-2 w-max text-left text-sm font-medium bg-yellow-50 rounded-r-[10px] text-yellow-700 border border-solid border-yellow-300">
																{courseGroup}
															</div>
														</>
													);
												}
												return (
													<div className="inline-block px-2 text-sm w-[150px] font-medium text-black bg-gray-200 rounded-[10px] border border-solid border-gray-400">
														{courseGroup}
													</div>
												);
											})()} */}
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
      <div className="flex flex-row justify-center gap-10 mt-4">
        {/* Summary for the current year and semester */}
        <div className="flex flex-col items-center mt-6 bg-white p-4 rounded-[20px] border-2 w-[300px]">
          <h2 className="text-xl text-center font-bold text-blue-shadeb5 bg-blue-shadeb05 px-4 rounded-[20px] w-[200px]">
            {yearMap[selectedYearSemester.year || "1"]}
          </h2>
          <p className="text-sm font-light text-blue-shadeb6 mb-4 bg-blue-shadeb05 px-4 rounded-b-[20px]">
            {semesterMap[selectedYearSemester.semester || "1"]}
          </p>
          {categoryData &&
            Object.entries(currentSemesterCourseGroupCredits).map(
              ([categoryId, credits]) => {
                const category = getDetailOfCategory(
                  parseInt(categoryId),
                  categoryData
                );
                const bgColor = category?.primary_color;
                const textColor = category?.secondary_color;

                return (
                  <div
                    key={categoryId}
                    style={{ backgroundColor: bgColor }}
                    className={`flex justify-between items-center mb-2 w-full p-2 rounded-[10px]`}
                  >
                    <span
                      style={{ color: textColor }}
                      className={`text-sm font-medium`}
                    >
                      {
                        getDetailOfCategory(parseInt(categoryId), categoryData)
                          ?.name_en
                      }
                    </span>
                    <span
                      style={{ color: textColor }}
                      className={`text-sm font-semibold ${textColor}`}
                    >
                      {credits} credits
                    </span>
                  </div>
                );
              }
            )}
        </div>

        {/* Summary for all years */}
        <div className="flex flex-col items-center mt-6 bg-white p-4 rounded-[20px] border-2 w-[450px]">
          <h2 className="text-xl font-bold text-blue-shadeb5 mb-6 bg-blue-shadeb05 px-4 rounded-[20px]">
            สรุปหน่วยกิตทั้งหมด
          </h2>
          {categoryData &&
            Object.entries(allYearCourseGroupCredits).map(
              ([categoryId, credits]) => {
                const category = getDetailOfCategory(
                  parseInt(categoryId),
                  categoryData
                );
                const bgColor = category?.primary_color;
                const textColor = category?.secondary_color;

                return (
                  <div
                    key={categoryId}
                    style={{ backgroundColor: bgColor }}
                    className={`flex justify-between items-center mb-2 w-full p-2 rounded-[10px]`}
                  >
                    <span
                      style={{ color: textColor }}
                      className={`text-sm font-medium`}
                    >
                      {
                        getDetailOfCategory(parseInt(categoryId), categoryData)
                          ?.name_en
                      }
                    </span>
                    <span
                      style={{ color: textColor }}
                      className={`text-sm font-semibold ${textColor}`}
                    >
                      {credits} credits
                    </span>
                  </div>
                );
              }
            )}{" "}
          <div
            className={`flex justify-between items-center mb-2 w-full p-2 rounded-[10px] bg-amber-400`}
          >
            <span className={`text-sm font-medium `}>Total Credits</span>
            <span className={`text-sm font-semibold `}>
              {Object.values(allYearCourseGroupCredits).reduce(
                (acc, credits) => acc + credits,
                0
              )}{" "}
              credits
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseInfo;
