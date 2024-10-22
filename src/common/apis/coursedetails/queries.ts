import { coreApi } from "../../../core/connections";
import { TResponse, CourseDetail } from "../../../types";
import { ApiRouteKey } from "../../constants/keys";

export function getCourseDetailsByCourseNo(
	course_no: string
): Promise<TResponse<CourseDetail>> {
	return new Promise((resolve, reject) => {
		coreApi
			.get(`${ApiRouteKey.CourseDetail}/${course_no}`)
			.then((res) => {
				resolve(res.data);
			})
			.catch(reject);
	});
}
