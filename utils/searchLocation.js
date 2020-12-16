const fetch = require("node-fetch");

const { TOMTOM_APIKEY } = process.env;

const searchLocation = async (rawLocation) => {
    const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
      const response = await fetch(`https://api.tomtom.com/search/2/search/${encodeURI(rawLocation)}.json?typeahead=true&limit=1&countrySet=CO&language=es-419&idxSet=Geo&key=${TOMTOM_APIKEY}`, options);
    return response.json();
};

module.exports = { searchLocation };