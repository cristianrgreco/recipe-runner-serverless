const {isTokenValid} = require('../auth');
const {getRecipeRepository} = require('../db');
const {toRecipeDto} = require('../recipe-dto');
const corsHeaders = require('../cors-headers');

module.exports.handler = async event => {
    console.log('Fetch recipes');
    const token = await isTokenValid(event.headers.Authorization);

    console.log(`Fetching recipes: ${token}`);
    const recipeRepository = await getRecipeRepository();
    const recipes = await recipeRepository.findAll();

    console.log('Recipes found');
    const recipeDtos = recipes.map(toRecipeDto(token));

    return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(recipeDtos)
    };
};
