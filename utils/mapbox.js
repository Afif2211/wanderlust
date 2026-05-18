const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({
    accessToken: mapToken,
});

module.exports = geocodingClient;