import { coreApi } from "../../../core/connections";
import { TResponse } from "../../../types";
import { CourseDetails, Course } from "../../../types/course";
import { ApiRouteKey } from "../../constants/keys";

export async function getCourseDetailByCourseNo(
  course_no: string
): Promise<CourseDetails> {
  return new Promise((resolve, reject) => {
    coreApi
      .get<TResponse<CourseDetails>>(
        `${ApiRouteKey.CourseDetails}/${course_no}`
      )
      .then((res) => {
        if (res.data.result) {
          resolve(res.data.result);
        }
      })
      .catch((error) => {
        if (error instanceof Error) {
          reject(new Error(`Failed to fetch course details: ${error.message}`));
        } else {
          reject(new Error("Failed to fetch course details: Unknown error"));
        }
      });
  });
}

export async function getCourseDetailByCurriculumID(
  curriculumID: string
): Promise<Course[]> {
  return new Promise((resolve, reject) => {
    coreApi
      .get<TResponse<Course[]>>(
        `${ApiRouteKey.CurriculaCourses}/${curriculumID}`
      )
      .then((res) => {
        if (!res.data.success) {
          reject(new Error(res.data.message));
        } else if (!res.data.result) {
          reject(new Error("Courses not found"));
        } else {
          resolve(res.data.result);
        }
      })
      .catch((error) => {
        if (error instanceof Error) {
          reject(
            new Error(
              `Failed to fetch courses by curriculum ID: ${error.message}`
            )
          );
        } else {
          reject(
            new Error("Failed to fetch courses by curriculum ID: Unknown error")
          );
        }
      });
  });
}
