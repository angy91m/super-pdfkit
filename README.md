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

doc.textLeft(                           // TO ADD A LEFT ALIGNED TEXT
    'LEFT ALIGNED TEXT',                // the text
    200,                                // the y position OR options
    { width: 100 }                      // the options
)
.marginRight( 70 )
.textRight( 'RIGHT ALIGNED TEXT' );
.textCenter( 'CENTERED TEXT' )
.marginRight( 50 )
.textBox(
    [
        'My favourite color is ',
        { text: 'red', color: 'red' }
    ],
    { align: 'right' }
)
.imageCenter(                        // TO ADD A CENTERED IMAGE
    'image.png',                        // the image
    300,                                // the y position OR options
    100                                 // the image width OR options
);

doc.marginedWidth();                    // TO GET doc.page.width - ( doc.page.margins.left + doc.page.margins.right )

const marginLeft = doc.marginLeft();    // TO GET doc.page.margins.left VALUE

doc.marginLeft( marginLeft );           // TO SET doc.page.margins.left VALUE (it returns doc)

// TO FINISH YOU CAN USE...

doc.end();                              // TO END THE DOCUMENT

// OR

doc.end( thisDoc => {                   // TO ADD SOME NOT PAGE-DIVISIBLE CONTENT BEFORE ENDING THE DOCUMENT (useful for signatures)

    // A TOO LONG CONTENT FOR THE REST OF CURRENT PAGE

    for ( let i = 0; i < 40; i++ ) {
        thisDoc.text( 'ANY EDIT ON THE DOCUMENT' );
    }
} );

// OR

doc.complete()                          // TO END THE DOCUMENT AND GET IT AS A BUFFER
.then( bufferData => console.log( bufferData ) );

// YOU CAN PASS THE SAME FINAL FUNCTION TO end() OR complete() METHODS REGARDLESS

```

Show the [example](https://github.com/angy91m/super-pdfkit/blob/main/example.pdf)!