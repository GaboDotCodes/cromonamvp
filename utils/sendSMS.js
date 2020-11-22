const { CLICKATELL_APIKEY } = process.env;

const sendSMS = async (content, toNumber) => {
  const bodyRaw = { messages: [ { channel: 'sms', to: `+57${toNumber}`, content } ] };
  const options = {
    method: 'POST',
    contentType: 'application/json',
    body: JSON.stringify(bodyRaw),
    headers: {
        Authorization: CLICKATELL_APIKEY
    }
  };
  const response = await fetch('https://platform.clickatell.com/v1/message', options);
  return response.json();
};

module.exports = sendSMS;
