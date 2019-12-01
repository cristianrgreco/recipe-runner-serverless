const {isTokenValid} = require('../auth');
const {connectToDatabase, getRecipeRepository} = require('../db');
const corsHeaders = require('../cors-headers');

module.exports.handler = async event => {
    const recipeRepository = getRecipeRepository(await connectToDatabase());

    const token = await isTokenValid(event.headers.Authorization);
    if (!token) {
        return {
            statusCode: 401,
            headers: corsHeaders
        };
    }

    const recipeId = event.pathParameters.recipeId;

    const recipe = await recipeRepository.find(recipeId);
    if (!recipe) {
        return {
            statusCode: 404,
            headers: corsHeaders
        };
    } else if (token.email !== recipe.createdBy) {
        return {
            statusCode: 403,
            headers: corsHeaders
        };
    }

    await recipeRepository.delete(recipeId);

    return {
        statusCode: 204,
        headers: corsHeaders
    };
};
