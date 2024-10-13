import { coreApi } from "../../../core/connections";
import { TResponse } from "../../../types";
import { Major } from "../../../types/major";
import { ApiRouteKey } from "../../constants/keys";

export async function getMajors(): Promise<TResponse<Major[]>> {
	{
		return new Promise((resolve, reject) => {
			coreApi
				.get(`${ApiRouteKey.Majors}`)
				.then((res) => {
					resolve(res.data);
				})
				.catch(reject);
		});
	}
}
