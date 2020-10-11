const { isTokenValid } = require("../auth");
const { getRecipeRepository } = require("../db");
const corsHeaders = require("../cors-headers");

module.exports.handler = async (event) => {
  console.log("Delete recipe");
  const token = await isTokenValid(event.headers.Authorization);
  if (!token) {
    console.log("Unauthorised");
    return {
      statusCode: 401,
      headers: corsHeaders,
    };
  }

  const recipeId = event.pathParameters.recipeId;
  const recipeRepository = await getRecipeRepository();
  console.log("Looking for recipe to delete");
  const recipe = await recipeRepository.find(recipeId);
  if (!recipe) {
    console.log(`Recipe ${recipeId} not found`);
    return {
      statusCode: 404,
      headers: corsHeaders,
    };
  } else if (token.email !== recipe.createdBy) {
    console.log("Forbidden");
    return {
      statusCode: 403,
      headers: corsHeaders,
    };
  }

  console.log("Deleting recipe");
  await recipeRepository.delete(recipeId);
  console.log("Deleted recipe");

  return {
    statusCode: 204,
    headers: corsHeaders,
  };
};
