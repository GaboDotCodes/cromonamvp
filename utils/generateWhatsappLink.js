const generateWhatsappLink = (phoneNumber, message, countryCode = '57') => {
    const link = `https://api.whatsapp.com/send?phone=${countryCode}${phoneNumber}&text=${encodeURI(message)}`;
    return link;
};

module.exports = { generateWhatsappLink };