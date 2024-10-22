import { coreApi } from "../../../core/connections";
import { TResponse, StudentCurriculum } from "../../../types";
import { ApiRouteKey } from "../../constants/keys";

export function getStudentCurriculaByID(
	student_curriculum_id: number
): Promise<TResponse<StudentCurriculum>> {
	return new Promise((resolve, reject) => {
		coreApi
			.get(`${ApiRouteKey.StudentCurricula}/${student_curriculum_id}`)
			.then((res) => {
				resolve(res.data);
			})
			.catch(reject);
	});
}

export function getStudentCurriculaByStudent(): Promise<
	TResponse<StudentCurriculum[]>
> {
	return new Promise((resolve, reject) => {
		coreApi
			.get(`${ApiRouteKey.StudentCurriculaByStudent}`)
			.then((res) => {
				resolve(res.data);
			})
			.catch(reject);
	});
}
