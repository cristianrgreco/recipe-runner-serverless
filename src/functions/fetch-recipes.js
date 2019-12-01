const {isTokenValid} = require('../auth');
const {connectToDatabase, getRecipeRepository} = require('../db');
const {toRecipeDto} = require('../recipe-dto');
const corsHeaders = require('../cors-headers');

module.exports.handler = async event => {
    const recipeRepository = getRecipeRepository(await connectToDatabase());
    const token = await isTokenValid(event.headers.Authorization);

    const recipes = await recipeRepository.findAll();
    const recipeDtos = recipes.map(toRecipeDto(token));

    return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(recipeDtos)
    };
};
