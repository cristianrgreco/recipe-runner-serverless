const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const client = jwksClient({
  jwksUri: "https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_Igv3CYnOz/.well-known/jwks.json",
});

const validations = {
  iss: "https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_Igv3CYnOz",
  client_id: "4b94lone1rcq4g6efjvnqatidk",
  token_use: "access",
};

const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
};

const isTokenValid = (token) =>
  new Promise((resolve) => {
    if (!token) {
      console.log("Token is missing");
      resolve(false);
      return;
    }

    const parts = token.split(" ");

    if (parts.length !== 2) {
      console.log("Token is invalid");
      resolve(false);
      return;
    }

    jwt.verify(parts[1], getKey, { algorithms: ["RS256"] }, (err, decodedToken) => {
      if (err) {
        console.log(`Token verification failed: ${err}`);
        resolve(false);
      } else {
        if (Object.entries(validations).some(([key, value]) => decodedToken[key] !== value)) {
          console.log("Token validation failed");
          resolve(false);
        } else {
          console.log("Token is valid");
          resolve({ email: decodedToken.username });
        }
      }
    });
  });

module.exports = {
  isTokenValid,
};
