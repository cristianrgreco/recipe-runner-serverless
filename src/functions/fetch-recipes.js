const { isTokenValid } = require("../auth");
const { getRecipeRepository } = require("../db");
const { toRecipeDto } = require("../recipe-dto");
const corsHeaders = require("../cors-headers");

const sortByCreatedOrUpdatedDateDesc = (a, b) => {
  const bDate = b.createdAt || b.updatedAt;
  const aDate = a.createdAt || a.updatedAt;
  return bDate.getTime() - aDate.getTime();
};

module.exports.handler = async (event) => {
  console.log("Fetch recipes");
  const token = await isTokenValid(event.headers.Authorization);

  console.log(`Fetching recipes: ${token && token.email}`);
  const recipeRepository = await getRecipeRepository();
  const recipes = (await recipeRepository.findAll()).sort(sortByCreatedOrUpdatedDateDesc);

  console.log("Recipes found");
  const recipeDtos = recipes.map(toRecipeDto(token));

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify(recipeDtos),
  };
};
