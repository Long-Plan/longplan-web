import { coreApi } from "../../../core/connections";
import { CourseDetails } from "../dialogues/contents/coursedetail";

type ApiResponse = {
  success: boolean;
  message: string;
  result: CourseDetails;
};

async function getCourseDetailByCourseNo(
  course_no: string
): Promise<CourseDetails> {
  try {
    const response = await coreApi.get<ApiResponse>(
      `http://10.10.182.135:8000/api/v1/course-details/${course_no}`
    );
    return response.data.result;
  } catch (error) {
    throw new Error("Failed to fetch enrolled courses.");
  }
}

export { getCourseDetailByCourseNo };
