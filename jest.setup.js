jest.mock("./src/auth");
jest.mock("./src/db-url");

const { GenericContainer } = require("testcontainers");
const { getDbUrl } = require("./src/db-url");

let mongoContainer;

beforeAll(async () => {
  jest.setTimeout(60000);

  mongoContainer = await new GenericContainer("mongo", "4.2.10")
    .withEnv("MONGO_INITDB_DATABASE", "test")
    .withExposedPorts(27017)
    .start();

  getDbUrl.mockReturnValue({
    url: `mongodb://${mongoContainer.getContainerIpAddress()}:${mongoContainer.getMappedPort(
      27017
    )}`,
    database: "test",
  });
});

afterAll(async () => {
  await mongoContainer.stop();
});
