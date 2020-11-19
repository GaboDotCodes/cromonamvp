const { GoogleSpreadsheet } = require('google-spreadsheet');

const { SHEET_ID, GOOGLE_API_KEY } = process.env;

const connectSpreadsheet = async () => {
    try {

        const doc = new GoogleSpreadsheet(SHEET_ID);
        doc.useApiKey(GOOGLE_API_KEY);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        console.log(sheet.rowCount);

        const rows = await sheet.getRows(); // can pass in { limit, offset }

        // read/write row values
        console.log(rows);

    } catch (e) {

    }
}

module.exports = {
    connectSpreadsheet,
}