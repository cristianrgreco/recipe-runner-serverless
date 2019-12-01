const {isTokenValid} = require('../auth');
const {connectToDatabase, getRecipeRepository} = require('../db');
const {toRecipeDto} = require('../recipe-dto');

module.exports.handler = async event => {
    const recipeRepository = getRecipeRepository(await connectToDatabase());
    const token = await isTokenValid(event.headers.Authorization);

    const recipeId = event.pathParameters.recipeId;
    const recipe = await recipeRepository.find(recipeId);
    const recipeDto = toRecipeDto(token)(recipe);

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(recipeDto)
    };
};
