const {isTokenValid} = require('../auth');
const {connectToDatabase, getRecipeRepository} = require('../db');

const createRecipeId = recipeName => {
    return recipeName
        .toLowerCase()
        .replace(/[^A-Za-z0-9\s]/g, '')
        .replace(/\s/g, '-');
};

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

    const recipeDto = JSON.parse(event.body);

    const createdAt = new Date();
    const id = `${createRecipeId(recipeDto.name)}-${createdAt.getTime()}`;

    const recipe = {
        ...recipeDto,
        id,
        createdAt: createdAt,
        createdBy: token.email,
    };

    await recipeRepository.save(recipe);

    return {
        statusCode: 201,
        headers: {
            'Location': `/recipes/${recipe.id}`,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Expose-Headers': 'Location',
            'Access-Control-Allow-Credentials': true
        }
    };
};
