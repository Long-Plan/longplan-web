import { coreApi } from "../../../core/connections";
import { MappingEnrolledCourse } from "../../../types/enrolledcourse";
import { ApiRouteKey } from "../../constants/keys";

export async function getEnrolledCourses(): Promise<MappingEnrolledCourse[]> {
	{
		return new Promise((resolve, reject) => {
			coreApi
				.get(`${ApiRouteKey.EnrolledCourse}`)
				.then((res) => {
					if (res.data.result) {
						resolve(res.data.result);
					} else {
						reject(new Error("No enrolled courses found"));
					}
				})
				.catch(reject);
		});
	}
}
