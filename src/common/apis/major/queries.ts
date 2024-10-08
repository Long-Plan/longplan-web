import { coreApi } from "../../../core/connections";
import { TResponse } from "../../../types";

import { Major } from "../../../types/major";
import { ApiRouteKey } from "../../constants/keys";

export async function getMajors(): Promise<Major[]> {
  {
    return new Promise((resolve, reject) => {
      coreApi
        .get<TResponse<Major[]>>(`${ApiRouteKey.Majors}`)
        .then((res) => {
          if (res.data.result) {
            resolve(res.data.result);
          } else {
            reject(new Error("No majors found"));
          }
        })
        .catch(reject);
    });
  }
}
