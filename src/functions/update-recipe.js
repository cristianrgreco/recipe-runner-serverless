const {isTokenValid} = require('../auth');
const {connectToDatabase, getRecipeRepository} = require('../db');

module.exports.handler = async event => {
    const recipeRepository = getRecipeRepository(await connectToDatabase());

    const token = await isTokenValid(event.headers.Authorization);
    if (!token) {
        return {
            statusCode: 401,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            }
        };
    }

    const recipeId = event.pathParameters.recipeId;

    const recipe = await recipeRepository.find(recipeId);
    if (token.email !== recipe.createdBy) {
        return {
            statusCode: 403,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            }
        };
    }

    const recipeDto = JSON.parse(event.body);

    const updatedRecipe = {
        ...recipeDto,
        id: recipeId,
        updatedAt: new Date(),
        createdBy: token.email
    };

    await recipeRepository.update(recipeId, updatedRecipe);

    return {
        statusCode: 204,
        headers: {
            'Location': `/recipes/${recipeId}`,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Expose-Headers': 'Location',
            'Access-Control-Allow-Credentials': true
        }
    };
};
