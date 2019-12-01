const {isTokenValid} = require('../auth');
const {connectToDatabase, getRecipeRepository} = require('../db');
const {toRecipeDto} = require('../recipe-dto');

module.exports.handler = async event => {
    const recipeRepository = getRecipeRepository(await connectToDatabase());
    const token = await isTokenValid(event.headers.Authorization);

    const recipes = await recipeRepository.findAll();
    const recipeDtos = recipes.map(toRecipeDto(token));

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(recipeDtos)
    };
};
