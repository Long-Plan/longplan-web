import { coreApi } from "../../../core/connections";
import { TResponse } from "../../../types";
import { StudentCurriculumCreate } from "../../../types/student_curricula";
import { ApiRouteKey } from "../../constants/keys";

// export async function updateQuestionAnswers(
//   studentCurriculumID: string,
//   answers: StudentCurriculumQuestionAnswer
// ): Promise<TResponse<any>> {
//   return new Promise((resolve, reject) => {
//     coreApi
//       .put(
//         `${ApiRouteKey.StudentCurricula}/${studentCurriculumID}/questions`,
//         answers
//       )
//       .then((res) => {
//         resolve(res.data);
//       })
//       .catch(reject);
//   });
// }

export async function postStudentCurriculum(
	studentCurriculum: StudentCurriculumCreate
): Promise<TResponse<StudentCurriculumCreate>> {
	return new Promise((resolve, reject) => {
		coreApi
			.post(`${ApiRouteKey.StudentCurricula}`, studentCurriculum)
			.then((res) => {
				resolve(res.data);
			})
			.catch(reject);
	});
}
