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
  UncountedBox,
} from "../subjectbox/stylebox";
import { CourseDetails } from "../dialogues/contents/coursedetail";
import {
  Courses,
  getCourseDetailByCourseNo,
  getCourseDetailByCurriculumID,
} from "../utils/courseDetail";
import { semesterMap, yearMap } from "../utils/utils";
import BlankBox from "../subjectbox/blankbox";
import CreditBox from "../subjectbox/creditbox";
import PendingCreditBox from "../subjectbox/pendingcreditbox";
import FitContainer from "../container/FitContainer";
import ContainerWithoutHeader from "../container/WithoutHeaderContainer";
import ToggleButton from "./togglebutton";

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
  const [showSemester3, setShowSemester3] = useState(true); // Toggle state for semester 3

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

  // Order enrolled courses by group
  const orderedCourses = useMemo(() => {
    if (!enrolledCourses) return [];

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

    // Sort the courses by group rank
    const sortedCourses = enrolledCourses?.map((courseGroup) => ({
      ...courseGroup,
      Courses: courseGroup.Courses.sort(
        (a, b) => getGroupRank(a.CourseNo) - getGroupRank(b.CourseNo)
      ),
    }));

    return sortedCourses;
  }, [enrolledCourses]);

  // Check if semester 3 exists in enrolled courses
  const hasSemester3 = useMemo(() => {
    return enrolledCourses.some((courseGroup) => courseGroup.Semester === "3");
  }, [enrolledCourses]);

  // Fetch course details for both "Curriculum" and "Free" groups
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (orderedCourses.length === 0) return;

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
  }, [orderedCourses]);

  // console.log("courseDetailsMajor", courseDetails);
  // console.log("courseDetailsFree", courseDetailsFree);

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

  const sumOfCreditsEachYearAndSemester = useMemo(() => {
    if (!enrolledCourses?.length) return {};
    return enrolledCourses.reduce(
      (acc: Record<string, Record<string, number>>, courseGroup) => {
        const year = courseGroup.Year;
        const semester = courseGroup.Semester;
        const totalCredits = courseGroup.Courses.reduce(
          (sum: number, enrolledCourse: EnrolledCourse) => {
            if (enrolledCourse.Grade !== "F" && enrolledCourse.Grade !== "W") {
              return sum + parseFloat(enrolledCourse.Credit);
            }
            return sum;
          },
          0
        );
        if (!acc[year]) {
          acc[year] = {};
        }
        acc[year][semester] = (acc[year][semester] || 0) + totalCredits;
        return acc;
      },
      {}
    );
  }, [enrolledCourses]);

  console.log(sumOfCreditsEachYearAndSemester);

  const remainingCourses = useMemo(() => {
    const remaining: Record<
      string,
      {
        courses: (Courses & {
          subGroup: string;
          mainGroup: string;
          year: number;
          semester: number;
        })[];
      }
    > = {};

    // Ensure orderedCourses is not null/undefined and has length
    if (!orderedCourses || !orderedCourses.length) return remaining;

    // Iterate over the courseDetails to find courses not yet enrolled
    Object.keys(courseDetails).forEach((courseNo) => {
      const courseDetail = courseDetails[courseNo];

      // Check that the courseDetail has valid year and semester values
      if (courseDetail?.years && courseDetail?.semester) {
        // Determine if the course is already enrolled
        const isEnrolled = orderedCourses.some((courseGroup) =>
          courseGroup.Courses.some((course) => course.CourseNo === courseNo)
        );

        // If the course is not enrolled, add it to the remaining object
        if (!isEnrolled) {
          const courseGroup = getLookupMainForCourse(courseNo) || "FREE";
          const subGroup = getLookupForCourse(courseNo) || "Free Elective";
          if (!remaining[courseGroup]) {
            remaining[courseGroup] = { courses: [] };
          }
          remaining[courseGroup].courses.push({
            ...courseDetail,
            subGroup,
            mainGroup: courseGroup,
            year: courseDetail.years,
            semester: courseDetail.semester,
          });
        }
      }
    });

    return remaining;
  }, [courseDetails, orderedCourses]);

  const sumOfCreditsFromRemainingCoursesEachYearAndSemester = useMemo(() => {
    if (!remainingCourses) return {};
    return Object.values(remainingCourses).reduce(
      (acc: Record<string, Record<string, number>>, courseGroup) => {
        courseGroup.courses.forEach((course) => {
          const year = course.years;
          const semester = course.semester;
          if (!acc[year]) {
            acc[year] = {};
          }
          if (!acc[year][semester]) {
            acc[year][semester] = 0;
          }
          acc[year][semester] += course.detail.credit;
        });
        return acc;
      },
      {}
    );
  }, [remainingCourses]);

  // console.log("remainingCourses", remainingCourses);
  // console.log("orderedCourses", orderedCourses);

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

  const enrolledCoursesWithCourseGroup = orderedCourses?.map((courseGroup) => ({
    ...courseGroup,
    Courses: courseGroup.Courses.map((course) => ({
      ...course,
      group: getLookupForCourse(course.CourseNo),
      mainGroup: getLookupMainForCourse(course.CourseNo),
    })),
  }));

  const getBoxComponentbyCourseGroup = (group: string, grade?: string) => {
    if (grade === "F" || grade === "W") {
      return UncountedBox;
    }

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
    if (["1", "2", "3"].includes(courseGroup.Semester)) {
      acc[courseGroup.Year][courseGroup.Semester] += courseGroup.Courses.filter(
        (course) => course.mainGroup === "GE"
      ).length;
    }
    return acc;
  }, {});

  // Include remaining courses in the count
  Object.keys(remainingCourses).forEach((group) => {
    remainingCourses[group].courses.forEach((course) => {
      if (course.mainGroup === "GE") {
        if (!countGE[course.years]) {
          countGE[course.years] = {};
        }
        if (!countGE[course.years][course.semester]) {
          countGE[course.years][course.semester] = 0;
        }
        countGE[course.years][course.semester] += 1;
      }
    });
  });

  const countMAJOR = enrolledCoursesWithCourseGroup.reduce<
    Record<string, Record<string, number>>
  >((acc, courseGroup) => {
    if (!acc[courseGroup.Year]) {
      acc[courseGroup.Year] = {};
    }
    if (!acc[courseGroup.Year][courseGroup.Semester]) {
      acc[courseGroup.Year][courseGroup.Semester] = 0;
    }
    if (["1", "2", "3"].includes(courseGroup.Semester)) {
      acc[courseGroup.Year][courseGroup.Semester] += courseGroup.Courses.filter(
        (course) => course.mainGroup === "MAJOR"
      ).length;
    }
    return acc;
  }, {});

  // Include remaining courses in the count
  Object.keys(remainingCourses).forEach((group) => {
    remainingCourses[group].courses.forEach((course) => {
      if (course.mainGroup === "MAJOR") {
        if (!countMAJOR[course.year]) {
          countMAJOR[course.year] = {};
        }
        if (!countMAJOR[course.year][course.semester]) {
          countMAJOR[course.year][course.semester] = 0;
        }
        countMAJOR[course.year][course.semester] += 1;
      }
    });
  });

  const countFREE = enrolledCoursesWithCourseGroup.reduce<
    Record<string, Record<string, number>>
  >((acc, courseGroup) => {
    const { Year, Semester, Courses } = courseGroup;
    if (!acc[Year]) {
      acc[Year] = {};
    }
    if (!acc[Year][Semester]) {
      acc[Year][Semester] = 0;
    }
    if (["1", "2", "3"].includes(Semester)) {
      acc[Year][Semester] += Courses.filter(
        (course) => course.mainGroup === "FREE"
      ).length;
    }
    return acc;
  }, {});

  // Include remaining courses in the count
  Object.keys(remainingCourses).forEach((group) => {
    remainingCourses[group].courses.forEach((course) => {
      if (course.mainGroup === "FREE") {
        if (!countFREE[course.years]) {
          countFREE[course.years] = {};
        }
        if (!countFREE[course.years][course.semester]) {
          countFREE[course.years][course.semester] = 0;
        }
        countFREE[course.years][course.semester] += 1;
      }
    });
  });

  const getHighestMax = (group: string) => {
    const enrolledMax = Math.max(
      ...enrolledCoursesWithCourseGroup.map(
        (courseGroup) =>
          courseGroup.Courses.filter((course) => course.mainGroup === group)
            .length
      )
    );

    const remainingMax = Math.max(
      ...Object.values(remainingCourses).map(
        (remainingGroup) =>
          remainingGroup.courses.filter((course) => course.mainGroup === group)
            .length
      )
    );

    return Math.max(enrolledMax, remainingMax);
  };

  const highestMaxGE = getHighestMax("GE");
  const highestMaxMAJOR = getHighestMax("MAJOR");
  const highestMaxFREE = getHighestMax("FREE");

  // console.log("highestMaxGE", highestMaxGE);
  // console.log("highestMaxMAJOR", highestMaxMAJOR);
  // console.log("highestMaxFREE", highestMaxFREE);

  // console.log("enrolledCoursesWithCourseGroup", enrolledCoursesWithCourseGroup);

  const enrolledCourseFree = enrolledCoursesWithCourseGroup.flatMap(
    (courseGroup) =>
      courseGroup.Courses.filter((course) => course.mainGroup === "FREE")
  );

  // console.log(enrolledCoursesWithCourseGroup);
  // console.log("enrolledCourseFree", enrolledCourseFree);
  // console.log(remainingCourses);
  // console.log("countGE", countGE);
  // console.log("countMAJOR", countMAJOR);
  // console.log("countFREE", countFREE);

  const renderPlaceholder = (max: number, count: number) => {
    const placeholders = [];
    for (let i = 0; i < max - count; i++) {
      placeholders.push(<BlankBox key={i} />);
    }
    return placeholders;
  };

  const getMaxYearByEnrolledCourses = () => {
    let maxYear = 4; // Set the minimum year to 4
    enrolledCoursesWithCourseGroup.forEach((courseGroup) => {
      maxYear = Math.max(maxYear, Number(courseGroup.Year));
    });
    return Array.from({ length: maxYear }, (_, i) => i + 1);
  };

  console.log(getMaxYearByEnrolledCourses());

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  // const heightDiv = 54.7;

  return (
    <div className="flex flex-row items-start space-x-4">
      <ContainerWithoutHeader>
        <div className="flex justify-center">
          {/* <div className="relative rounded-[20px] pr-[54px] py-8 w-[30px] h-full">
            <div className="mt-[75px] pl-[15px] flex flex-col h-full ">
              <div
                style={{ height: `${highestMaxGE * heightDiv + 24}px` }}
                className="bg-yellow-50 border-r-0 border border-solid border-amber-300 flex items-center justify-center w-[40px] rounded-tl-[20px] rounded-bl-[20px] text-collection-1-yellow-shade-y7 text-sm hover:bg-yellow-100 hover:font-bold transition-all duration-200"
              >
                <p className="[writing-mode:vertical-lr] [transform:rotate(180deg)] cursor-default">
                  General Education
                </p>
              </div>

              <div
                style={{ height: `${highestMaxMAJOR * heightDiv + 38}px` }}
                className="bg-blue-shadeb05 border-r-0 border border-solid border-blue-shadeb3 flex items-center justify-center w-[40px] rounded-tl-[20px] rounded-bl-[20px] text-blue-shadeb5 text-sm hover:bg-blue-shadeb1 hover:font-bold transition-all duration-200"
              >
                <p className="[writing-mode:vertical-lr] [transform:rotate(180deg)]  cursor-default">
                  Major Requirements
                </p>
              </div>

              <div
                style={{ height: `${highestMaxFREE * heightDiv + 32}px` }}
                className="bg-collection-1-black-sl border-r-0 border border-solid border-collection-1-black-shade-bl4 flex items-center justify-center w-[40px] rounded-tl-[20px] rounded-bl-[20px] text-black text-sm hover:bg-gray-300 hover:font-bold transition-all duration-200"
              >
                <p className="[writing-mode:vertical-lr] [transform:rotate(180deg)] cursor-default">
                  Free
                </p>
              </div>
            </div>
          </div> */}
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
                ></QuestionMarkCircleIcon>
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
            {hasSemester3 && (
              <div className="flex justify-start text-sm m-4">
                <ToggleButton
                  onClick={() => setShowSemester3((prev) => !prev)}
                />
              </div>
            )}

            <div className="overflow-x-auto overflow-y-hidden hover:overflow-x-auto w-full">
              <div className="flex w-full">
                {getMaxYearByEnrolledCourses().map((year) => {
                  const yearGroup = enrolledCoursesWithCourseGroup.reduce(
                    (acc: YearGroup | undefined, courseGroup) => {
                      if (Number(courseGroup.Year) === year) {
                        if (acc) {
                          acc.semesters.push(courseGroup);
                        } else {
                          acc = {
                            Year: courseGroup.Year,
                            semesters: [courseGroup],
                          };
                        }
                      }
                      return acc;
                    },
                    undefined
                  );

                  return (
                    <div
                      key={year}
                      className="flex flex-col border rounded-[20px]"
                    >
                      <h1 className="text-center py-1 font-semibold">
                        {yearMap[String(year)]}
                      </h1>
                      <div className="flex h-full">
                        {[1, 2].map((semester) => {
                          const courseGroup = yearGroup?.semesters.find(
                            (group) => Number(group.Semester) === semester
                          );

                          return (
                            <div
                              key={semester}
                              className="border rounded-[20px]"
                            >
                              <p
                                className="text-center text-[10px] text-blue-shadeb6 w-30 
                 px-6 py-0.5 bg-blue-shadeb05 rounded-t-[20px] cursor-default"
                              >
                                {semesterMap[String(semester)]}
                              </p>
                              <div className="py-4 px-2 bg-yellow-50 bg-opacity-50">
                                {/* Render enrolled courses for the current year and semester */}
                                {courseGroup?.Courses.map((course) => (
                                  <div
                                    key={course.CourseNo}
                                    className="flex justify-center items-center"
                                  >
                                    {course.mainGroup === "GE" && (
                                      <SubjectBox
                                        key={course.CourseNo}
                                        BoxComponent={getBoxComponentbyCourseGroup(
                                          course.group ?? "Free Elective",
                                          course.Grade
                                        )}
                                        course_detail={
                                          courseDetails[course.CourseNo]
                                            ?.detail || {}
                                        }
                                        is_enrolled={true}
                                        group={course.group ?? "Free Elective"}
                                        year={
                                          courseDetails[course.CourseNo]
                                            ?.years || 0
                                        }
                                        semester={
                                          courseDetails[course.CourseNo]
                                            ?.semester || 0
                                        }
                                      />
                                    )}
                                  </div>
                                ))}
                                {remainingCourses["GE"]?.courses
                                  .filter(
                                    (course) =>
                                      course.years === year &&
                                      course.semester === semester
                                  )
                                  .map((course) => (
                                    <SubjectBox
                                      key={course.course_no}
                                      BoxComponent={getBoxComponentbyCourseGroup(
                                        course.subGroup ?? "Free Elective"
                                      )}
                                      course_detail={course.detail}
                                      is_enrolled={false}
                                      group={course.subGroup ?? "Free Elective"}
                                      year={course.years}
                                      semester={course.semester}
                                    />
                                  ))}
                                {/* Render placeholder boxes if needed */}
                                <div className="flex flex-col items-center justify-center">
                                  {renderPlaceholder(
                                    highestMaxGE,
                                    countGE[String(year)]?.[String(semester)] ||
                                      0
                                  )}
                                </div>
                              </div>
                              <div className="border border-dashed w-full border-y-1 border-blue-shadeb2"></div>
                              <div className="py-4 px-2 bg-blue-100 bg-opacity-25">
                                {courseGroup?.Courses.map((course, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-center items-center"
                                  >
                                    {course.mainGroup === "MAJOR" && (
                                      <SubjectBox
                                        key={course.CourseNo}
                                        BoxComponent={getBoxComponentbyCourseGroup(
                                          course.group ?? "Free Elective",
                                          course.Grade
                                        )}
                                        course_detail={
                                          courseDetails[course.CourseNo]
                                            ?.detail || {}
                                        }
                                        is_enrolled={true}
                                        group={course.group ?? "Free Elective"}
                                        year={
                                          courseDetails[course.CourseNo]
                                            ?.years || 0
                                        }
                                        semester={
                                          courseDetails[course.CourseNo]
                                            ?.semester || 0
                                        }
                                      />
                                    )}
                                  </div>
                                ))}
                                {remainingCourses["MAJOR"]?.courses
                                  .filter(
                                    (course) =>
                                      course.years === year &&
                                      course.semester === semester
                                  )
                                  .map((course) => (
                                    <SubjectBox
                                      key={course.course_no}
                                      BoxComponent={getBoxComponentbyCourseGroup(
                                        course.subGroup ?? "Free Elective"
                                      )}
                                      course_detail={course.detail}
                                      is_enrolled={false}
                                      group={course.subGroup ?? "Free Elective"}
                                      year={course.years}
                                      semester={course.semester}
                                    />
                                  ))}
                                <div className="flex flex-col items-center justify-center">
                                  {renderPlaceholder(
                                    highestMaxMAJOR,
                                    countMAJOR[String(year)]?.[
                                      String(semester)
                                    ] || 0
                                  )}
                                </div>
                              </div>
                              <div className="border border-dashed w-full border-y-1 border-blue-shadeb2"></div>
                              <div className="py-4 bg-gray-100">
                                {courseGroup?.Courses.map((course) => (
                                  <div
                                    key={course.CourseNo}
                                    className="flex justify-center items-center"
                                  >
                                    {course.mainGroup === "FREE" && (
                                      <SubjectBox
                                        key={course.CourseNo}
                                        BoxComponent={getBoxComponentbyCourseGroup(
                                          course.group ?? "Free Elective",
                                          course.Grade
                                        )}
                                        course_detail={
                                          courseDetails[course.CourseNo]
                                            ?.detail ||
                                          courseDetailsFree[course.CourseNo]
                                        }
                                        is_enrolled={true}
                                        group={course.group ?? "Free Elective"}
                                        year={
                                          courseDetails[course.CourseNo]
                                            ?.years || 0
                                        }
                                        semester={
                                          courseDetails[course.CourseNo]
                                            ?.semester || 0
                                        }
                                      />
                                    )}
                                  </div>
                                ))}
                                {remainingCourses["FREE"]?.courses
                                  .filter(
                                    (course) =>
                                      course.years === year &&
                                      course.semester === semester
                                  )
                                  .map((course) => (
                                    <SubjectBox
                                      key={course.course_no}
                                      BoxComponent={getBoxComponentbyCourseGroup(
                                        course.subGroup ?? "Free Elective"
                                      )}
                                      course_detail={course.detail}
                                      is_enrolled={false}
                                      group={course.subGroup ?? "Free Elective"}
                                      year={course.years}
                                      semester={course.semester}
                                    />
                                  ))}
                                <div className="flex flex-col items-center justify-center">
                                  {renderPlaceholder(
                                    highestMaxFREE,
                                    countFREE[String(year)]?.[
                                      String(semester)
                                    ] || 0
                                  )}
                                </div>
                              </div>
                              <div className="border border-dashed w-full border-y-1 border-blue-shadeb2"></div>
                              <div className="flex flex-col items-center justify-center w-full rounded-b-[20px] bg-blue-shadeb05 py-1">
                                {sumOfCreditsEachYearAndSemester[year]?.[
                                  semester
                                ] ? (
                                  <CreditBox
                                    courseCredit={
                                      sumOfCreditsEachYearAndSemester[year]?.[
                                        semester
                                      ]
                                    }
                                  />
                                ) : (
                                  <PendingCreditBox
                                    courseCredit={
                                      sumOfCreditsFromRemainingCoursesEachYearAndSemester[
                                        year
                                      ]?.[semester] || 0
                                    }
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {showSemester3 && (
                          <div key={3} className="border rounded-[20px]">
                            <p
                              className="text-center text-[10px] text-blue-shadeb6 w-30 
                            px-6 py-0.5 bg-blue-shadeb05 rounded-t-[20px] cursor-default"
                            >
                              {semesterMap[String(3)]}
                            </p>
                            <div className="py-4 px-2 bg-yellow-50 bg-opacity-50">
                              {/* Render enrolled courses for the current year and semester */}
                              {yearGroup?.semesters
                                .filter((group) => group.Semester === "3")
                                .flatMap((courseGroup) =>
                                  courseGroup.Courses.map((course) => (
                                    <div
                                      key={course.CourseNo}
                                      className="flex justify-center items-center"
                                    >
                                      {course.mainGroup === "GE" && (
                                        <SubjectBox
                                          key={course.CourseNo}
                                          BoxComponent={getBoxComponentbyCourseGroup(
                                            course.group ?? "Free Elective",
                                            course.Grade
                                          )}
                                          course_detail={
                                            courseDetails[course.CourseNo]
                                              ?.detail || {}
                                          }
                                          is_enrolled={true}
                                          group={
                                            course.group ?? "Free Elective"
                                          }
                                          year={
                                            courseDetails[course.CourseNo]
                                              ?.years || 0
                                          }
                                          semester={
                                            courseDetails[course.CourseNo]
                                              ?.semester || 0
                                          }
                                        />
                                      )}
                                    </div>
                                  ))
                                )}
                              {remainingCourses["GE"]?.courses
                                .filter(
                                  (course) =>
                                    course.years === year &&
                                    course.semester === 3
                                )
                                .map((course) => (
                                  <SubjectBox
                                    key={course.course_no}
                                    BoxComponent={getBoxComponentbyCourseGroup(
                                      course.subGroup ?? "Free Elective"
                                    )}
                                    course_detail={course.detail}
                                    is_enrolled={false}
                                    group={course.subGroup ?? "Free Elective"}
                                    year={course.years}
                                    semester={course.semester}
                                  />
                                ))}
                              {/* Render placeholder boxes if needed */}
                              <div className="flex flex-col items-center justify-center">
                                {renderPlaceholder(
                                  highestMaxGE,
                                  countGE[String(year)]?.[String(3)] || 0
                                )}
                              </div>
                            </div>
                            <div className="border border-dashed w-full border-y-1 border-blue-shadeb2"></div>
                            <div className="py-4 px-2 bg-blue-100 bg-opacity-25">
                              {/* Render enrolled courses for the current year and semester */}
                              {yearGroup?.semesters
                                .filter((group) => group.Semester === "3")
                                .flatMap((courseGroup) =>
                                  courseGroup.Courses.map((course) => (
                                    <div
                                      key={course.CourseNo}
                                      className="flex justify-center items-center"
                                    >
                                      {course.mainGroup === "MAJOR" && (
                                        <SubjectBox
                                          key={course.CourseNo}
                                          BoxComponent={getBoxComponentbyCourseGroup(
                                            course.group ?? "Free Elective",
                                            course.Grade
                                          )}
                                          course_detail={
                                            courseDetails[course.CourseNo]
                                              ?.detail || {}
                                          }
                                          is_enrolled={true}
                                          group={
                                            course.group ?? "Free Elective"
                                          }
                                          year={
                                            courseDetails[course.CourseNo]
                                              ?.years || 0
                                          }
                                          semester={
                                            courseDetails[course.CourseNo]
                                              ?.semester || 0
                                          }
                                        />
                                      )}
                                    </div>
                                  ))
                                )}
                              {remainingCourses["MAJOR"]?.courses
                                .filter(
                                  (course) =>
                                    course.years === year &&
                                    course.semester === 3
                                )
                                .map((course) => (
                                  <SubjectBox
                                    key={course.course_no}
                                    BoxComponent={getBoxComponentbyCourseGroup(
                                      course.subGroup ?? "Free Elective"
                                    )}
                                    course_detail={course.detail}
                                    is_enrolled={false}
                                    group={course.subGroup ?? "Free Elective"}
                                    year={course.years}
                                    semester={course.semester}
                                  />
                                ))}
                              {/* Render placeholder boxes if needed */}
                              <div className="flex flex-col items-center justify-center">
                                {renderPlaceholder(
                                  highestMaxMAJOR,
                                  countMAJOR[String(year)]?.[String(3)] || 0
                                )}
                              </div>
                            </div>
                            <div className="border border-dashed w-full border-y-1 border-blue-shadeb2"></div>
                            <div className="p-4 bg-gray-100">
                              {/* Render enrolled courses for the current year and semester */}
                              {yearGroup?.semesters
                                .filter((group) => group.Semester === "3")
                                .flatMap((courseGroup) =>
                                  courseGroup.Courses.map((course) => (
                                    <div
                                      key={course.CourseNo}
                                      className="flex justify-center items-center"
                                    >
                                      {course.mainGroup === "FREE" && (
                                        <SubjectBox
                                          key={course.CourseNo}
                                          BoxComponent={getBoxComponentbyCourseGroup(
                                            course.group ?? "Free Elective",
                                            course.Grade
                                          )}
                                          course_detail={
                                            courseDetails[course.CourseNo]
                                              ?.detail ||
                                            courseDetailsFree[course.CourseNo]
                                          }
                                          is_enrolled={true}
                                          group={
                                            course.group ?? "Free Elective"
                                          }
                                          year={
                                            courseDetails[course.CourseNo]
                                              ?.years || 0
                                          }
                                          semester={
                                            courseDetails[course.CourseNo]
                                              ?.semester || 0
                                          }
                                        />
                                      )}
                                    </div>
                                  ))
                                )}
                              {remainingCourses["FREE"]?.courses
                                .filter(
                                  (course) =>
                                    course.years === year &&
                                    course.semester === 3
                                )
                                .map((course) => (
                                  <SubjectBox
                                    key={course.course_no}
                                    BoxComponent={getBoxComponentbyCourseGroup(
                                      course.subGroup ?? "Free Elective"
                                    )}
                                    course_detail={course.detail}
                                    is_enrolled={false}
                                    group={course.subGroup ?? "Free Elective"}
                                    year={course.years}
                                    semester={course.semester}
                                  />
                                ))}
                              {/* Render placeholder boxes if needed */}
                              <div className="flex flex-col items-center justify-center">
                                {renderPlaceholder(
                                  highestMaxFREE,
                                  countFREE[String(year)]?.[String(3)] || 0
                                )}
                              </div>
                            </div>
                            <div className="border border-dashed w-full border-y-1 border-blue-shadeb2"></div>
                            <div className="flex flex-col items-center justify-center w-full rounded-b-[20px] bg-blue-shadeb05 py-1">
                              {sumOfCreditsEachYearAndSemester[year]?.[3] ? (
                                <CreditBox
                                  courseCredit={
                                    sumOfCreditsEachYearAndSemester[year]?.[3]
                                  }
                                />
                              ) : (
                                <PendingCreditBox
                                  courseCredit={
                                    sumOfCreditsFromRemainingCoursesEachYearAndSemester[
                                      year
                                    ]?.[3] || 0
                                  }
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </ContainerWithoutHeader>
      <FitContainer>
        <SummaryBox
          listgroup={combinedCredits}
          totalCredits={sumOfCredits}
          totalGeCredits={totalGeCredits}
          totalGeEarnedCredits={totalGeEarnedCredits}
          totalCoreAndMajorEarnedCredits={totalCoreAndMajorEarnedCredits}
          totalCoreAndMajorRequiredCredits={totalCoreAndMajorRequiredCredits}
          totalFreeElectiveCredits={categoryCredits?.["Free Elective"] || 0}
          totalFreeEarnedCredits={
            allYearCourseGroupCredits["Free Elective"] || 0
          }
        />
      </FitContainer>
    </div>
  );
}

export default Diagram;
