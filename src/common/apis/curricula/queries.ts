import { coreApi } from "../../../core/connections";
import { Curriculum, TResponse } from "../../../types";
import { ApiRouteKey } from "../../constants/keys";

export function getCurriculaByMajorID(
	majorID: number
): Promise<TResponse<Curriculum[]>> {
	return new Promise((resolve, reject) => {
		coreApi
			.get(`${ApiRouteKey.CurriculaByMajorID}/${majorID}`)
			.then((res) => {
				resolve(res.data);
			})
			.catch(reject);
	});
}

export function getCurriculumByID(
	curriculumID: number
): Promise<TResponse<Curriculum>> {
	return new Promise((resolve, reject) => {
		coreApi
			.get(`${ApiRouteKey.Curriculum}/${curriculumID}`)
			.then((res) => {
				resolve(res.data);
			})
			.catch(reject);
	});
}
