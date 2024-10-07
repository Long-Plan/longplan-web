import { coreApi } from "../../../core/connections";

interface Relationship {
  id: number;
  child_category_id: number;
  require_all: boolean;
  position: number;
  question_id: number | null;
  choice_id: number | null;
  cross_category_id: number | null;
}

interface Requirement {
  id: number;
  regex: string;
  credit: number;
}

interface ChildCategory {
  id: number;
  name_th: string;
  name_en: string;
  at_least: boolean;
  credit: number;
  type_id: number;
  note: string;
  created_at: string;
  updated_at: string;
  requirements: Requirement[] | null;
  relationships: Relationship[] | null;
  child_categories: ChildCategory[] | null;
  courses: string[] | null;
}

export interface Category {
  id: number;
  name_th: string;
  name_en: string;
  at_least: boolean;
  credit: number;
  type_id: number;
  note: string;
  created_at: string;
  updated_at: string;
  requirements: Requirement[] | null;
  relationships: Relationship[] | null;
  child_categories: ChildCategory[] | null;
  courses: string[] | null;
}

interface CategoriesAPIResponse {
  success: boolean;
  message: string;
  result: Category;
}

interface CategoryType {
  id: number;
  name_th: string;
  name_en: string;
  created_at: string;
  updated_at: string;
}

interface CategoryTypesAPIResponse {
  success: boolean;
  message: string;
  result: CategoryType[];
}

const fetchCategoriesAndTypes = async (): Promise<{
  categories: Category | null;
  types: CategoryType[] | null;
}> => {
  try {
    const [categoryResponse, typesResponse] = await Promise.all([
      coreApi
        .get<CategoriesAPIResponse>("/categories/1")
        .then((res) => res.data),
      coreApi
        .get<CategoryTypesAPIResponse>("/categories/types")
        .then((res) => res.data),
    ]);

    // Check if the responses are successful
    if (!categoryResponse.success || !typesResponse.success) {
      throw new Error("Failed to fetch data from API");
    }

    const categoryData: CategoriesAPIResponse = categoryResponse;
    const typesData: CategoryTypesAPIResponse = typesResponse;

    return { categories: categoryData.result, types: typesData.result };
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
