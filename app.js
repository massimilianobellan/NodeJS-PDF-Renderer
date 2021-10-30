const express = require('express');
const pdfCreator = require('./pdf-creator');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/**
 * Handles POST requests for rendering the JSON to API
 */
app.post('/', (req, res) => {
    // Creating PDF from requests' body
    var pdfDoc = pdfCreator.createPDF(req.body);

    // Setting response
    res.set('content-type', 'application/pdf');
    pdfDoc.pipe(res);
    pdfDoc.end();
})

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
})