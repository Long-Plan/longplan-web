import { coreApi } from "../../../core/connections";
import { Category, CategoryType, TResponse } from "../../../types";
import { ApiRouteKey } from "../../constants/keys";

export function getCategoriesByCurriculumID(
	curriculum_id: number
): Promise<TResponse<Category>> {
	return new Promise((resolve, reject) => {
		coreApi
			.get(`${ApiRouteKey.Category}/${curriculum_id}`)
			.then((res) => {
				resolve(res.data);
			})
			.catch(reject);
	});
}

export function getCategoryTypes(): Promise<TResponse<CategoryType[]>> {
	return new Promise((resolve, reject) => {
		coreApi
			.get(ApiRouteKey.CategoryType)
			.then((res) => {
				resolve(res.data);
			})
			.catch(reject);
	});
}
