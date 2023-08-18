'use strict';
const PDF = require( 'pdfkit-table' );
class SuperPDF extends PDF {
    constructor( override = {} ) {
        const
            pageNum = typeof override.pageNum == 'boolean' ? override.pageNum : false,
            pageNumText = override.pageNumText || '',
            header = override.header,
            footer = override.footer;
        delete override.pageNum;
        delete override.pageNumText;
        delete override.header;
        delete override.footer;
        const options = {
            size: 'A4',
            bufferPages: true,
            autoFirstPage: false,
            ...override
        };
        if ( typeof options.margin != 'number' && !options.margins ) {
            options.margin = 40;
        }
        super( options );
        if ( header ) {
            this.on( 'pageAdded', () => {
                const top = this.page.margins.top;
                this.page.margins.top = 0;
                header( this );
                this.page.margins.top = top;
                this.text( '', this.page.margins.left, top );
            } );
        }
        if ( footer ) {
            this.on( 'pageAdded', () => {
                const bottom = this.page.margins.bottom;
                this.page.margins.bottom = 0;
                footer( this );
                this.page.margins.bottom = bottom;
                this.text( '', this.page.margins.left, bottom );
            } );
        }
        this.addPage();
        this.pageNum = pageNum;
        this.pageNumText = pageNumText;
        this.finalBuffer = null;
        this.bufferData = [];
        this.on( 'data', data => {
            this.bufferData.push( data );
        } );
        this.on( 'end', () => {
            this.finalBuffer = Buffer.concat( this.bufferData );
        } );
    }
    imageCenter( img, width = this.page.width - ( this.page.margins.left + this.page.margins.right ), y = this.y ) {
        return this.image( img, ( this.page.width - width ) / 2, y, { width } );
    }
    textCenter( txt, y = this.y ) {
        return this.text( txt, this.page.margins.left, y, { align: 'center' } );
    }
    end( endingCallback = undefined ) {
        let endingLength = 0;
        // CALCULATE ENDING
        if ( endingCallback ) {
            const doc = new PDF( {
                size: this.page.size,
                layout: this.page.layout,
                bufferPages: true,
                margins: this.page.margins
            } );
            endingCallback( doc );
            if ( doc.bufferedPageRange().count > 1 ) throw new Error( 'Too much content in the ending callback' );
            endingLength = doc.y - doc.page.margins.top;
        }
        const { page: { margins: { left: x } }, y } = this;
        if ( endingLength ) {
            const pageCount = this.bufferedPageRange().count;
            this.text( '', x, y + endingLength );
            if ( this.bufferedPageRange().count == pageCount ) {
                this.text( '', x, y );
                this.moveDown();
            }
            endingCallback( this );
        }
        if ( this.pageNum ) {
            // ADDS PAGE NUMBER
            const pageRange = this.bufferedPageRange();
            for ( let i = 0, start = pageRange.start; i < pageRange.count; i++ ) {
                this.switchToPage( start );
                const point = [0.5 * this.page.margins.left, this.page.height - 70];
                this.rotate( -90, { origin: point } );
                this.text( `${this.pageNumText}${i+1}/${pageRange.count}`, ...point );
                this.rotate( 90, { origin: point } );
                start++;
            }
        }
        return super.end();
    }
    async complete( endingCallback = undefined ) {
        this.end( endingCallback );
        while ( !this.finalBuffer ) await new Promise( r => setImmediate( r ) );
        return this.finalBuffer;
    }
}

module.exports = SuperPDF;