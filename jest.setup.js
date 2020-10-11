jest.mock("aws-sdk");
jest.mock("./src/auth");
jest.mock("./src/db-url");

const { MongoClient } = require("mongodb");
const { GenericContainer } = require("testcontainers");
const { getDbUrl } = require("./src/db-url");

let mongoContainer;
let mongoClient;
let mongoCollection;

beforeAll(async () => {
  jest.setTimeout(120000);

  const database = "test";
  mongoContainer = await new GenericContainer("mongo", "4.2.10")
    .withEnv("MONGO_INITDB_DATABASE", database)
    .withExposedPorts(27017)
    .start();

  const mongoHost = mongoContainer.getContainerIpAddress();
  const mongoPort = mongoContainer.getMappedPort(27017);
  const mongoUrl = `mongodb://${mongoHost}:${mongoPort}`;

  getDbUrl.mockReturnValue({ url: mongoUrl, database });

  mongoClient = new MongoClient(mongoUrl, { useUnifiedTopology: true });
  await mongoClient.connect();
  const mongoDatabase = mongoClient.db(database);
  mongoCollection = mongoDatabase.collection("recipes");
});

afterAll(async () => {
  await mongoContainer.stop();
});

beforeEach(async () => {
  await mongoCollection.deleteMany({});
});
