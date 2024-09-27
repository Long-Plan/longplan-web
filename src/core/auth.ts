import { getUserDataQuery } from "../common/apis/auth/queries";
import { LocalStorageKey } from "../common/constants/keys";
import { coreApi } from "./connections";

export async function validateLocalToken() {
  try {
    const auth = localStorage.getItem(LocalStorageKey.Auth);

    if (!auth) {
      throw new Error("No token found");
    }

    coreApi.defaults.headers.common["Authorization"] = `Bearer ${auth}`;

    const data = await getUserDataQuery();

    return data;
  } catch {
    coreApi.defaults.headers.common["Authorization"] = "";
    localStorage.removeItem(LocalStorageKey.Auth);
  }

  return null;
}
