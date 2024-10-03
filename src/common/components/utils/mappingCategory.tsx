// Function to fetch categories and types with proper typing

// Interface for Relationships within categories
interface Relationship {
  id: number;
  child_category_id: number;
  require_all: boolean;
  position: number;
  question_id: number | null;
  choice_id: number | null;
  cross_category_id: number | null;
}

// Interface for Requirements within categories
interface Requirement {
  id: number;
  regex: string;
  credit: number;
}

// Interface for Child Categories and Courses
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

// Interface for the main Category
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

// Main response interface for Categories
interface CategoriesAPIResponse {
  success: boolean;
  message: string;
  result: Category;
}

// Interface for each type of category
interface CategoryType {
  id: number;
  name_th: string;
  name_en: string;
  created_at: string;
  updated_at: string;
}

// Main response interface for Category Types
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
      fetch("http://10.10.182.135:8000/api/v1/categories/1"),
      fetch("http://10.10.182.135:8000/api/v1/categories/types"),
    ]);

    // Check if the responses are successful
    if (!categoryResponse.ok || !typesResponse.ok) {
      throw new Error("Failed to fetch data from API");
    }

    const categoryData: CategoriesAPIResponse = await categoryResponse.json();
    const typesData: CategoryTypesAPIResponse = await typesResponse.json();

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

  // Recursively group categories by their type
  const groupedCategories = groupCategoriesByType(categories, typesMap);

  return groupedCategories;
};

// Example usage of the function (for debugging purposes)
(async () => {
  const groupedCategories = await mapCategoriesToTypes();

  // Output the result to check the structure
  if (groupedCategories) {
    console.log(
      "Grouped Categories:",
      JSON.stringify(groupedCategories, null, 2)
    );
  }
})();
