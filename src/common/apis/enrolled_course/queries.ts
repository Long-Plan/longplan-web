import { coreApi } from "../../../core/connections";
import { EnrolledCourseCycle, TResponse } from "../../../types";
import { ApiRouteKey } from "../../constants/keys";

export function getEnrolledCourses(): Promise<
	TResponse<EnrolledCourseCycle[]>
> {
	return new Promise((resolve, reject) => {
		coreApi
			.get(`${ApiRouteKey.EnrolledCourse}`)
			.then((res) => {
				resolve(res.data);
			})
			.catch(reject);
	});
}
