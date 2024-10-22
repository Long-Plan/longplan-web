import { Category, CategoryType } from "../../../types";
import {
	getCategoriesByCurriculumID,
	getCategoryTypes,
} from "../../apis/category/queries";

const fetchCategoriesAndTypes = async (
	curriculum_id: number
): Promise<{
	categories: Category | null;
	types: CategoryType[] | null;
}> => {
	try {
		const categoryData = await getCategoriesByCurriculumID(curriculum_id); // Fetch categories by curriculum ID
		const typesData = await getCategoryTypes(); // Fetch all types

		return {
			categories: categoryData.result ?? null,
			types: typesData.result ?? null,
		};
	} catch (error) {
		console.error("Error fetching categories or types", error);
		return { categories: null, types: null }; // Return null on error
	}
};

// Recursive function to map and group categories by their type, following specific path based on question_id and choice_id
const groupCategoriesByType = (
	category: Category,
	typesMap: Record<number, string>,
	question_id?: number,
	choice_id?: number
): Category & { type_name: string } => {
	// If question_id and choice_id are provided, find the matching relationships
	let nextChildCategories: Category[] = [];

	if (question_id !== undefined && choice_id !== undefined) {
		const matchingRelationships = category.relationships?.filter(
			(relationship) =>
				relationship.question_id === question_id &&
				relationship.choice_id === choice_id
		);

		// If matching relationships are found, find the corresponding child categories
		if (matchingRelationships) {
			nextChildCategories =
				category.child_categories?.filter((child) =>
					matchingRelationships.some(
						(relationship) => child.id === relationship.child_category_id
					)
				) || [];
		}
	}

	// If no question_id/choice_id are provided, or no matching relationships are found, include all child categories
	const childCategories = nextChildCategories.length
		? nextChildCategories.map((childCategory) =>
				groupCategoriesByType(childCategory, typesMap, question_id, choice_id)
		  )
		: category.child_categories?.map((childCategory) =>
				groupCategoriesByType(childCategory, typesMap, question_id, choice_id)
		  ) || [];

	if (!category.type_id) {
		throw new Error(`Category ${category.id} has no type_id`);
	}
	return {
		...category,
		type_name: typesMap[category.type_id] || "Unknown Type",
		child_categories: childCategories,
	};
};

// Function to map categories to their types
export const mapCategoriesToTypes = async (
	curriculum_id: number,
	question_id?: number,
	choice_id?: number
): Promise<(Category & { type_name: string }) | null> => {
	const { categories, types } = await fetchCategoriesAndTypes(curriculum_id);

	if (!categories || !types) {
		console.error("Failed to load categories or types");
		return null;
	}

	// Create a map of types using type_id as the key
	const typesMap = types.reduce(
		(acc: Record<number, string>, type: CategoryType) => {
			acc[type.id] = type.name_en;
			return acc;
		},
		{}
	);

	// Apply grouping with the question_id and choice_id filters to follow a specific path
	const groupedCategories = groupCategoriesByType(
		categories,
		typesMap,
		question_id,
		choice_id
	);

	return groupedCategories;
};
