const { API_SHORT_URL_KEY } = process.env;

const shortUrl = async (longUrl) => {
    const options = {
        method: 'POST',
        contentType: 'application/json',
        body: JSON.stringify({ longUrl })
      }
    const response = await fetch(`http://cromona.co/shortUrl/?apiKey=${API_SHORT_URL_KEY}`, options);
    return response.json();
};

module.exports = shortUrl;