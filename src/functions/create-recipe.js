const {isTokenValid} = require('../auth');
const {getRecipeRepository} = require('../db');
const {fromRecipeDto} = require('../recipe-dto');
const corsHeaders = require('../cors-headers');

const createRecipeId = recipeName => {
    return recipeName
        .toLowerCase()
        .replace(/[^A-Za-z0-9\s]/g, '')
        .replace(/\s/g, '-');
};

module.exports.handler = async event => {
    console.log('Create recipe');
    const token = await isTokenValid(event.headers.Authorization);
    if (!token) {
        console.log('Unauthorised');
        return {
            statusCode: 401,
            headers: corsHeaders
        };
    }

    const recipe = fromRecipeDto(JSON.parse(event.body));

    const createdAt = new Date();
    const recipeId = `${createRecipeId(recipe.name)}-${createdAt.getTime()}`;

    const newRecipe = {
        ...recipe,
        id: recipeId,
        createdAt: createdAt,
        createdBy: token.email,
    };

    console.log('Creating recipe');
    const recipeRepository = await getRecipeRepository();
    await recipeRepository.save(newRecipe);
    console.log('Created recipe');

    return {
        statusCode: 201,
        headers: {
            'Location': `/recipes/${recipeId}`,
            ...corsHeaders
        }
    };
};
