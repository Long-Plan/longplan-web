import { coreApi } from "../../../core/connections";
import { TResponse } from "../../../types";
import { StudentCurriculumQuestionAnswer } from "../../../types/student_curricula";
import { ApiRouteKey } from "../../constants/keys";

export async function updateQuestionAnswers(
  studentCurriculumID: string,
  answers: StudentCurriculumQuestionAnswer
): Promise<TResponse<any>> {
  return new Promise((resolve, reject) => {
    coreApi
      .put(
        `${ApiRouteKey.StudentCurricula}/${studentCurriculumID}/questions`,
        answers
      )
      .then((res) => {
        resolve(res.data);
      })
      .catch(reject);
  });
}
