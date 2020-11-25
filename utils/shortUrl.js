const fetch = require("node-fetch");

const { API_SHORT_URL_KEY } = process.env;

const shortUrl = async (longUrl) => {
    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ longUrl })
      }
    const response = await fetch(`https://cromona.co/shortUrl/?apiKey=${API_SHORT_URL_KEY}`, options);
    const { shortUrl: id } = await response.json();
    return `https://cromona.co/s/${id}`
};

module.exports = { shortUrl };