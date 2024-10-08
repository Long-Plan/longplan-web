import { coreApi } from "../../../core/connections";
import { Student, StudentUpdate, TResponse } from "../../../types";
import { ApiRouteKey } from "../../constants/keys";

export async function putStudent(
  student: StudentUpdate
): Promise<TResponse<Student>> {
  return new Promise((resolve, reject) => {
    coreApi
      .put(ApiRouteKey.Student, student)
      .then((res) => {
        resolve(res.data);
      })
      .catch(reject);
  });
}
