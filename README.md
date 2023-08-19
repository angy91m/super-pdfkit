# super-pdfkit

Enhanced pdfkit with some useful methods
(thx to: [pdfkit](https://www.npmjs.com/package/pdfkit), [pdfkit-table](https://www.npmjs.com/package/pdfkit-table) and [textbox-for-pdfkit](https://www.npmjs.com/package/textbox-for-pdfkit) authors)

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
        thisDoc.imageCenter( 'header.png', { width: 50 } );
    },
    footer( thisDoc ) {
        thisDoc.textCenter( 'FOOTER', thisDoc.page.height - 40 );
    }
} );


// YOU CAN USE

doc.textLeft(                   // TO ADD A LEFT ALIGNED TEXT
    'LEFT ALIGNED TEXT',        // the text
    200,                        // the y position OR options
    { continued: true }         // the options
);
doc.textRight( 'RIGHT ALIGNED TEXT' );
doc.textCenter( 'CENTERED TEXT' );
doc.textBox(
    [
        'My favourite color is ',
        { text: 'red', color: 'red' }
    ],
    { align: 'right' }
);

doc.imageCenter(                // TO ADD A CENTERED IMAGE
    'image.png',                // the image
    230,                        // the y position OR options
    100                         // the image width OR options
);

// TO FINISH YOU CAN USE...

doc.end();                      // TO END THE DOCUMENT

// OR

doc.end( thisDoc => {           // TO ADD SOME NOT PAGE-DIVISIBLE CONTENT BEFORE ENDING THE DOCUMENT (useful for signatures)

    // A TOO LONG CONTENT FOR THE REST OF CURRENT PAGE

    for ( let i = 0; i < 40; i++ ) {
        thisDoc.text( 'ANY EDIT ON THE DOCUMENT' );
    }
} );

// OR

doc.complete()                  // TO END THE DOCUMENT AND GET IT AS A BUFFER
.then( bufferData => console.log( bufferData ) );

// YOU CAN PASS THE SAME FINAL FUNCTION TO end() OR complete() METHODS REGARDLESS

```

Show the [example](https://github.com/angy91m/super-pdfkit/blob/main/example.pdf)!