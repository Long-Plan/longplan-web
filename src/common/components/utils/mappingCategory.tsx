// Function to fetch categories and types
const fetchCategoriesAndTypes = async () => {
  try {
    const [categoryResponse, typesResponse] = await Promise.all([
      fetch("http://10.10.182.135:8000/api/v1/categories/1"),
      fetch("http://10.10.182.135:8000/api/v1/categories/types"),
    ]);

    const categoryData = await categoryResponse.json();
    const typesData = await typesResponse.json();

    return { categories: categoryData.result, types: typesData.result };
  } catch (error) {
    console.error("Error fetching categories or types", error);
    return { categories: null, types: null }; // Return null on error
  }
};

// Recursive function to map and group categories
const groupCategoriesByType = (category: any, typesMap: any) => {
  return {
    ...category,
    type_name: typesMap[category.type_id], // Map type_id to type name
    child_categories: category.child_categories?.map((childCategory: any) =>
      groupCategoriesByType(childCategory, typesMap)
    ), // Recursively process child categories
  };
};

// Function to map categories to their types
const mapCategoriesToTypes = async () => {
  const { categories, types } = await fetchCategoriesAndTypes();

  if (!categories || !types) {
    console.error("Failed to load categories or types");
    return null;
  }

  // Create a map of types using type_id as the key
  const typesMap = types.reduce((acc: any, type: any) => {
    acc[type.id] = type.name_en; // Store the English name of the type
    return acc;
  }, {});

  // Recursively group categories by their type
  const groupedCategories = groupCategoriesByType(categories, typesMap);

  return groupedCategories;
};

export { mapCategoriesToTypes };
