import { useEffect, useMemo, useState } from "react";
import useDialogueContext from "../../common/contexts/DialogueContext";
import CurriculumSetting from "../../common/components/dialogues/contents/CurriculumSetting";
import useAccountContext from "../../common/contexts/AccountContext";
import { useNavigate } from "react-router-dom";
import { ClientRouteKey } from "../../common/constants/keys";
import useEnrolledCourseContext from "../../common/contexts/EnrolledCourseContext";
import { getEnrolledCourses } from "../../common/apis/enrolled_course/queries";
import { getStudentCurriculaByStudent } from "../../common/apis/student_curriculum/queries";
import { Category, EnrolledCourseCycle, StudentCurriculum } from "../../types";
import StudentCurriculumDropdown from "./components/StudentCurriculumDropdown";
import SummaryCredit from "./components/SummaryCredit";
import { getCategoriesByCurriculumID } from "../../common/apis/category/queries";
import {
  getCategoryAnswerFiltered,
  getCategoryDetailOfCourseNotFE,
} from "../../common/components/utils/categoryProcess";
import Diagram from "./components/Diagram";
import { PageContainer } from "../../common/components/container/PageContainer";
import ContainerWithoutHeader from "../../common/components/container/WithoutHeaderContainer";

export type CourseDetailOfCategoryDisplay = {
  course_no: string;
  semester: number;
  year: number;
  credit?: number;
  categoryDisplayID?: number;
  categoryTypeID?: number;
  grade?: string;
};

function HomePage() {
  const { addDialogue } = useDialogueContext();
  const { accountData } = useAccountContext();
  const { setEnrolledCoruseData } = useEnrolledCourseContext();
  const [selectedStudentCurriculum, setSelectedStudentCurriculum] =
    useState<StudentCurriculum | null>(null);
  const [studentCurricula, setStudentCurricula] = useState<StudentCurriculum[]>(
    []
  );
  const { enrolledCourseData } = useEnrolledCourseContext();
  const [selectedCategoryCurriculum, setSelectedCategoryCurriculum] =
    useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const getCourseDetailDisplay = (
    studentCurriculum: StudentCurriculum,
    enrolledCourseCycles: EnrolledCourseCycle[],
    categoryCurriculum: Category
  ): CourseDetailOfCategoryDisplay[] => {
    const courseDetailDisplays: CourseDetailOfCategoryDisplay[] = [];
    if (studentCurriculum.courses) {
      studentCurriculum.courses.forEach((course) => {
        if (
          !getCategoryDetailOfCourseNotFE(course.course_no, categoryCurriculum)
            ?.categoryID
        )
          return;

        if (
          courseDetailDisplays.find(
            (courseDetailDisplay) =>
              courseDetailDisplay.course_no === course.course_no
          )
        )
          return;

        const courseDetailDisplay: CourseDetailOfCategoryDisplay = {
          course_no: course.course_no,
          semester: course.semester,
          year: course.year,
        };

        courseDetailDisplays.push(courseDetailDisplay);
      });
    }

    enrolledCourseCycles.forEach((enrolledCourseCycle) => {
      enrolledCourseCycle.courses.forEach((enrolledCourse) => {
        const courseExisted: CourseDetailOfCategoryDisplay | undefined =
          courseDetailDisplays.find((courseDetailDisplay) => {
            return (
              courseDetailDisplay.course_no === enrolledCourse.course_no &&
              courseDetailDisplay.credit === undefined
            );
          });

        if (courseExisted) {
          courseExisted.semester = parseInt(enrolledCourseCycle.semester);
          courseExisted.year = parseInt(enrolledCourseCycle.year);
          courseExisted.grade = enrolledCourse.grade;

          if (enrolledCourse.grade !== "W" && enrolledCourse.grade !== "F") {
            courseExisted.credit = parseInt(enrolledCourse.credit);
          } else {
            courseExisted.credit = 0;
          }
        } else {
          const courseDetailDisplay: CourseDetailOfCategoryDisplay = {
            course_no: enrolledCourse.course_no,
            semester: parseInt(enrolledCourseCycle.semester),
            year: parseInt(enrolledCourseCycle.year),
            grade: enrolledCourse.grade,

            credit:
              enrolledCourse.grade !== "W" && enrolledCourse.grade !== "F"
                ? parseInt(enrolledCourse.credit)
                : 0,
          };
          courseDetailDisplays.push(courseDetailDisplay);
        }
      });
    });
    return courseDetailDisplays;
  };

  // enrolled_courses, student_curriculum, curriculum, color box
  const navigate = useNavigate();
  useEffect(() => {
    if (accountData) {
      if (accountData.studentData) {
        if (!accountData.studentData.student_curriculum_id) {
          const curriculumSetting = {
            children: <CurriculumSetting />,
            priority: -998,
          };
          addDialogue(curriculumSetting);
          setIsLoading(false);
        } else {
          Promise.all([getEnrolledCourses(), getStudentCurriculaByStudent()])
            .then(([enrolledCoursesData, studentCurriculaData]) => {
              setEnrolledCoruseData(enrolledCoursesData.result ?? []);
              setStudentCurricula(studentCurriculaData.result ?? []);
              if (
                studentCurriculaData.result &&
                studentCurriculaData.result.length > 0
              ) {
                const currentStudentCurriculum =
                  studentCurriculaData.result.find(
                    (curriculum) =>
                      curriculum.id ===
                      accountData.studentData?.student_curriculum_id
                  ) ?? null;
                if (currentStudentCurriculum) {
                  setSelectedStudentCurriculum(currentStudentCurriculum);
                  getCategoriesByCurriculumID(
                    currentStudentCurriculum.curriculum_id
                  ).then((data) => {
                    if (data.result) {
                      setSelectedCategoryCurriculum(
                        getCategoryAnswerFiltered(
                          data.result ?? null,
                          currentStudentCurriculum.answers
                        )
                      );
                    }
                    setIsLoading(false);
                  });
                } else {
                  setIsLoading(false);
                }
              } else {
                setIsLoading(false);
              }
            })
            .catch(() => {
              setIsError(true);
              setIsLoading(false);
            });
        }
      } else {
        navigate(ClientRouteKey.Login, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountData]);

  const courseDetailDisplays = useMemo(() => {
    if (!selectedStudentCurriculum || !selectedCategoryCurriculum) return [];
    return getCourseDetailDisplay(
      selectedStudentCurriculum,
      enrolledCourseData,
      selectedCategoryCurriculum
    );
  }, [
    selectedStudentCurriculum,
    enrolledCourseData,
    selectedCategoryCurriculum,
  ]);

  if (isLoading) {
    return (
      <div className="w-screen min-h-screen items-center justify-center text-center">
        Loading...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-screen min-h-screen items-center justify-center text-center">
        An error occurred. Please try again later.
      </div>
    );
  }

  if (!selectedStudentCurriculum || !selectedCategoryCurriculum) {
    return (
      <div className="w-screen min-h-screen items-center justify-center text-center">
        Loading...
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="w-full items-center justify-center">
        <StudentCurriculumDropdown
          studentCurricula={studentCurricula}
          selectedStudentCurriculum={selectedStudentCurriculum}
          setSelectedStudentCurriculum={setSelectedStudentCurriculum}
        />
      </div>
      <div className="w-full pt-4 pr-8 pl-[85px] flex gap-4">
        <ContainerWithoutHeader>
          <Diagram
            courseDetailDisplays={courseDetailDisplays}
            categoryCurriculum={selectedCategoryCurriculum}
          />
        </ContainerWithoutHeader>
        <div className="w-[400px] bg-white rounded-3xl drop-shadow-sm">
          <SummaryCredit
            courseDetailDisplays={courseDetailDisplays}
            categoryCurriculum={selectedCategoryCurriculum}
          />
        </div>
      </div>
    </PageContainer>
  );
}

export default HomePage;
