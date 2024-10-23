import { coreApi } from "../../../core/connections";
import {
	StudentCurriculumCreate,
	StudentCurriculumQuestionAnswer,
	TResponse,
} from "../../../types";
import { ApiRouteKey } from "../../constants/keys";

export function postStudentCurricula(
	payload: StudentCurriculumCreate
): Promise<TResponse<number>> {
	return new Promise((resolve, reject) => {
		coreApi
			.post(ApiRouteKey.StudentCurricula, payload)
			.then((res) => {
				resolve(res.data);
			})
			.catch(reject);
	});
}

export function putStudentCurriculaQuestion(data: {
	student_curriculum_id: number;
	payload: StudentCurriculumQuestionAnswer[];
}): Promise<TResponse<number>> {
	return new Promise((resolve, reject) => {
		coreApi
			.put(
				`${ApiRouteKey.StudentCurricula}/${data.student_curriculum_id}/questions`,
				data.payload
			)
			.then((res) => {
				resolve(res.data);
			})
			.catch(reject);
	});
}

export function deleteStudentCurriculum(
	student_curriculum_id: number
): Promise<TResponse<undefined>> {
	return new Promise((resolve, reject) => {
		coreApi
			.delete(`${ApiRouteKey.StudentCurricula}/${student_curriculum_id}`)
			.then((res) => {
				resolve(res.data);
			})
			.catch(reject);
	});
}
