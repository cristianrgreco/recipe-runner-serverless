const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
    jwksUri: 'https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_Igv3CYnOz/.well-known/jwks.json'
});

const validations = {
    iss: 'https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_Igv3CYnOz',
    client_id: '4b94lone1rcq4g6efjvnqatidk',
    token_use: 'access'
};

const getKey = (header, callback) => {
    client.getSigningKey(header.kid, (err, key) => {
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
};

const isTokenValid = token => new Promise(resolve => {
    if (!token) {
        resolve(false);
        return;
    }

    const parts = token.split(' ');

    if (parts.length !== 2) {
        resolve(false);
        return;
    }

    jwt.verify(parts[1], getKey, {algorithms: ['RS256']}, (err, decodedToken) => {
        if (err) {
            resolve(false);
        } else {
            if (Object.entries(validations).some(([key, value]) => decodedToken[key] !== value)) {
                resolve(false);
            } else {
                resolve({email: decodedToken.username});
            }
        }
    })
});

module.exports = {
    isTokenValid
};
