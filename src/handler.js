const {S3} = require('aws-sdk');
const uuid = require('uuid/v1');
const mime = require('mime-types');
const {isTokenValid} = require('./auth');
const {connectToDatabase, getRecipeRepository} = require('./db');

const toRecipeDto = token => recipe => ({
    ...recipe,
    createdBy: undefined,
    isEditable: (token && token.email === recipe.createdBy) || undefined
});

const fetchRecipe = async event => {
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

const fetchRecipes = async event => {
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

const getUploadUrl = event => new Promise(async resolve => {
    const token = await isTokenValid(event.headers.Authorization);
    if (!token) {
        return {
            statusCode: 401,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            }
        };
    }

    const contentType = event.queryStringParameters.contentType;
    const filename = `${uuid()}.${mime.extension(contentType)}`;

    // TODO expiry, max size. Can probs remove serverless condition if we remove acl here
    const params = {
        Bucket: 'recipe-runner-uploads',
        Key: filename,
        ContentType: contentType,
        ACL: 'public-read',
    };

    const uploadUrl = new S3().getSignedUrl('putObject', params);

    resolve({
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({uploadUrl, filename})
    })
});

const recipeId = recipeName => {
    return recipeName
        .toLowerCase()
        .replace(/[^A-Za-z0-9\s]/g, '')
        .replace(/\s/g, '-');
};

const createRecipe = async event => {
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
    const id = `${recipeId(recipeDto.name)}-${createdAt.getTime()}`;

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

const updateRecipe = async event => {
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

const deleteRecipe = async event => {
    const recipeRepository = getRecipeRepository(await connectToDatabase());

    const token = await isTokenValid(event.headers.Authorization);
    if (!token) {
        return {
            statusCode: 401,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
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

    await recipeRepository.delete(recipeId);

    return {
        statusCode: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        }
    };
};

module.exports = {
    fetchRecipe,
    fetchRecipes,
    getUploadUrl,
    createRecipe,
    updateRecipe,
    deleteRecipe
};
