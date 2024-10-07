import { Category, CategoryType } from "../../../types/category";
import {
  getAllTypes,
  getCategoryByCurriculumID,
} from "../../apis/category/queries";

const fetchCategoriesAndTypes = async (): Promise<{
  categories: Category | null;
  types: CategoryType[] | null;
}> => {
  try {
    const categoryData = await getCategoryByCurriculumID(1); // Fetch categories by curriculum ID
    const typesData = await getAllTypes(); // Fetch all types

    return { categories: categoryData, types: typesData };
  } catch (error) {
    console.error("Error fetching categories or types", error);
    return { categories: null, types: null }; // Return null on error
  }
};

// Recursive function to map and group categories by their type
const groupCategoriesByType = (
  category: Category,
  typesMap: Record<number, string>
): Category & { type_name: string } => {
  return {
    ...category,
    type_name: typesMap[category.type_id] || "Unknown Type", // Map type_id to type name
    child_categories:
      category.child_categories?.map((childCategory) =>
        groupCategoriesByType(childCategory, typesMap)
      ) || null, // Recursively process child categories
  };
};

// Function to map categories to their types
export const mapCategoriesToTypes = async (): Promise<
  (Category & { type_name: string }) | null
> => {
  const { categories, types } = await fetchCategoriesAndTypes();

  if (!categories || !types) {
    console.error("Failed to load categories or types");
    return null;
  }

  // Create a map of types using type_id as the key
  const typesMap = types.reduce(
    (acc: Record<number, string>, type: CategoryType) => {
      acc[type.id] = type.name_en; // Store the English name of the type
      return acc;
    },
    {}
  );

  const groupedCategories = groupCategoriesByType(categories, typesMap);

  return groupedCategories;
};
