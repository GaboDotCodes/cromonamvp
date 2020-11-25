const capName = (rawName) => {
    return rawName.split(" ")[0].charAt(0).toUpperCase() + rawName.split(" ")[0].slice(1)
};

module.exports = { capName };