const {MongoClient} = require('mongodb');
const RecipeRepository = require('./recipe-repository');

let cachedDatabase;
let cachedRecipeRepository;

const connectToDatabase = async () => {
    if (cachedDatabase) {
        console.log('Using cached database connection');
        return cachedDatabase;
    }

    const hostname = process.env['DB_HOSTNAME'];
    const username = process.env['DB_USERNAME'];
    const password = process.env['DB_PASSWORD'];
    const database = process.env['DB_DATABASE'];

    const url = `mongodb+srv://${username}:${password}@${hostname}/test?retryWrites=true&w=majority`;

    console.log('Connecting to database');
    const client = new MongoClient(url, {useUnifiedTopology: true});
    await client.connect();
    console.log('Connected to database');

    cachedDatabase = client.db(database);
    return cachedDatabase;
};

const getRecipeRepository = async () => {
    if (cachedRecipeRepository) {
        console.log('Using cached recipe repository');
        return cachedRecipeRepository;
    }

    console.log('Creating recipe repository');
    const db = await connectToDatabase();
    const collection = db.collection('recipes');
    console.log('Created recipe repository');

    return new RecipeRepository(collection);
};

module.exports = { getRecipeRepository };
