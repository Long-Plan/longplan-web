import { coreApi } from "../../../core/connections";
import { TResponse } from "../../../types";
import { ApiRouteKey } from "../../constants/keys";

export function postStudentTerm(): Promise<TResponse<null>> {
	return new Promise((resolve, reject) => {
		coreApi
			.post(ApiRouteKey.StudentTerm)
			.then((res) => {
				resolve(res.data);
			})
			.catch(reject);
	});
}

export function putStudentMajor(major_id: number): Promise<TResponse<null>> {
	return new Promise((resolve, reject) => {
		coreApi
			.put(ApiRouteKey.StudentMajor, { major_id })
			.then((res) => {
				resolve(res.data);
			})
			.catch(reject);
	});
}

export function putStudentCurriculum(
	student_curriculum_id: number
): Promise<TResponse<null>> {
	return new Promise((resolve, reject) => {
		coreApi
			.put(ApiRouteKey.StudentCurriculum, { student_curriculum_id })
			.then((res) => {
				resolve(res.data);
			})
			.catch(reject);
	});
}
