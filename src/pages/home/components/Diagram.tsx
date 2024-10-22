import { Fragment, useEffect, useMemo, useState } from "react";
import ToggleButton from "./ToggleButton";
import { CourseDetailOfCategoryDisplay } from "../HomePage";
import { semesterMap, yearMap } from "../../../common/components/utils/utils";
import {
  CategoryTypeDisplay,
  getCategoryTypeDisplay,
} from "../scripts/summary";
import { Category, CourseDetail } from "../../../types";
import {
  getCategoryDetailOfCourse,
  getDetailOfCategory,
} from "../../../common/components/utils/categoryProcess";
import { getCourseDetailsByCourseNo } from "../../../common/apis/coursedetails/queries";
import SubjectBox from "./SubjectBox";

interface Props {
  categoryCurriculum: Category;
  courseDetailDisplays: CourseDetailOfCategoryDisplay[];
}

function Diagram({ courseDetailDisplays, categoryCurriculum }: Props) {
  const [showSemester3, setShowSemester3] = useState(false); // Toggle state for semester 3
  const [categoryTypeDisplays, setCategoryTypeDisplays] = useState<
    CategoryTypeDisplay[]
  >([]);
  const [courseDetails, setCourseDetails] = useState<
    (CourseDetailOfCategoryDisplay & { courseDetail: CourseDetail })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setIsLoading(true);
        const courseDetails = await Promise.all(
          courseDetailDisplays.map(async (courseGroup) => {
            const data = await getCourseDetailsByCourseNo(
              courseGroup.course_no
            );
            if (!data.result) {
              throw new Error(
                `Course details not found for course no: ${courseGroup.course_no}`
              );
            }
            return { ...courseGroup, courseDetail: data.result };
          })
        );
        setCourseDetails(
          courseDetails as (CourseDetailOfCategoryDisplay & {
            courseDetail: CourseDetail;
          })[]
        );
        setCategoryTypeDisplays(getCategoryTypeDisplay(categoryCurriculum));
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [categoryCurriculum, courseDetailDisplays]);

  const getMaxYearByEnrolledCourses = () => {
    let maxYear = 4; // Set the minimum year to 4
    courseDetailDisplays.forEach((courseGroup) => {
      maxYear = Math.max(maxYear, Number(courseGroup.year));
    });
    return Array.from({ length: maxYear }, (_, i) => i + 1);
  };

  const mappingCourseGroup: {
    year: number;
    semester: number;
    courseGroup: (CourseDetailOfCategoryDisplay & {
      courseDetail: CourseDetail;
    })[];
    categoryTypeID: number;
  }[] = useMemo(() => {
    const result: {
      year: number;
      semester: number;
      courseGroup: (CourseDetailOfCategoryDisplay & {
        courseDetail: CourseDetail;
      })[];
      categoryTypeID: number;
    }[] = [];
    courseDetails.forEach((courseGroup) => {
      const categoryDetail = getCategoryDetailOfCourse(
        courseGroup.course_no,
        categoryCurriculum
      );
      if (!categoryDetail) return;
      const existedResult = result.find(
        (r) =>
          r.year === courseGroup.year &&
          r.semester === courseGroup.semester &&
          r.categoryTypeID === categoryDetail.categoryTypeID
      );
      if (!existedResult) {
        if (categoryDetail.categoryTypeID)
          result.push({
            year: courseGroup.year,
            semester: courseGroup.semester,
            courseGroup: [courseGroup],
            categoryTypeID: categoryDetail.categoryTypeID,
          });
      } else {
        existedResult.courseGroup.push(courseGroup);
      }
    });
    return result;
  }, [courseDetails, categoryCurriculum]);

  const getMaxCourseByType = (): {
    categoryTypeID: number;
    maxCourse: number;
  }[] => {
    const result: { categoryTypeID: number; maxCourse: number }[] = [];
    getMaxYearByEnrolledCourses().forEach((year) => {
      [1, 2, 3].forEach((semester) => {
        const semesterResult: { categoryTypeID: number; maxCourse: number }[] =
          [];
        courseDetails.forEach((courseGroup) => {
          if (courseGroup.year === year && courseGroup.semester === semester) {
            const categoryDetail = getCategoryDetailOfCourse(
              courseGroup.course_no,
              categoryCurriculum
            );
            if (!categoryDetail) return;
            const existedResult = semesterResult.find(
              (r) => r.categoryTypeID === categoryDetail.categoryTypeID
            );
            if (!existedResult) {
              if (categoryDetail.categoryTypeID)
                semesterResult.push({
                  categoryTypeID: categoryDetail.categoryTypeID,
                  maxCourse: 1,
                });
            } else {
              existedResult.maxCourse += 1;
            }
          }
        });
        semesterResult.forEach((r) => {
          const existedResult = result.find(
            (result) => result.categoryTypeID === r.categoryTypeID
          );
          if (!existedResult) {
            result.push(r);
          } else {
            existedResult.maxCourse = Math.max(
              existedResult.maxCourse,
              r.maxCourse
            );
          }
        });
      });
    });
    return result;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex justify-center">
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
        </div>

        <div className="flex justify-start text-sm m-4">
          <ToggleButton onClick={() => setShowSemester3((prev) => !prev)} />
        </div>
        <div className="overflow-x-auto overflow-y-hidden hover:overflow-x-auto w-full">
          <div className="flex w-full">
            {getMaxYearByEnrolledCourses().map((year) => {
              return (
                <div
                  key={year}
                  className="flex flex-col border border-b-0 rounded-[20px]"
                >
                  <h1 className="text-center py-1 font-semibold">
                    {yearMap[String(year)]}
                  </h1>
                  <div className="flex h-full">
                    {[1, 2].map((semester) => {
                      return (
                        <div key={semester} className="border rounded-[20px]">
                          <p
                            className="text-center text-[10px] text-blue-shadeb6 w-30 
								 px-6 py-0.5 bg-blue-shadeb05 rounded-t-[20px] cursor-default"
                          >
                            {semesterMap[String(semester)]}
                          </p>
                          {categoryTypeDisplays.map((categoryTypeDisplay) => {
                            return (
                              <Fragment
                                key={
                                  categoryTypeDisplay.category.type_id ??
                                  0 + year + semester
                                }
                              >
                                <div
                                  style={{
                                    backgroundColor: `rgba(${parseInt(
                                      categoryTypeDisplay.category.secondary_color.slice(
                                        1,
                                        3
                                      ),
                                      16
                                    )}, ${parseInt(
                                      categoryTypeDisplay.category.secondary_color.slice(
                                        3,
                                        5
                                      ),
                                      16
                                    )}, ${parseInt(
                                      categoryTypeDisplay.category.secondary_color.slice(
                                        5,
                                        7
                                      ),
                                      16
                                    )}, 0.4)`, // Adjust the last value for opacity
                                  }}
                                  className="py-4 px-2 flex flex-col gap-1"
                                >
                                  {mappingCourseGroup.filter(
                                    (f) =>
                                      f.year === year &&
                                      f.semester === semester &&
                                      f.categoryTypeID ===
                                        categoryTypeDisplay.category.type_id
                                  ).length > 0 &&
                                    mappingCourseGroup
                                      .filter(
                                        (f) =>
                                          f.year === year &&
                                          f.semester === semester &&
                                          f.categoryTypeID ===
                                            categoryTypeDisplay.category.type_id
                                      )[0]
                                      .courseGroup.map((courseGroup) => {
                                        const categoryDetail =
                                          getDetailOfCategory(
                                            courseGroup.categoryDisplayID ?? 0,
                                            categoryCurriculum
                                          );

                                        if (!categoryDetail) return null;
                                        return (
                                          <div
                                            key={courseGroup.course_no}
                                            className="inline-flex items-start justify-end rounded-[10px] w-[105px] h-[45px] mb-1.5"
                                          >
                                            <SubjectBox
                                              primaryColor={
                                                courseGroup.grade !== "W" &&
                                                courseGroup.grade !== "F"
                                                  ? categoryDetail.primary_color
                                                  : "#d1d5db"
                                              }
                                              secondColor={
                                                categoryDetail.secondary_color
                                              }
                                              isEnrolled={
                                                courseGroup.credit
                                                  ? true
                                                  : false
                                              }
                                              courseDetail={
                                                courseGroup.courseDetail
                                              }
                                              year={courseGroup.year}
                                              semester={courseGroup.semester}
                                              group={categoryDetail.name_en}
                                            />
                                          </div>
                                        );
                                      })}
                                  {Array.from(
                                    {
                                      length:
                                        (getMaxCourseByType().find(
                                          (f) =>
                                            f.categoryTypeID ===
                                            categoryTypeDisplay.category.type_id
                                        )?.maxCourse || 0) -
                                        (mappingCourseGroup.find(
                                          (f) =>
                                            f.year === year &&
                                            f.semester === semester &&
                                            f.categoryTypeID ===
                                              categoryTypeDisplay.category
                                                .type_id
                                        )?.courseGroup.length ?? 0),
                                    },
                                    (_, i) => i + 1
                                  ).map((courseGroup) => {
                                    return (
                                      <div
                                        key={year + semester + courseGroup}
                                        className="inline-flex items-start justify-end rounded-[10px] border border-solid border-gray-300 w-[105px] h-[45px] mb-1.5"
                                      ></div>
                                    );
                                  })}
                                </div>
                                <div className="border border-dashed w-full border-y-1 border-blue-shadeb2"></div>
                              </Fragment>
                            );
                          })}
                          <div className="flex flex-col items-center justify-center w-full rounded-b-[20px] bg-blue-shadeb05 py-1">
                            {courseDetailDisplays
                              .filter(
                                (courseGroup) =>
                                  courseGroup.year === year &&
                                  courseGroup.semester === semester
                              )
                              .reduce((acc, courseGroup) => {
                                return acc + (courseGroup.credit || 0);
                              }, 0) > 0 ? (
                              <div className="flex items-center justify-center w-auto h-6 px-4 bg-blue-shadeb3 rounded-2xl border border-solid border-blue-shadeb4 text-white hover:scale-150 transition-all duration-300">
                                <span className="text-sm">
                                  {courseDetailDisplays
                                    .filter(
                                      (courseGroup) =>
                                        courseGroup.year === year &&
                                        courseGroup.semester === semester
                                    )
                                    .reduce((acc, courseGroup) => {
                                      return acc + (courseGroup.credit || 0);
                                    }, 0)}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center w-auto h-6 px-4 bg-white rounded-2xl border-2 border-solid border-blue-shadeb3 text-blue-shadeb3">
                                <span className="text-xs">0</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {showSemester3 && (
                      <div key={3} className="border rounded-[20px]">
                        <p className="text-center text-[10px] text-blue-shadeb6 w-30 px-6 py-0.5 bg-blue-shadeb05 rounded-t-[20px] cursor-default">
                          {semesterMap[String(3)]}
                        </p>
                        {categoryTypeDisplays.map((categoryTypeDisplay) => {
                          return (
                            <Fragment
                              key={
                                categoryTypeDisplay.category.type_id ??
                                0 + year + 3
                              }
                            >
                              <div
                                style={{
                                  backgroundColor: `rgba(${parseInt(
                                    categoryTypeDisplay.category.secondary_color.slice(
                                      1,
                                      3
                                    ),
                                    16
                                  )}, ${parseInt(
                                    categoryTypeDisplay.category.secondary_color.slice(
                                      3,
                                      5
                                    ),
                                    16
                                  )}, ${parseInt(
                                    categoryTypeDisplay.category.secondary_color.slice(
                                      5,
                                      7
                                    ),
                                    16
                                  )}, 0.4)`, // Adjust the last value for opacity
                                }}
                                className="py-4 px-2 bg-opacity-50 flex flex-col gap-1"
                              >
                                {mappingCourseGroup.filter(
                                  (f) =>
                                    f.year === year &&
                                    f.semester === 3 &&
                                    f.categoryTypeID ===
                                      categoryTypeDisplay.category.type_id
                                ).length > 0 &&
                                  mappingCourseGroup
                                    .filter(
                                      (f) =>
                                        f.year === year &&
                                        f.semester === 3 &&
                                        f.categoryTypeID ===
                                          categoryTypeDisplay.category.type_id
                                    )[0]
                                    .courseGroup.map((courseGroup) => {
                                      const categoryDetail =
                                        getDetailOfCategory(
                                          courseGroup.categoryDisplayID ?? 0,
                                          categoryCurriculum
                                        );

                                      if (!categoryDetail) return null;
                                      return (
                                        <div
                                          key={courseGroup.course_no}
                                          className="inline-flex items-start justify-end rounded-[10px] border border-solid border-gray-300 w-[110px] h-[45px] mb-1.5"
                                        >
                                          <SubjectBox
                                            primaryColor={
                                              courseGroup.grade !== "W" &&
                                              courseGroup.grade !== "F"
                                                ? categoryDetail.primary_color
                                                : "#d1d5db"
                                            }
                                            secondColor={
                                              categoryDetail.secondary_color
                                            }
                                            isEnrolled={
                                              courseGroup.credit ? true : false
                                            }
                                            courseDetail={
                                              courseGroup.courseDetail
                                            }
                                            year={courseGroup.year}
                                            semester={courseGroup.semester}
                                            group={categoryDetail.name_en}
                                          />
                                        </div>
                                      );
                                    })}
                                {Array.from(
                                  {
                                    length:
                                      (getMaxCourseByType().find(
                                        (f) =>
                                          f.categoryTypeID ===
                                          categoryTypeDisplay.category.type_id
                                      )?.maxCourse || 0) -
                                      (mappingCourseGroup.find(
                                        (f) =>
                                          f.year === year &&
                                          f.semester === 3 &&
                                          f.categoryTypeID ===
                                            categoryTypeDisplay.category.type_id
                                      )?.courseGroup.length ?? 0),
                                  },
                                  (_, i) => i + 1
                                ).map((courseGroup) => {
                                  return (
                                    <div
                                      key={year + 3 + courseGroup}
                                      className="inline-flex items-start justify-end rounded-[10px] border border-solid border-gray-300 w-[110px] h-[45px] mb-1.5"
                                    ></div>
                                  );
                                })}
                              </div>
                              <div className="border border-dashed w-full border-y-1 border-blue-shadeb2"></div>
                            </Fragment>
                          );
                        })}
                        <div className="flex flex-col items-center justify-center w-full rounded-b-[20px] bg-blue-shadeb05 py-1">
                          {courseDetailDisplays
                            .filter(
                              (courseGroup) =>
                                courseGroup.year === year &&
                                courseGroup.semester === 3
                            )
                            .reduce((acc, courseGroup) => {
                              return acc + (courseGroup.credit || 0);
                            }, 0) > 0 ? (
                            <div className="flex items-center justify-center w-auto h-6 px-4 bg-blue-shadeb3 rounded-2xl border border-solid border-blue-shadeb4 text-white hover:scale-150 transition-all duration-300">
                              <span className="text-sm">
                                {courseDetailDisplays
                                  .filter(
                                    (courseGroup) =>
                                      courseGroup.year === year &&
                                      courseGroup.semester === 3
                                  )
                                  .reduce((acc, courseGroup) => {
                                    return acc + (courseGroup.credit || 0);
                                  }, 0)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-auto h-6 px-4 bg-white rounded-2xl border-2 border-solid border-blue-shadeb3 text-blue-shadeb3">
                              <span className="text-xs">0</span>
                            </div>
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
  );
}

export default Diagram;
