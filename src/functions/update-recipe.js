const {isTokenValid} = require('../auth');
const {connectToDatabase, getRecipeRepository} = require('../db');
const {fromRecipeDto} = require('../recipe-dto');
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

    const existingRecipe = await recipeRepository.find(recipeId);
    if (token.email !== existingRecipe.createdBy) {
        return {
            statusCode: 403,
            headers: corsHeaders
        };
    }

    const recipe = fromRecipeDto(JSON.parse(event.body));

    const updatedRecipe = {
        ...recipe,
        id: recipeId,
        updatedAt: new Date(),
        createdBy: token.email
    };

    await recipeRepository.update(recipeId, updatedRecipe);

    return {
        statusCode: 204,
        headers: {
            'Location': `/recipes/${recipeId}`,
            ...corsHeaders
        }
    };
};
