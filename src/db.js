const {MongoClient} = require('mongodb');
const RecipeRepository = require('./recipe-repository');

let cachedDatabase;

const connectToDatabase = async () => {
    if (cachedDatabase) {
        return cachedDatabase;
    }

    const hostname = process.env['DB_HOSTNAME'];
    const username = process.env['DB_USERNAME'];
    const password = process.env['DB_PASSWORD'];
    const database = process.env['DB_DATABASE'];

    const url = `mongodb+srv://${username}:${password}@${hostname}/test?retryWrites=true&w=majority`;

    const client = new MongoClient(url, {useUnifiedTopology: true});
    await client.connect();

    cachedDatabase = client.db(database);
    return cachedDatabase;
};

const getRecipeRepository = db => {
    const collection = db.collection('recipes');
    return new RecipeRepository(collection);
};

module.exports = {
    connectToDatabase,
    getRecipeRepository
};
