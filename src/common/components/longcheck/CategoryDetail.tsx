import React, { useEffect, useState } from "react";

// Define your interfaces here (updated for the new API structure)
interface ApiResponse {
  success: boolean;
  message: string;
  result: Category;
}

interface EnrollmentApiResponse {
  success: boolean;
  message: string;
  result: EnrollmentData[];
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
  type_id: number; // from types API
  total_credit: number; // from curricula API
  earned_credit: number; // from enrolled-courses API
  at_least: boolean; // from categories API
  child?: GroupDTO[]; // recursive structure
  courses?: Course[]; // from curricula API
}

interface CurriculaDTO {
  id: number;
  name_th: string;
  name_en: string;
  total_credit: number;
  earned_credit: number; // Add earned_credit at the root level
  type_id: number; // from categories API
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

  // Mock user choices
  const userChoices: userQuestionChoices = {
    1: 1,
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoryResponse = await fetch(
          "http://10.10.182.135:8000/api/v1/categories/1"
        );
        if (!categoryResponse.ok) {
          throw new Error("Failed to fetch curriculum data");
        }
        const categoryData: ApiResponse = await categoryResponse.json();
        setCategoryData(categoryData.result);

        const enrollmentResponse = await fetch(
          "http://10.10.182.135:8000/api/v1/enrolled-courses/640612093"
        );
        if (!enrollmentResponse.ok) {
          throw new Error("Failed to fetch enrollment data");
        }
        const enrollmentData: EnrollmentApiResponse =
          await enrollmentResponse.json();
        setEnrollmentData(enrollmentData.result);

        const coursesResponse = await fetch(
          "http://10.10.182.135:8000/api/v1/curricula/courses/1"
        );
        if (!coursesResponse.ok) {
          throw new Error("Failed to fetch course data");
        }
        const coursesData: CoursesApiResponse = await coursesResponse.json();
        setCoursesData(coursesData.result);

        const typesResponse = await fetch(
          "http://10.10.182.135:8000/api/v1/categories/types"
        );
        if (!typesResponse.ok) {
          throw new Error("Failed to fetch types data");
        }
        const typesData: TypesAPIResponse = await typesResponse.json();
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

    // Store only child categories that match user choices
    const filteredChildCategories: Category[] = [];

    // Set to track added child category IDs to avoid duplicates
    const addedChildCategoryIds = new Set<number>();

    relationships.forEach((rel) => {
      // Get user's choice for the specific question
      const userChoice = userChoices[rel.question_id!];

      // Only add child categories that match the user's choice
      if (userChoice === rel.choice_id) {
        const childCategory = categoryData?.child_categories?.find(
          (child) => child.id === rel.child_category_id
        );

        // If the child category exists and hasn't been added yet, include it
        if (childCategory && !addedChildCategoryIds.has(childCategory.id)) {
          filteredChildCategories.push(childCategory);
          addedChildCategoryIds.add(childCategory.id); // Track added category
        }
      }
    });

    // If we found matching child categories, return them
    if (filteredChildCategories.length > 0) {
      return {
        ...category,
        child_categories: filteredChildCategories, // Replace with filtered child categories
      };
    }

    // If no matching child categories were found, return the category as is
    return category;
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

  const generateCurriculaDTO = (categoryData: Category): CurriculaDTO => {
    // Process relationships only in the Major category
    const processedCategory = processRelationships(categoryData);

    // Calculate credits for the processed category
    const rootDTO = calculateCreditsForCategory(
      processedCategory || categoryData
    );

    const updatedChildCategories = rootDTO.child?.map((group) => {
      if (
        group.type_id ===
        typesData?.find((type) => type.name_en === "Free Electives")?.id
      ) {
        const freeElectiveCredits = calculateFreeElectiveCredits();
        return {
          ...group,
          earned_credit: freeElectiveCredits, // Update earned credits for Free Electives
        };
      }
      return group;
    });

    return {
      ...rootDTO,
      child: updatedChildCategories || [],
    };
  };

  const handleCopyToClipboard = () => {
    if (curriculaData) {
      navigator.clipboard
        .writeText(JSON.stringify(curriculaData, null, 2))
        .then(() => {})
        .catch(() => {
          alert("Failed to copy JSON.");
        });
    }
  };

  const renderCurriculaData = () => {
    if (!curriculaData) return null;

    const renderGroup = (group: GroupDTO) => (
      <div key={group.name_en} className="ml-4">
        <h3>{group.name_en}</h3>
        <p>
          Total Credits: {group.total_credit}, Earned Credits:{" "}
          {group.earned_credit}
        </p>
        {group.child && group.child.length > 0 && (
          <div>{group.child.map((childGroup) => renderGroup(childGroup))}</div>
        )}
      </div>
    );

    return (
      <div>
        <h2>{curriculaData.name_en}</h2>
        <p>
          Total Credits: {curriculaData.total_credit}, Earned Credits:{" "}
          {curriculaData.earned_credit}
        </p>
        {curriculaData.child.map((group) => renderGroup(group))}
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
    <div className="bg-white p-4 rounded-[20px]">
      <h1>{categoryData.name_en}</h1>
      <p>Credits: {categoryData.credit}</p>
      <p>Note: {categoryData.note}</p>

      <div style={styles.container as React.CSSProperties}>
        <h1>Course Categories JSON</h1>
        {curriculaData && (
          <>
            <pre style={styles.jsonOutput as React.CSSProperties}>
              {JSON.stringify(curriculaData, null, 2)}
            </pre>
            <button style={styles.copyButton} onClick={handleCopyToClipboard}>
              Copy JSON
            </button>
          </>
        )}
      </div>
      {/* <div>{renderCurriculaData()}</div> */}
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
  copyButton: {
    padding: "10px 20px",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    fontWeight: "bold",
  },
};
