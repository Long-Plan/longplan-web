import React, { useEffect, useState } from "react";
import { getEnrolledCourses } from "../utils/enrolledCourse";
import { coreApi } from "../../../core/connections";

// Define your interfaces here
interface ApiResponse {
  success: boolean;
  message: string;
  result: Category;
}

interface CoursesApiResponse {
  success: boolean;
  message: string;
  result: Course[];
}

interface Category {
  id: number;
  name_th: string;
  name_en: string;
  at_least: boolean;
  credit: number;
  type_id: number;
  note: string;
  created_at: string;
  updated_at: string;
  requirements: Requirement[] | null;
  relationships: Relationship[] | null;
  child_categories: Category[] | null;
  courses: string[] | null;
}

interface EnrollmentData {
  Year: string;
  Semester: string;
  Courses: EnrolledCourse[];
}

interface EnrolledCourse {
  CourseNo: string;
  Credit: string;
  Grade: string;
}

interface Requirement {
  id: number;
  regex: string;
  credit: number;
}

interface Relationship {
  id: number;
  child_category_id: number;
  require_all: boolean;
  position: number;
  question_id: number | null;
  choice_id: number | null;
  cross_category_id: number | null;
}

interface Course {
  id: number;
  category_id: number;
  course_no: string;
  semester: number;
  years: number;
  credit: number;
  requisites: requisite[] | null;
  detail: CourseDetail;
}

interface requisite {
  id: number;
  course_id: number;
  requisite_type: string;
}

interface CourseDetail {
  id: number;
  course_no: string;
  title_long_th: string;
  title_long_en: string;
  course_desc_th: string;
  course_desc_en: string;
  credit: number;
  prerequisite: string;
  created_at: string;
  updated_at: string;
}

interface TypesAPIResponse {
  success: boolean;
  message: string;
  result: Type[];
}

interface Type {
  id: number;
  name_th: string;
  name_en: string;
}

interface GroupDTO {
  id: number;
  name_th: string;
  name_en: string;
  type_id: number;
  total_credit: number;
  earned_credit: number;
  at_least: boolean;
  child?: GroupDTO[];
  courses?: Course[];
}

interface CurriculaDTO {
  id: number;
  name_th: string;
  name_en: string;
  total_credit: number;
  earned_credit: number;
  type_id: number;
  at_least: boolean;
  child: GroupDTO[];
}

interface userQuestionChoices {
  [question_id: number]: number;
}

const CategoryDetail: React.FC = () => {
  const [categoryData, setCategoryData] = useState<Category | null>(null);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData[] | null>(
    null
  );
  const [coursesData, setCoursesData] = useState<Course[] | null>(null);
  const [typesData, setTypesData] = useState<Type[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [curriculaData, setCurriculaData] = useState<CurriculaDTO | null>(null);

  const userChoices: userQuestionChoices = {
    1: 1,
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoryResponse = await coreApi
          .get("/categories/1")
          .then((res) => res.data);
        if (!categoryResponse.success) {
          throw new Error("Failed to fetch curriculum data");
        }
        const categoryData: ApiResponse = categoryResponse;
        setCategoryData(categoryData.result);

        const enrollmentResponse = await getEnrolledCourses();
        setEnrollmentData(enrollmentResponse);

        const coursesResponse = await coreApi
          .get("/curricula/courses/1")
          .then((res) => res.data);
        if (!coursesResponse.success) {
          throw new Error("Failed to fetch course data");
        }
        const coursesData: CoursesApiResponse = coursesResponse;
        setCoursesData(coursesData.result);

        const typesResponse = await coreApi
          .get("/categories/types")
          .then((res) => res.data);
        if (!typesResponse.success) {
          throw new Error("Failed to fetch types data");
        }
        const typesData: TypesAPIResponse = typesResponse;
        setTypesData(typesData.result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (categoryData && enrollmentData && coursesData) {
      const curricula = generateCurriculaDTO(categoryData);
      setCurriculaData(curricula);
      console.log("Updated curricula", curricula);
    }
  }, [categoryData, enrollmentData, coursesData]);

  const calculateEarnedCreditsForCourse = (courseNo: string): number => {
    let earnedCredits = 0;
    enrollmentData?.forEach((enroll) => {
      const enrolledCourse = enroll.Courses.find(
        (course) => course.CourseNo === courseNo
      );
      if (
        enrolledCourse &&
        enrolledCourse.Grade !== "W" &&
        enrolledCourse.Grade !== "F"
      ) {
        earnedCredits += parseFloat(enrolledCourse.Credit);
      }
    });
    return earnedCredits;
  };

  const calculateCreditsForCategory = (category: Category): GroupDTO => {
    const earnedCredits = category.courses
      ? category.courses.reduce(
          (sum, courseNo) => sum + calculateEarnedCreditsForCourse(courseNo),
          0
        )
      : 0;

    const childCredits = category.child_categories
      ? category.child_categories.map(calculateCreditsForCategory)
      : [];

    const totalEarnedCredits =
      earnedCredits +
      childCredits.reduce((sum, childGroup) => {
        return sum + childGroup.earned_credit;
      }, 0);

    return {
      id: category.id,
      name_th: category.name_th,
      name_en: category.name_en,
      total_credit: category.credit,
      type_id: category.type_id,
      at_least: category.at_least,
      earned_credit: totalEarnedCredits,
      courses: coursesData?.filter((course) =>
        category.courses?.includes(course.course_no)
      ),
      child: childCredits.length > 0 ? childCredits : undefined,
    };
  };

  const processRelationships = (category: Category): Category | null => {
    const { relationships } = category;

    // If there are no relationships, return the category as is
    if (!relationships || relationships.length === 0) {
      return category;
    }

    // Filter child categories based on user choices
    const filteredChildCategories: Category[] = [];
    const addedChildCategoryIds = new Set<number>();

    relationships.forEach((rel) => {
      // Check if there's a matching user choice for this question
      const userChoice = userChoices[rel.question_id!];

      // Only include child categories that match the user's choice
      if (userChoice === rel.choice_id) {
        const childCategory = category.child_categories?.find(
          (child) => child.id === rel.child_category_id
        );

        // Add the child category if it hasn’t already been included
        if (childCategory && !addedChildCategoryIds.has(childCategory.id)) {
          filteredChildCategories.push(childCategory);
          addedChildCategoryIds.add(childCategory.id);
        }
      }
    });

    // Return the updated category with filtered child categories
    return {
      ...category,
      child_categories: filteredChildCategories.length
        ? filteredChildCategories
        : category.child_categories, // Keep original children if no filtering applied
    };
  };

  const generateCurriculaDTO = (categoryData: Category): CurriculaDTO => {
    const rootDTO = calculateCreditsForCategory(
      processRelationships(categoryData) || categoryData
    );

    const updatedChildCategories = rootDTO.child?.map((group) => {
      if (
        group.type_id ===
        typesData?.find((type) => type.name_en === "Free Electives")?.id
      ) {
        const freeElectiveCredits = calculateFreeElectiveCredits();
        return {
          ...group,
          earned_credit: freeElectiveCredits,
        };
      }
      return group;
    });

    return {
      ...rootDTO,
      child: updatedChildCategories || [],
    };
  };

  const calculateFreeElectiveCredits = (): number => {
    let freeElectiveCredits = 0;
    const allCategoryCourses = getAllCategoryCourses();

    enrollmentData?.forEach((enroll) => {
      enroll.Courses.forEach((enrolledCourse) => {
        const isCourseFreeElective = !allCategoryCourses.includes(
          enrolledCourse.CourseNo
        );

        if (
          isCourseFreeElective &&
          enrolledCourse.Grade !== "W" &&
          enrolledCourse.Grade !== "F"
        ) {
          freeElectiveCredits += parseFloat(enrolledCourse.Credit);
        }
      });
    });

    return freeElectiveCredits;
  };

  const getAllCategoryCourses = (): string[] => {
    const allCourses: string[] = [];

    const collectCourses = (category: Category) => {
      if (category.courses) {
        allCourses.push(...category.courses);
      }
      if (category.child_categories) {
        category.child_categories.forEach(collectCourses);
      }
    };

    if (categoryData) {
      collectCourses(categoryData);
    }

    return allCourses;
  };

  const renderCurriculaData = () => {
    if (!curriculaData) return null;

    const groupedData: { [key: number]: GroupDTO[] } = {
      1: [],
      2: [],
      3: [],
    };

    // Group categories by type_id for display
    curriculaData.child.forEach((group) => {
      if (groupedData[group.type_id]) {
        groupedData[group.type_id].push(group);
      }
    });

    const renderGroup = (group: GroupDTO) => (
      <div key={group.id} className="ml-4 mb-4">
        <h3 className="text-md font-semibold">{group.name_en}</h3>
        <p>
          Total Credits: {group.total_credit}, Earned Credits:{" "}
          {group.earned_credit}
        </p>
        {group.child && group.child.length > 0 && (
          <div className="ml-4">
            {group.child.map((childGroup) => renderGroup(childGroup))}
          </div>
        )}
      </div>
    );

    return (
      <div>
        {Object.entries(groupedData).map(([typeId, groups]) => (
          <div key={typeId} className="mb-8">
            <h2 className="text-lg font-bold">
              {typesData?.find((type) => type.id === parseInt(typeId))?.name_en}
            </h2>
            {groups.map((group) => renderGroup(group))}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!categoryData) {
    return <div>No data found</div>;
  }

  return (
    <div className="bg-white p-16 rounded-[20px]">
      <h1>{categoryData.name_en}</h1>
      <p>Credits: {categoryData.credit}</p>
      <p>Note: {categoryData.note}</p>

      <div style={styles.container as React.CSSProperties}>
        <h1>Course Categories JSON</h1>
        {curriculaData && (
          <>
            <pre style={styles.jsonOutput as React.CSSProperties}>
              {JSON.stringify(curriculaData.child, null, 2)}
            </pre>
          </>
        )}
      </div>
      <div>{renderCurriculaData()}</div>
    </div>
  );
};

export default CategoryDetail;

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "20px auto",
    padding: "20px",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    overflowWrap: "break-word",
    fontFamily: "'Roboto', sans-serif",
    color: "#333",
  },
  jsonOutput: {
    backgroundColor: "#f4f4f4",
    color: "#2b2b2b",
    fontFamily: "'Courier New', Courier, monospace",
    padding: "15px",
    borderRadius: "6px",
    overflowX: "auto",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
    lineHeight: "1.6",
    maxHeight: "700px",
    marginBottom: "20px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
};
