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
    const response = await coreApi
      .get<ApiResponse>(`/course-details/${course_no}`)
      .then((res) => res.data);
    return response.result;
  } catch (error) {
    throw new Error("Failed to fetch enrolled courses.");
  }
}

export { getCourseDetailByCourseNo };
