import { coreApi } from "../../../core/connections";
import { Account } from "../../../types/auth";
import { ApiRouteKey } from "../../constants/keys";

export function signInQuery(code: string): Promise<string> {
  return new Promise((resolve, reject) => {
    coreApi
      .post(ApiRouteKey.SignIn, null, {
        params: new URLSearchParams({ code }),
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch(reject);
  });
}

export function getUserDataQuery(): Promise<Account> {
  return new Promise((resolve, reject) => {
    coreApi
      .get(ApiRouteKey.Me)
      .then((res) => {
        resolve(res.data);
      })
      .catch(reject);
  });
}
