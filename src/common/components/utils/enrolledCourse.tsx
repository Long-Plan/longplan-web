import { coreApi } from "../../../core/connections";

type ApiResponse = {
  success: boolean;
  message: string;
  result: MappingEnrolledCourse[];
};

export type EnrolledCourse = {
  CourseNo: string;
  Credit: string;
  Grade: string;
};

export type MappingEnrolledCourse = {
  Year: string;
  Semester: string;
  Courses: EnrolledCourse[];
};

export async function getEnrolledCourses(): Promise<MappingEnrolledCourse[]> {
  try {
    const response = await coreApi
      .get<ApiResponse>(`/enrolled-courses/650612093`)
      .then((res) => res.data);
    return response.result;
  } catch (error) {
    throw new Error("Failed to fetch enrolled courses.");
  }
}
