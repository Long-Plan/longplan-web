import { useState, useEffect, useMemo, useCallback } from "react";
import useAccountContext from "../../contexts/AccountContext";
import { CourseDetails } from "../../../types/course";
import { getCourseDetailByCourseNo } from "../../apis/coursedetails/queries";
import {
  EnrolledCourse,
  MappingEnrolledCourse,
} from "../../../types/enrolledcourse";
import { Category, mapCategoriesToTypes } from "../utils/mappingCategory";
import { getEnrolledCourses } from "../../apis/enrolledcourse/queries";

const CourseInfo = () => {
  const { accountData } = useAccountContext();
  const [enrolledCourses, setEnrolledCourses] = useState<
    MappingEnrolledCourse[] | null
  >(null);
  const [courseDetails, setCourseDetails] = useState<
    Record<string, CourseDetails>
  >({});
  const [category, setCategory] = useState<
    (Category & { type_name: string }) | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYearSemester, setSelectedYearSemester] = useState<{
    year: string | null;
    semester: string | null;
  }>({
    year: "1",
    semester: "1",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const enrolledResponse = await getEnrolledCourses();
        const categoryData = await mapCategoriesToTypes();
        setEnrolledCourses(enrolledResponse);
        setCategory(categoryData);
        console.log(categoryData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch course details when enrolledCourses change
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

  const lookupTable: Record<string, string[]> = {
    "Learner Person": ["Learner Person"],
    "Innovative Co-creator": ["Innovative Co-creator"],
    "Active Citizen": ["Active Citizen"],
    "GE Elective": ["Elective from 3 Categories"],
    Core: ["Core Courses"],
    "Major Required": ["Required Courses"],
    "Major Elective": ["Major Electives"],
  };

  const findGroupByCategoryName = (categoryName: string): string | null => {
    for (const [groupType, keywords] of Object.entries(lookupTable)) {
      if (keywords.some((keyword) => categoryName.includes(keyword))) {
        return groupType;
      }
    }
    return null;
  };

  interface CategoryWithParentAndGrandparent {
    grandParent: Category | null;
    parent: Category | null;
    category: Category;
  }

  const findGroupByCourseNo = (
    courseNo: string
  ): CategoryWithParentAndGrandparent | null => {
    if (!category) {
      return null;
    }

    const findCategory = (
      category: Category,
      parent: Category | null = null,
      grandParent: Category | null = null
    ): CategoryWithParentAndGrandparent | undefined => {
      if (category.courses?.includes(courseNo)) {
        return { grandParent, parent, category };
      }

      if (category.child_categories) {
        for (const childCategory of category.child_categories) {
          const foundCategory = findCategory(
            childCategory as Category,
            category,
            parent
          );
          if (foundCategory) {
            return foundCategory;
          }
        }
      }
      return undefined;
    };

    return findCategory(category) || null;
  };

  const getLookupForCourse = (courseNo: string): string | null => {
    const result = findGroupByCourseNo(courseNo);

    if (result) {
      const { category, parent, grandParent } = result;

      const categoryGroup = findGroupByCategoryName(category.name_en);
      if (categoryGroup && parent?.name_en != "Elective from 3 Categories")
        return categoryGroup;

      if (parent) {
        const parentGroup = findGroupByCategoryName(parent.name_en);
        if (parentGroup) return parentGroup;
      }

      if (grandParent) {
        const grandParentGroup = findGroupByCategoryName(grandParent.name_en);
        if (grandParentGroup) return grandParentGroup;
      }
    }

    return "Free Elective";
  };

  const groupedByYear = useMemo(() => {
    const yearSemesterMap = new Map();
    enrolledCourses?.forEach((course) => {
      if (!yearSemesterMap.has(course.Year)) {
        yearSemesterMap.set(course.Year, new Set());
      }
      yearSemesterMap.get(course.Year)?.add(course.Semester);
    });
    return Array.from(yearSemesterMap.entries()).map(([year, semesters]) => ({
      year,
      semesters: Array.from(semesters),
    }));
  }, [enrolledCourses]);

  const filteredCourses = useMemo(() => {
    if (!enrolledCourses) return null;

    const groupOrder: Record<string, number> = {
      "Learner Person": 1,
      "Innovative Co-creator": 2,
      "Active Citizen": 3,
      "GE Elective": 4,
      Core: 5,
      "Major Required": 6,
      "Major Elective": 7,
      "Free Elective": 8,
    };

    const getGroupRank = (courseNo: string): number => {
      const group = getLookupForCourse(courseNo);
      return group ? groupOrder[group] || 9 : 9; // Default rank if not found
    };

    const filtered = enrolledCourses?.filter(
      (course) =>
        course.Year === selectedYearSemester.year &&
        course.Semester === selectedYearSemester.semester
    );

    // Sort the filtered courses by group rank
    const sortedCourses = filtered?.map((courseGroup) => ({
      ...courseGroup,
      Courses: courseGroup.Courses.sort(
        (a, b) => getGroupRank(a.CourseNo) - getGroupRank(b.CourseNo)
      ),
    }));

    return sortedCourses;
  }, [enrolledCourses, selectedYearSemester]);

  // Summary of credits for current year and semester
  const currentSemesterCourseGroupCredits = useMemo(() => {
    const groupCredits: Record<string, number> = {
      "Learner Person": 0,
      "Innovative Co-creator": 0,
      "Active Citizen": 0,
      "GE Elective": 0,
      Core: 0,
      "Major Required": 0,
      "Major Elective": 0,
      "Free Elective": 0,
    };

    filteredCourses?.forEach((courseGroup) => {
      courseGroup.Courses.forEach((enrolledCourse) => {
        const group = getLookupForCourse(enrolledCourse.CourseNo);
        if (group && groupCredits[group] !== undefined) {
          groupCredits[group] += parseFloat(enrolledCourse.Credit);
        }
      });
    });

    return groupCredits;
  }, [filteredCourses]);

  // Summary of credits for all years
  const allYearCourseGroupCredits = useMemo(() => {
    const groupCredits: Record<string, number> = {
      "Learner Person": 0,
      "Innovative Co-creator": 0,
      "Active Citizen": 0,
      "GE Elective": 0,
      Core: 0,
      "Major Required": 0,
      "Major Elective": 0,
      "Free Elective": 0,
    };

    enrolledCourses?.forEach((courseGroup) => {
      courseGroup.Courses.forEach((enrolledCourse) => {
        const group = getLookupForCourse(enrolledCourse.CourseNo);
        if (group && groupCredits[group] !== undefined) {
          groupCredits[group] += parseFloat(enrolledCourse.Credit);
        }
      });
    });

    return groupCredits;
  }, [enrolledCourses]);

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

  const averageGrade = useMemo(() => {
    if (!filteredCourses?.length) return 0;

    let totalGradePoints = 0;
    let totalCredits = 0;

    filteredCourses.forEach((course) => {
      course.Courses.forEach((enrolledCourse) => {
        const gradeValue = gradeToNumber(enrolledCourse.Grade);
        const credit = parseFloat(enrolledCourse.Credit);

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

  if (loading)
    return <div className="text-center text-xl p-10">Loading courses...</div>;
  if (error) return <div>Error: {error}</div>;

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
                        : "bg-white text-blue-shadeb5 hover:bg-blue-shadeb05 hover:border-blue-shadeb2"
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
            {filteredCourses?.map((course) => (
              <tbody key={`${course.Year}-${course.Semester}`}>
                {course.Courses.map((enrolledCourse, index) => (
                  <tr
                    key={enrolledCourse.CourseNo}
                    className={`border-b border-gray-300 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-100"
                    } hover:bg-blue-shadeb1 hover:scale-105 text-sm duration-200 transition-all cursor-default`}
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
                      {(() => {
                        const courseGroup = getLookupForCourse(
                          enrolledCourse.CourseNo
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
                      })()}
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
      <div className="flex flex-row justify-center gap-10">
        {/* Summary for the current year and semester */}
        <div className="flex flex-col items-center mt-6 bg-blue-shadeb05 p-4 rounded-[20px] shadow-md w-[300px]">
          <h2 className="text-lg font-bold text-blue-shadeb5 mb-4">
            year {selectedYearSemester.year} semester{" "}
            {selectedYearSemester.semester}
          </h2>
          {Object.entries(currentSemesterCourseGroupCredits).map(
            ([group, credits]) => {
              let bgColor = "bg-gray-200";
              let textColor = "text-black";

              if (credits === 0) {
                bgColor = "bg-gray-300";
                textColor = "text-gray-500";
              } else if (
                group.includes("Learner Person") ||
                group.includes("GE Elective") ||
                group.includes("Active Citizen") ||
                group.includes("Innovative Co-creator")
              ) {
                bgColor = "bg-yellow-50";
                textColor = "text-yellow-700";
              } else if (group.includes("Major") || group.includes("Core")) {
                bgColor = "bg-blue-shadeb1";
                textColor = "text-blue-shadeb5";
              } else if (group === "Free Elective") {
                bgColor = "bg-gray-300";
                textColor = "text-black";
              }

              return (
                <div
                  key={group}
                  className={`flex justify-between items-center mb-2 w-full ${bgColor} p-2 rounded-[10px]`}
                >
                  <span className={`text-sm font-medium ${textColor}`}>
                    {group}
                  </span>
                  <span className={`text-sm font-semibold ${textColor}`}>
                    {credits} credits
                  </span>
                </div>
              );
            }
          )}
        </div>

        {/* Summary for all years */}
        <div className="flex flex-col items-center mt-6 bg-blue-shadeb05 p-4 rounded-[20px] shadow-md w-[400px]">
          <h2 className="text-lg font-bold text-blue-shadeb5 mb-4">
            Total Credits Summary
          </h2>
          {Object.entries(allYearCourseGroupCredits).map(([group, credits]) => {
            let bgColor = "bg-gray-200";
            let textColor = "text-black";

            if (credits === 0) {
              bgColor = "bg-gray-300";
              textColor = "text-gray-500";
            } else if (
              group.includes("Learner Person") ||
              group.includes("GE Elective") ||
              group.includes("Active Citizen") ||
              group.includes("Innovative Co-creator")
            ) {
              bgColor = "bg-yellow-50";
              textColor = "text-yellow-700";
            } else if (group.includes("Major") || group.includes("Core")) {
              bgColor = "bg-blue-shadeb1";
              textColor = "text-blue-shadeb5";
            } else if (group === "Free Elective") {
              bgColor = "bg-gray-300";
              textColor = "text-black";
            }

            return (
              <div
                key={group}
                className={`flex justify-between items-center mb-2 w-full ${bgColor} p-2 rounded-[10px]`}
              >
                <span className={`text-sm font-medium ${textColor}`}>
                  {group}
                </span>
                <span className={`text-sm font-semibold ${textColor}`}>
                  {credits} credits
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CourseInfo;
