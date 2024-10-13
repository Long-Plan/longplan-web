import { coreApi } from "../../../core/connections";
import { TResponse } from "../../../types";
import { ApiRouteKey } from "../../constants/keys";

export async function postStudentTermAccept(): Promise<TResponse<undefined>> {
	return new Promise((resolve, reject) => {
		coreApi
			.post(`${ApiRouteKey.StudentTerm}`)
			.then((res) => {
				resolve(res.data);
			})
			.catch(reject);
	});
}

export async function putStudentMajorUpdate(payload: {
	major_id: number;
}): Promise<TResponse<undefined>> {
	return new Promise((resolve, reject) => {
		coreApi
			.put(`${ApiRouteKey.StudentMajor}`, payload)
			.then((res) => {
				resolve(res.data);
			})
			.catch(reject);
	});
}
