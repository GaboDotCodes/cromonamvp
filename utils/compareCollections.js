const compareCollections = (meCollection, anyCollection) => {
    if (meCollection.length !== anyCollection.length) return { error: "No equal length collections" }
    const usefulToMeIndexes = [];
    const usefulToAnyIndexes = [];
    meCollection.forEach((meStickerAmountDetail, indexSticker) => {
        const anyStickerAmountDetail = anyCollection[indexSticker];
        if (
            meStickerAmountDetail === "Me falta" &&
            anyStickerAmountDetail === "La tengo repetida"
        ) {
            usefulToMeIndexes.push(indexSticker);
        }
        if (
            meStickerAmountDetail === "La tengo repetida" &&
            anyStickerAmountDetail === "Me falta"
        ) {
            usefulToAnyIndexes.push(indexSticker);
        }
    });
    return {
        usefulToMeIndexes,
        usefulToAnyIndexes,
        amountSwaps: usefulToMeIndexes.length <= usefulToAnyIndexes.length ? usefulToMeIndexes.length : usefulToAnyIndexes.length
    }
};

module.exports = { compareCollections };