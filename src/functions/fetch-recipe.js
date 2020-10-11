const { isTokenValid } = require("../auth");
const { getRecipeRepository } = require("../db");
const { toRecipeDto } = require("../recipe-dto");
const corsHeaders = require("../cors-headers");

module.exports.handler = async (event) => {
  console.log("Fetch recipe");
  const token = await isTokenValid(event.headers.Authorization);

  console.log(`Fetching recipe: ${token && token.email}`);
  const recipeId = event.pathParameters.recipeId;
  const recipeRepository = await getRecipeRepository();
  const recipe = await recipeRepository.find(recipeId);

  if (!recipe) {
    console.log("Recipe not found");
    return {
      statusCode: 404,
      headers: corsHeaders,
    };
  }

  console.log("Recipe found");
  const recipeDto = toRecipeDto(token)(recipe);

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify(recipeDto),
  };
};
