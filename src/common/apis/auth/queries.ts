import { coreApi } from "../../../core/connections";
import { TResponse, Account } from "../../../types";
import { ApiRouteKey } from "../../constants/keys";

export function signInQuery(code: string): Promise<TResponse<string>> {
  return new Promise((resolve, reject) => {
    coreApi
      .post(
        ApiRouteKey.SignIn,
        null,
        IS_LOCAL_DEVELOPMENT
          ? {
              params: new URLSearchParams({
                code,
                local: "true",
              }),
            }
          : {
              params: new URLSearchParams({
                code,
              }),
            }
      )
      .then((res) => {
        resolve(res.data);
      })
      .catch(reject);
  });
}

export function getUserDataQuery(): Promise<TResponse<Account>> {
  return new Promise((resolve, reject) => {
    coreApi
      .get(ApiRouteKey.Me)
      .then((res) => {
        resolve(res.data);
      })
      .catch(reject);
  });
}
