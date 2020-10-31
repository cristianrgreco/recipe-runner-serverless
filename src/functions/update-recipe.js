const { isTokenValid } = require("../auth");
const { getRecipeRepository } = require("../db");
const { fromRecipeDto } = require("../recipe-dto");
const corsHeaders = require("../cors-headers");

module.exports.handler = async (event) => {
  console.log("Update recipe");
  const token = await isTokenValid(event.headers.Authorization);
  if (!token) {
    console.log("Unauthorised");
    return {
      statusCode: 401,
      headers: corsHeaders,
    };
  }

  console.log("Looking for recipe to update");
  const recipeId = event.pathParameters.recipeId;
  const recipeRepository = await getRecipeRepository();
  const existingRecipe = await recipeRepository.find(recipeId);
  if (!existingRecipe) {
    console.log(`Recipe ${recipeId} does not exist`);
    return {
      statusCode: 404,
      headers: corsHeaders,
    };
  } else if (!token.isAdmin && token.id !== existingRecipe.createdBy) {
    console.log("Forbidden");
    return {
      statusCode: 403,
      headers: corsHeaders,
    };
  }

  const recipe = fromRecipeDto(JSON.parse(event.body));

  const updatedRecipe = {
    ...recipe,
    id: recipeId,
    updatedAt: new Date(),
    createdBy: token.id,
  };

  console.log("Updating recipe");
  await recipeRepository.update(recipeId, updatedRecipe);
  console.log("Updated recipe");

  return {
    statusCode: 204,
    headers: {
      Location: `/recipes/${recipeId}`,
      ...corsHeaders,
    },
  };
};
