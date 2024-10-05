import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import InfoModal from "./InfoModal";
import { useEffect, useMemo, useState } from "react";
import { Category, mapCategoriesToTypes } from "../utils/mappingCategory";
import {
  EnrolledCourse,
  getEnrolledCourses,
  MappingEnrolledCourse,
} from "../utils/enrolledCourse";

import SummaryBox from "../summaryBox/SummaryBox";
import SubjectBox from "../subjectbox/subjectbox";
import {
  ActBox,
  CoCreBox,
  CoreBox,
  FreeBox,
  GeBox,
  LearnerBox,
  MajorBox,
} from "../subjectbox/stylebox";
import { CourseDetails } from "../dialogues/contents/coursedetail";
import {
  Courses,
  getCourseDetailByCourseNo,
  getCourseDetailByCurriculumID,
} from "../utils/courseDetail";
import { group } from "console";
import { semesterMap, yearMap } from "../utils/utils";
import BlankBox from "../subjectbox/blankbox";

function Diagram() {
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<
    (Category & { type_name: string }) | null
  >(null);
  const [enrolledCourses, setEnrolledCourses] = useState<
    MappingEnrolledCourse[]
  >([]);
  const [courseDetails, setCourseDetails] = useState<Record<string, Courses>>(
    {}
  );
  const [courseDetailsFree, setCourseDetailsFree] = useState<
    Record<string, CourseDetails>
  >({});
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data: enrolled courses and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrolledData, categoryData] = await Promise.all([
          getEnrolledCourses(),
          mapCategoriesToTypes(),
        ]);
        setEnrolledCourses(enrolledData);
        setCategory(categoryData);
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

  // Fetch course details for both "Curriculum" and "Free" groups
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (enrolledCourses.length === 0) return;

      const courseNos = enrolledCourseFree.map((course) => course?.CourseNo);

      try {
        const [curriculumDetails, freeDetails] = await Promise.all([
          getCourseDetailByCurriculumID("1"),
          Promise.all(courseNos.map(getCourseDetailByCourseNo)),
        ]);

        // Organize curriculum details by course number
        const courseDetailsMap: Record<string, any> = {};
        curriculumDetails.forEach((course) => {
          courseDetailsMap[course.course_no] = course;
        });
        setCourseDetails(courseDetailsMap);

        // Map the free course details by course number
        const freeDetailsMap: Record<string, any> = {};
        freeDetails.forEach((detail, index) => {
          freeDetailsMap[courseNos[index]] = detail;
        });
        setCourseDetailsFree(freeDetailsMap);
      } catch (error) {
        console.error("Failed to fetch course details:", error);
      }
    };

    fetchCourseDetails();
  }, [enrolledCourses]);

  console.log("courseDetailsMajor", courseDetails);
  console.log("courseDetailsFree", courseDetailsFree);

  const lookupTable: Record<string, string[]> = {
    "Learner Person": ["Learner Person"],
    "Innovative Co-creator": ["Innovative Co-creator"],
    "Active Citizen": ["Active Citizen"],
    "GE Elective": ["Elective from 3 Categories"],
    Core: ["Core Courses"],
    "Major Required": ["Required Courses"],
    "Major Elective": ["Major Electives"],
    "Free Elective": ["Free Electives"],
  };

  const lookupTableMainGroup: Record<string, string[]> = {
    GE: [
      "Learner Person",
      "Innovative Co-creator",
      "Active Citizen",
      "Elective from 3 Categories",
    ],
    MAJOR: ["Required Courses", "Major Electives", "Core Courses"],
    FREE: ["Free Electives"],
  };

  const findGroupByCategoryName = (categoryName: string): string | null => {
    for (const [groupType, keywords] of Object.entries(lookupTable)) {
      if (keywords.some((keyword) => categoryName.includes(keyword))) {
        return groupType;
      }
    }
    return null;
  };

  const findMainGroupByCategoryName = (categoryName: string): string | null => {
    for (const [groupType, keywords] of Object.entries(lookupTableMainGroup)) {
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

  const getLookupMainForCourse = (courseNo: string): string | null => {
    const result = findGroupByCourseNo(courseNo);

    if (result) {
      const { category, parent, grandParent } = result;

      const categoryGroup = findMainGroupByCategoryName(category.name_en);
      if (categoryGroup && parent?.name_en != "Elective from 3 Categories")
        return categoryGroup;

      if (parent) {
        const parentGroup = findMainGroupByCategoryName(parent.name_en);
        if (parentGroup) return parentGroup;
      }

      if (grandParent) {
        const grandParentGroup = findMainGroupByCategoryName(
          grandParent.name_en
        );
        if (grandParentGroup) return grandParentGroup;
      }
    }

    return "FREE";
  };

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

  const categoryCredits = useMemo(() => {
    if (!category) return null;

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

    const lookupTable: Record<string, string[]> = {
      "Learner Person": ["Learner Person"],
      "Innovative Co-creator": ["Innovative Co-creator"],
      "Active Citizen": ["Active Citizen"],
      "GE Elective": ["Elective from 3 Categories"],
      Core: ["Core Courses"],
      "Major Required": ["Required Courses"],
      "Major Elective": ["Major Electives"],
      "Free Elective": ["Free Electives"],
    };

    // Function to find the appropriate group using lookupTable
    const findGroupByCategoryName = (categoryName: string): string | null => {
      for (const [groupType, keywords] of Object.entries(lookupTable)) {
        if (keywords.some((keyword) => categoryName.includes(keyword))) {
          return groupType;
        }
      }
      return null;
    };

    const calculateCreditsFromCategory = (currentCategory: Category) => {
      const group = findGroupByCategoryName(currentCategory.name_en);
      if (group && groupCredits[group] !== undefined) {
        groupCredits[group] += currentCategory.credit;
      }

      // Traverse child categories if they exist
      if (currentCategory.child_categories) {
        currentCategory.child_categories.forEach((childCategory) => {
          calculateCreditsFromCategory(childCategory);
        });
      }
    };

    // Start calculation from the main category
    calculateCreditsFromCategory(category);

    return groupCredits;
  }, [category]);

  const combinedCredits = useMemo(() => {
    // Initialize result structure
    const groupCredits: Record<
      string,
      { groupName: string; earnedCredits: number; totalCredit: number }
    > = {
      "Learner Person": {
        groupName: "Learner Person",
        earnedCredits: 0,
        totalCredit: 0,
      },
      "Innovative Co-creator": {
        groupName: "Innovative Co-creator",
        earnedCredits: 0,
        totalCredit: 0,
      },
      "Active Citizen": {
        groupName: "Active Citizen",
        earnedCredits: 0,
        totalCredit: 0,
      },
      "GE Elective": {
        groupName: "GE Elective",
        earnedCredits: 0,
        totalCredit: 0,
      },
      Core: { groupName: "Core", earnedCredits: 0, totalCredit: 0 },
      "Major Required": {
        groupName: "Major Required",
        earnedCredits: 0,
        totalCredit: 0,
      },
      "Major Elective": {
        groupName: "Major Elective",
        earnedCredits: 0,
        totalCredit: 0,
      },
    };

    // Calculate earnedCredits from enrolled courses
    enrolledCourses?.forEach((courseGroup) => {
      courseGroup.Courses.forEach((enrolledCourse) => {
        const group = getLookupForCourse(enrolledCourse.CourseNo);
        if (group && groupCredits[group]) {
          groupCredits[group].earnedCredits += parseFloat(
            enrolledCourse.Credit
          );
        }
      });
    });

    // Calculate totalCredits from category structure
    const lookupTable: Record<string, string[]> = {
      "Learner Person": ["Learner Person"],
      "Innovative Co-creator": ["Innovative Co-creator"],
      "Active Citizen": ["Active Citizen"],
      "GE Elective": ["Elective from 3 Categories"],
      Core: ["Core Courses"],
      "Major Required": ["Required Courses"],
      "Major Elective": ["Major Electives"],
      "Free Elective": ["Free Electives"],
    };

    const findGroupByCategoryName = (categoryName: string): string | null => {
      for (const [groupType, keywords] of Object.entries(lookupTable)) {
        if (keywords.some((keyword) => categoryName.includes(keyword))) {
          return groupType;
        }
      }
      return null;
    };

    const calculateCreditsFromCategory = (currentCategory: Category) => {
      const group = findGroupByCategoryName(currentCategory.name_en);
      if (group && groupCredits[group]) {
        groupCredits[group].totalCredit += currentCategory.credit;
      }

      // Traverse child categories if they exist
      if (currentCategory.child_categories) {
        currentCategory.child_categories.forEach((childCategory) => {
          calculateCreditsFromCategory(childCategory);
        });
      }
    };

    if (category) {
      calculateCreditsFromCategory(category);
    }

    return groupCredits;
  }, [enrolledCourses, category]);

  const sumOfCredits = useMemo(() => {
    if (!enrolledCourses?.length) return 0;
    return enrolledCourses.reduce((total: number, course) => {
      return (
        total +
        course.Courses.reduce((sum: number, enrolledCourse: EnrolledCourse) => {
          return sum + parseFloat(enrolledCourse.Credit);
        }, 0)
      );
    }, 0);
  }, [enrolledCourses]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  const totalGeCredits =
    (categoryCredits?.["Learner Person"] || 0) +
    (categoryCredits?.["Innovative Co-creator"] || 0) +
    (categoryCredits?.["Active Citizen"] || 0) +
    (categoryCredits?.["GE Elective"] || 0);

  const totalGeEarnedCredits =
    allYearCourseGroupCredits["GE Elective"] +
    allYearCourseGroupCredits["Learner Person"] +
    allYearCourseGroupCredits["Innovative Co-creator"] +
    allYearCourseGroupCredits["Active Citizen"];

  const totalCoreAndMajorEarnedCredits =
    allYearCourseGroupCredits["Core"] +
    allYearCourseGroupCredits["Major Required"] +
    allYearCourseGroupCredits["Major Elective"];

  const totalCoreAndMajorRequiredCredits =
    (categoryCredits?.["Core"] || 0) +
    (categoryCredits?.["Major Required"] || 0) +
    (categoryCredits?.["Major Elective"] || 0);

  // console.log(allYearCourseGroupCredits);
  // console.log(categoryCredits);
  // console.log(combinedCredits);

  type EnrolledCourseWithGroup = EnrolledCourse & {
    group: string | null;
    mainGroup: string | null;
  };

  type EnrolledCourseGroupWithGroup = {
    Year: string;
    Semester: string;
    Courses: EnrolledCourseWithGroup[];
  };

  type YearGroup = {
    Year: string;
    semesters: EnrolledCourseGroupWithGroup[];
  };

  const enrolledCoursesWithCourseGroup: EnrolledCourseGroupWithGroup[] =
    enrolledCourses.map((courseGroup) => ({
      ...courseGroup,
      Courses: courseGroup.Courses.map((course) => ({
        ...course,
        group: getLookupForCourse(course.CourseNo),
        mainGroup: getLookupMainForCourse(course.CourseNo),
      })),
    }));

  const getBoxComponentbyCourseGroup = (group: string) => {
    switch (group) {
      case "Learner Person":
        return LearnerBox;
      case "Innovative Co-creator":
        return CoCreBox;
      case "Active Citizen":
        return ActBox;
      case "GE Elective":
        return GeBox;
      case "Core":
        return CoreBox;
      case "Major Required":
        return MajorBox;
      case "Major Elective":
        return MajorBox;
      case "Free Elective":
        return FreeBox;
      default:
        return FreeBox;
    }
  };

  const countGE = enrolledCoursesWithCourseGroup.reduce<
    Record<string, Record<string, number>>
  >((acc, courseGroup) => {
    if (!acc[courseGroup.Year]) {
      acc[courseGroup.Year] = {};
    }
    if (!acc[courseGroup.Year][courseGroup.Semester]) {
      acc[courseGroup.Year][courseGroup.Semester] = 0;
    }
    acc[courseGroup.Year][courseGroup.Semester] += courseGroup.Courses.filter(
      (course) => course.mainGroup === "GE"
    ).length;
    return acc;
  }, {});

  const countMAJOR = enrolledCoursesWithCourseGroup.reduce<
    Record<string, Record<string, number>>
  >((acc, courseGroup) => {
    if (!acc[courseGroup.Year]) {
      acc[courseGroup.Year] = {};
    }
    if (!acc[courseGroup.Year][courseGroup.Semester]) {
      acc[courseGroup.Year][courseGroup.Semester] = 0;
    }
    acc[courseGroup.Year][courseGroup.Semester] += courseGroup.Courses.filter(
      (course) => course.mainGroup === "MAJOR"
    ).length;
    return acc;
  }, {});

  const countFREE = enrolledCoursesWithCourseGroup.reduce<
    Record<string, Record<string, number>>
  >((acc, courseGroup) => {
    if (!acc[courseGroup.Year]) {
      acc[courseGroup.Year] = {};
    }
    if (!acc[courseGroup.Year][courseGroup.Semester]) {
      acc[courseGroup.Year][courseGroup.Semester] = 0;
    }
    acc[courseGroup.Year][courseGroup.Semester] += courseGroup.Courses.filter(
      (course) => course.mainGroup === "FREE"
    ).length;
    return acc;
  }, {});

  const highestMaxGE = Math.max(
    ...enrolledCoursesWithCourseGroup.map(
      (courseGroup) =>
        courseGroup.Courses.filter((course) => course.mainGroup === "GE").length
    )
  );

  const highestMaxMAJOR = Math.max(
    ...enrolledCoursesWithCourseGroup.map(
      (courseGroup) =>
        courseGroup.Courses.filter((course) => course.mainGroup === "MAJOR")
          .length
    )
  );

  const highestMaxFREE = Math.max(
    ...enrolledCoursesWithCourseGroup.map(
      (courseGroup) =>
        courseGroup.Courses.filter((course) => course.mainGroup === "FREE")
          .length
    )
  );

  const enrolledCourseFree = enrolledCoursesWithCourseGroup
    .map((courseGroup) =>
      courseGroup.Courses.find((course) => course.mainGroup === "FREE")
    )
    .filter((course) => course !== undefined);

  const renderPlaceholder = (max: number, count: number) => {
    const placeholders = [];
    for (let i = 0; i < max - count; i++) {
      placeholders.push(<BlankBox />);
    }
    return placeholders;
  };

  return (
    <>
      <div className="bg-white rounded-[20px] w-full pb-12 cursor-default">
        <div className="flex justify-end pb-2 m-2 top-0 right-0 h-[30px]">
          <div className={`flex flex-cols justify-center items-center`}>
            <div className="flex border-[2px] border-solid border-blue-shadeb5 w-[30px] h-[10px] rounded-[20px] bg-blue-shadeb1 mr-2" />
            <p className={`text-sm text-gray mr-4`}>เรียนแล้ว</p>
          </div>
          <div className={`flex flex-cols justify-center items-center`}>
            <div className="flex border-[2px] border-solid border-blue-shadeb5 w-[30px] h-[10px] rounded-[20px] bg-white mr-2" />
            <p className={`text-sm text-gray mr-4`}>ยังไม่ได้เรียน</p>
          </div>
          <div className={`flex flex-cols justify-center items-center`}>
            <div className="flex border-[2px] border-solid border-gray-300 w-[30px] h-[10px] rounded-[20px] bg-gray-0 mr-2" />
            <p className={`text-sm text-gray mr-8`}>F/W</p>
          </div>
          <div className={`flex flex-cols justify-center items-center`}>
            <QuestionMarkCircleIcon
              className={`flex w-[25px] h-[25px] cursor-pointer justify-center items-center text-blue-shadeb5 transition-all duration-300 hover:scale-125`}
              onClick={() => setShowInfo(true)}
            >
              ?
            </QuestionMarkCircleIcon>
            {showInfo && (
              <InfoModal
                title="ข้อมูลชนิดกล่องวิชาในแต่ละหมวดหมู่"
                imageUrl="/imgs/Subjectbox_Details.svg"
                imageAlt="Subject Box Details"
                onClose={() => setShowInfo(false)}
              />
            )}
          </div>
        </div>
        <div className="overflow-x-auto overflow-y-hidden hover:overflow-x-scroll overscroll-x-contain">
          <div className="flex">
            {enrolledCoursesWithCourseGroup
              .reduce((acc: YearGroup[], courseGroup) => {
                const existingYearGroup = acc.find(
                  (group) => group.Year === courseGroup.Year
                );
                if (existingYearGroup) {
                  existingYearGroup.semesters.push(courseGroup);
                } else {
                  acc.push({
                    Year: courseGroup.Year,
                    semesters: [courseGroup],
                  });
                }
                return acc;
              }, [])
              .map((yearGroup) => (
                <div
                  key={yearGroup.Year}
                  className="flex flex-col border rounded-[20px]"
                >
                  <h1 className="text-center py-1 font-semibold">
                    {yearMap[yearGroup.Year]}
                  </h1>
                  <div className="flex h-full">
                    {yearGroup.semesters.map((courseGroup) => (
                      <div
                        key={courseGroup.Semester}
                        className="border rounded-[20px] "
                      >
                        <p
                          className="text-center text-[10px] text-blue-shadeb6 w-30 
                        px-7 py-0.5 bg-blue-shadeb05 rounded-tl-2xl rounded-tr-2xl cursor-default"
                        >
                          {semesterMap[courseGroup.Semester]}
                        </p>
                        <div className="p-2">
                          {courseGroup.Courses.map((course) => (
                            <div
                              key={course.CourseNo}
                              className="flex justify-center items-center"
                            >
                              {course.mainGroup === "GE" && (
                                <SubjectBox
                                  BoxComponent={getBoxComponentbyCourseGroup(
                                    course.group ?? "Free Elective"
                                  )}
                                  // Safely access course_detail using optional chaining (?.)
                                  course_detail={
                                    courseDetails[course.CourseNo]?.detail || {}
                                  }
                                  is_enrolled={true}
                                  group={course.group ?? "Free Elective"}
                                  year={
                                    courseDetails[course.CourseNo]?.years || 0
                                  }
                                  semester={
                                    courseDetails[course.CourseNo]?.semester ||
                                    0
                                  }
                                />
                              )}
                            </div>
                          ))}
                          <div className="flex flex-col items-center justify-center">
                            {renderPlaceholder(
                              highestMaxGE,
                              countGE[courseGroup.Year][courseGroup.Semester]
                            )}
                          </div>
                        </div>
                        <div className="border border-dashed w-full my-4 border-y-1 border-blue-shadeb2"></div>
                        <div className="p-2">
                          {courseGroup.Courses.map((course) => (
                            <div
                              key={course.CourseNo}
                              className="flex justify-center items-center"
                            >
                              {course.mainGroup === "MAJOR" && (
                                <SubjectBox
                                  BoxComponent={getBoxComponentbyCourseGroup(
                                    course.group ?? "Free Elective"
                                  )}
                                  // Safely access course_detail using optional chaining (?.)
                                  course_detail={
                                    courseDetails[course.CourseNo]?.detail || {}
                                  }
                                  is_enrolled={true}
                                  group={course.group ?? "Free Elective"}
                                  year={
                                    courseDetails[course.CourseNo]?.years || 0
                                  }
                                  semester={
                                    courseDetails[course.CourseNo]?.semester ||
                                    0
                                  }
                                />
                              )}
                            </div>
                          ))}
                          <div className="flex flex-col items-center justify-center">
                            {renderPlaceholder(
                              highestMaxMAJOR,
                              countMAJOR[courseGroup.Year][courseGroup.Semester]
                            )}
                          </div>
                        </div>
                        <div className="border border-dashed w-full my-4 border-y-1 border-blue-shadeb2"></div>
                        <div>
                          {courseGroup.Courses.map((course) => (
                            <div
                              key={course.CourseNo}
                              className="flex justify-center items-center"
                            >
                              {course.mainGroup === "FREE" && (
                                <SubjectBox
                                  BoxComponent={getBoxComponentbyCourseGroup(
                                    course.group ?? "Free Elective"
                                  )}
                                  // Safely access course_detail using optional chaining (?.)
                                  course_detail={
                                    courseDetails[course.CourseNo]?.detail ||
                                    courseDetailsFree[course.CourseNo]
                                  }
                                  is_enrolled={true}
                                  group={course.group ?? "Free Elective"}
                                  year={
                                    courseDetails[course.CourseNo]?.years || 0
                                  }
                                  semester={
                                    courseDetails[course.CourseNo]?.semester ||
                                    0
                                  }
                                />
                              )}
                            </div>
                          ))}
                          <div className="flex flex-col items-center justify-center">
                            {renderPlaceholder(
                              highestMaxFREE,
                              countFREE[courseGroup.Year][courseGroup.Semester]
                            )}
                          </div>
                        </div>
                        <div className="border border-dashed w-full my-4 border-y-1 border-blue-shadeb2"></div>
                      </div>
                    ))}
                    {yearGroup.semesters.length <= 1 && (
                      <div className="border rounded-[20px] flex-grow">
                        <p
                          className="text-center text-[10px] text-blue-shadeb6 w-30 
                        px-7 py-0.5 bg-blue-shadeb05 rounded-tl-2xl rounded-tr-2xl cursor-default"
                        >
                          {semesterMap["2"]}
                        </p>
                        <div className="p-2">
                          <div className="flex flex-col items-center justify-center">
                            {renderPlaceholder(highestMaxGE, 0)}
                          </div>
                        </div>
                        <div className="border border-dashed w-full my-4 border-y-1 border-blue-shadeb2"></div>
                        <div className="p-2">
                          <div className="flex flex-col items-center justify-center">
                            {renderPlaceholder(highestMaxMAJOR, 0)}
                          </div>
                        </div>
                        <div className="border border-dashed w-full my-4 border-y-1 border-blue-shadeb2"></div>

                        <div className="flex flex-col items-center justify-center">
                          {renderPlaceholder(highestMaxFREE, 0)}
                        </div>
                        <div className="border border-dashed w-full my-4 border-y-1 border-blue-shadeb2"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <SummaryBox
        listgroup={combinedCredits}
        totalCredits={sumOfCredits}
        totalGeCredits={totalGeCredits}
        totalGeEarnedCredits={totalGeEarnedCredits}
        totalCoreAndMajorEarnedCredits={totalCoreAndMajorEarnedCredits}
        totalCoreAndMajorRequiredCredits={totalCoreAndMajorRequiredCredits}
        totalFreeElectiveCredits={categoryCredits?.["Free Elective"] || 0}
        totalFreeEarnedCredits={allYearCourseGroupCredits["Free Elective"] || 0}
      />
    </>
  );
}

export default Diagram;
