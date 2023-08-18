# super-pdfkit

Enhanced pdfkit with some useful methods
(thx to: [pdfkit](https://www.npmjs.com/package/pdfkit) and [pdfkit-table](https://www.npmjs.com/package/pdfkit-table) authors)

Easy usage:

```javascript
const PDF = require( 'super-pdfkit' );

const doc = new PDF( {
    margin: 50,

    // THIS ADDS PAGE NUMBER (ex.: 1/5)
    pageNum: true,
    // THIS ADDS A TEXT BEFORE PAGE NUMBER
    pageNumText: 'Page ',
    
    // THIS ADDS HEADER AND FOOTER
    header( thisDoc ) {
        thisDoc.textCenter( 'HEADER', 15 );
        thisDoc.imageCenter( 'header.png', 50 );
    },
    footer( thisDoc ) {
        thisDoc.textCenter( 'FOOTER', thisDoc.page.height - 40 );
    }
} );


// YOU CAN USE

doc.textCenter(                 // TO ADD A LEFT ALIGNED TEXT
    'LEFT ALIGNED TEXT',        // the text
    200                         // the y position
);
doc.textCenter(                 // TO ADD A CENTERED TEXT
    'CENTERED TEXT',            // the text
    200                         // the y position
);
doc.textRight(                  // TO ADD A RIGHT ALIGNED TEXT
    'RIGHT ALIGNED TEXT',       // the text
    200                         // the y position
);

doc.imageCenter(                // TO ADD A CENTERED IMAGE
    'image.png',                // the image
    100,                        // the image width
    230                         // the y position
);

doc.end();                      // TO END THE DOCUMENT

// OR

doc.end( thisDoc => {           // TO ADD SOME NOT PAGE-DIVISIBLE CONTENT BEFORE ENDING THE DOCUMENT (useful for signatures)

    thisDoc.text( 'ANY EDIT ON THE DOCUMENT' );
} );

// OR

doc.complete()                  // TO END THE DOCUMENT AND GET IT AS A BUFFER
.then( bufferData => console.log( bufferData ) );

// YOU CAN PASS THE SAME FINAL FUNCTION TO end() OR complete() METHODS REGARDLESS

```