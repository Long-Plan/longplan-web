import { coreApi } from "../../../core/connections";
import { CourseDetails } from "../dialogues/contents/coursedetail";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  result: T;
};

export interface Courses {
  course_no: string;
  semester: number;
  years: number;
  detail: CourseDetails;
  group?: string;
}

async function getCourseDetailByCourseNo(
  course_no: string
): Promise<CourseDetails> {
  try {
    const { data } = await coreApi.get<ApiResponse<CourseDetails>>(
      `/course-details/${course_no}`
    );
    if (!data.success) {
      throw new Error(data.message);
    }
    return data.result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch course details: ${error.message}`);
    } else {
      throw new Error("Failed to fetch course details: Unknown error");
    }
  }
}

async function getCourseDetailByCurriculumID(
  curriculumID: string
): Promise<Courses[]> {
  try {
    const { data } = await coreApi.get<ApiResponse<Courses[]>>(
      `/curricula/courses/${curriculumID}`
    );
    if (!data.success) {
      throw new Error(data.message);
    }
    return data.result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to fetch courses by curriculum ID: ${error.message}`
      );
    } else {
      throw new Error(
        "Failed to fetch courses by curriculum ID: Unknown error"
      );
    }
  }
}

export { getCourseDetailByCourseNo, getCourseDetailByCurriculumID };
