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

export async function getEnrolledCourses(): Promise<ApiResponse> {
  try {
    const response = await coreApi.get(
      `http://10.10.182.135:8000/api/v1/enrolled-courses`
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch enrolled courses.");
  }
}
