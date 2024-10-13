import { coreApi } from "../../../core/connections";
import { Category, CategoryType } from "../../../types/category";
import { ApiRouteKey } from "../../constants/keys";

export async function getCategoryByCurriculumID(
	curriculumID: number
): Promise<Category> {
	{
		return new Promise((resolve, reject) => {
			coreApi
				.get(`${ApiRouteKey.Categories}/${curriculumID}`)
				.then((res) => {
					if (res.data.result) {
						resolve(res.data.result);
					} else {
						reject(new Error("No enrolled courses found"));
					}
				})
				.catch(reject);
		});
	}
}

export async function getAllTypes(): Promise<CategoryType[]> {
	{
		return new Promise((resolve, reject) => {
			coreApi
				.get(`${ApiRouteKey.CategoriesTypes}`)
				.then((res) => {
					if (res.data.result) {
						resolve(res.data.result);
					} else {
						reject(new Error("No enrolled courses found"));
					}
				})
				.catch(reject);
		});
	}
}
