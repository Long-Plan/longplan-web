import { coreApi } from "../../../core/connections";
import { Major, TResponse } from "../../../types";
import { ApiRouteKey } from "../../constants/keys";

export function getMajors(): Promise<TResponse<Major[]>> {
	return new Promise((resolve, reject) => {
		coreApi
			.get(ApiRouteKey.Major)
			.then((res) => {
				resolve(res.data);
			})
			.catch(reject);
	});
}
