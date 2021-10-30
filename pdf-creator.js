const { json } = require('express');

// Importing fonts for PDF document
const fonts = {
    Quicksand: {
        normal: 'fonts/Quicksand-Regular.ttf',
        bold: 'fonts/Quicksand-Bold.ttf'
    }
};

const PdfPrinter = require('pdfmake');
const printer = new PdfPrinter(fonts);

module.exports = {
    /**
     * This function parses through the json passed by the REST API and creates a customized rendered PDF invoice.
     * @param {json} json Input json from REST API
     * @returns a PDF document ready to be returned
     */
    createPDF: function(json) {
        console.log("Creating invoice for order number: " + json.order.id);

        // Holds the contents and styling of the PDF document
        var docDefinition = {
            pageSize: 'A4',
            pageOrientation: 'portrait',
            pageMargins: [70, 40, 70, 40],    // [left, top, right, bottom]
            content: [
                {
                    image: 'images/beeanco.png',
                    width: 80,
                    alignment: 'center'
                },
                {
                    text: 'beeanco',
                    alignment: 'center',
                    style: 'title'
                },
                {
                    text: 'Danke ' + json.order.buyer.firstName + ',\nfür deiene Bestellung!',
                    style: 'header',
                    margin: [0, 30]         // [horizontal, vertical]
                },
                {
                    text: [
                        'Hiermit bestätigen wir deine Bestellung bei ',
                        {text: 'beeanco. ', bold: true},
                        'Bitte überprüfe noch einmal unten aufgelistet deine bestellten Artikel und deine angegebene Liefaradresse.'
                    ],
                    style: 'paragraph',
                    margin: [0, 0, 0, 30]   // [left, top, right, bottom]
                }
            ],
            defaultStyle: {
                font: 'Quicksand',
                color: '#0D3550'
            },
            styles: {
                title: {
                    fontSize: 26,
                    color: 'black'
                },
                header: {
                    fontSize: 30
                },
                paragraph: {
                    fontSize: 22
                },
                tableHeader: {
                    fontSize: 10,
                    bold: true,
                    alignment: 'center'
                },
                articleTitle: {
                    fontSize: 14,
                    bold: true
                },
                articleDescription: {
                    fontSize: 12
                }
            }
        };

        // ~----------        Variable text         ----------~

        // ~---------- Shipping and Billing address ----------~
        // Setting table constants
        var tableContent = {
            table: {
                widths: ['50%', '50%'],
                headerRows: 1,
                body: [
                    [{text: 'Angegebene Lieferadresse', style: 'tableHeader', alignment: 'left'}, {text: 'Angegebene Rechnungsadresse', style: 'tableHeader', alignment: 'left'}]
                ]
            },
            style: 'articleDescription',
            layout: 'noBorders',
            margin: [0, 0, 0, 30]   // [left, top, right, bottom]
        };

        // Checking for presence of billingAddress. Uses shippingAddress as billingAddress in case it doesn't exist
        if (json.order.billingAddress != null) {
            tableContent.table.body.push(
                // EG: Lisa Mustermann
                [json.order.shippingAddress.name, json.order.billingAddress.name],
                // EG: Max Mustermannstraße 08/15
                [json.order.shippingAddress.address1, json.order.billingAddress.address1],
                // EG: AT0000 Musterort
                [json.order.shippingAddress.countryCode + json.order.shippingAddress.zip + ' ' + json.order.shippingAddress.city, json.order.billingAddress.countryCode + json.order.billingAddress.zip + ' ' + json.order.billingAddress.city]
            )
        } else {
            tableContent.table.body.push(
                // EG: Lisa Mustermann
                [json.order.shippingAddress.name, json.order.shippingAddress.name],
                // EG: Max Mustermannstraße 08/15
                [json.order.shippingAddress.address1, json.order.shippingAddress.address1],
                // EG: AT0000 Musterort
                [json.order.shippingAddress.countryCode + json.order.shippingAddress.zip + ' ' + json.order.shippingAddress.city, json.order.shippingAddress.countryCode + json.order.shippingAddress.zip + ' ' + json.order.shippingAddress.city]
            )
        }

        // Pushing table in PDF's content
        docDefinition.content.push(tableContent);


        // ~----------          Order list          ----------~
        // Setting table constants
        var tableContent = {
            table: {
                widths: [200, '*', '*', '*'],
                headerRows: 1,
                body: [
                    [{text: 'Besteller Artikel', style: 'tableHeader', alignment: 'left'},
                    {text: 'Artikelnummer', style: 'tableHeader'},
                    {text: 'Menge', style: 'tableHeader'},
                    {text: 'Preis', style: 'tableHeader'}]
                ]
            },
            style: 'articleDescription',
            layout: 'noBorders'
        }

        // Adding items to the list
        // Styling price to fit to EUR and Article number with #
        var items = json.order.items;
        items.forEach(item => {
            tableContent.table.body.push(
                [{text: item.product.vendor.name, style: 'articleTitle', colSpan: 4, margin: [0, 30, 0, 0]}],               // Article Title
                [item.product.name, {text: '#' + item.product.sku, alignment: 'center'},                                    // Product Name
                {text: item.quantity, alignment: 'center'},                                                                 // Item Quantity
                {text: item.price.toLocaleString('en-US', {style: 'currency', currency: 'EUR'}), alignment: 'center'}]      // Item Price
            );
        });


        // Pushing table in PDF's content
        docDefinition.content.push(tableContent);

        // Creating PDF document and returning it
        return printer.createPdfKitDocument(docDefinition);
    }
}