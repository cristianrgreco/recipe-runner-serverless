const getDbUrl = () => {
  const hostname = process.env["DB_HOSTNAME"];
  const username = process.env["DB_USERNAME"];
  const password = process.env["DB_PASSWORD"];
  const database = process.env["DB_DATABASE"];

  return {
    url: `mongodb+srv://${username}:${password}@${hostname}/test?retryWrites=true&w=majority`,
    database,
  };
};

module.exports = {
  getDbUrl,
};
