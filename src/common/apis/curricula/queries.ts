import { coreApi } from "../../../core/connections";
import { TResponse } from "../../../types";
import { Curriculum } from "../../../types/curricula";
import { ApiRouteKey } from "../../constants/keys";

export async function getAllByMajorID(
	major_id: number
): Promise<TResponse<Curriculum>> {
	return new Promise((resolve, reject) => {
		coreApi
			.get(`${ApiRouteKey.CurriculaMajor}/${major_id}`)
			.then((res) => {
				resolve(res.data);
			})
			.catch(reject);
	});
}

export async function getCurriculaByMajorID(
	major_id: number
): Promise<TResponse<Curriculum[]>> {
	return new Promise((resolve, reject) => {
		coreApi
			.get(`${ApiRouteKey.Curricula}/major/${major_id}`)
			.then((res) => {
				resolve(res.data);
			})
			.catch(reject);
	});
}
