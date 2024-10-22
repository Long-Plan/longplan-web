import { Category } from "../../../types";

export type CategoryTypeDisplay = {
	category: Category;
	childCategories: CategoryDisplay[];
	earnCredit: number;
	totalCredit: number;
};

export type CategoryDisplay = {
	category: Category;
	earnCredit: number;
	totalCredit: number;
};

const getCategoryTypeDisplayHelper = (
	category: Category,
	categoryTypeDisplays: CategoryTypeDisplay[],
	currentCategoryTypeDisplay: CategoryTypeDisplay | null
) => {
	if (category.type_id && category.is_display) {
		const categoryTypeDisplay: CategoryTypeDisplay = {
			category: category,
			childCategories: [],
			earnCredit: 0,
			totalCredit: category.credit || 0,
		};

		if (category.child_categories) {
			category.child_categories.forEach((childCategory) => {
				getCategoryTypeDisplayHelper(
					childCategory,
					categoryTypeDisplays,
					categoryTypeDisplay
				);
			});
		}
		categoryTypeDisplays.push(categoryTypeDisplay);
	} else if (category.is_display && currentCategoryTypeDisplay) {
		const categoryDisplay: CategoryDisplay = {
			category: category,
			earnCredit: 0,
			totalCredit: category.credit || 0,
		};

		if (category.child_categories) {
			category.child_categories.forEach((childCategory) => {
				getCategoryTypeDisplayHelper(
					childCategory,
					categoryTypeDisplays,
					currentCategoryTypeDisplay
				);
			});
		}
		currentCategoryTypeDisplay.childCategories.push(categoryDisplay);
	} else if (!category.is_display) {
		if (category.child_categories) {
			category.child_categories.forEach((childCategory) => {
				getCategoryTypeDisplayHelper(
					childCategory,
					categoryTypeDisplays,
					currentCategoryTypeDisplay
				);
			});
		}
	}
};

export const getCategoryTypeDisplay = (
	category: Category
): CategoryTypeDisplay[] => {
	const categoryTypeDisplays: CategoryTypeDisplay[] = [];
	if (category.child_categories) {
		category.child_categories.forEach((childCategory) => {
			getCategoryTypeDisplayHelper(childCategory, categoryTypeDisplays, null);
		});
	}
	return categoryTypeDisplays;
};
