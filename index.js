'use strict';
const PDF = require( 'pdfkit-table' ),
addTextbox = require( 'textbox-for-pdfkit' );
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
                const top = this.marginTop();
                this.marginTop( 0 );
                header( this );
                this.marginTop( top );
                this.text( '', this.marginLeft(), top );
            } );
        }
        if ( footer ) {
            this.on( 'pageAdded', () => {
                const bottom = this.marginBottom();
                this.marginBottom( 0 );
                footer( this );
                this.marginBottom( bottom );
                this.text( '', this.marginLeft(), bottom );
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
        this.fillColor( '#000' );
    }
    marginedWidth() {
        return this.page.width - ( this.marginLeft() + this.marginRight() );
    }
    marginedHeight() {
        return this.page.height - ( this.marginTop() + this.marginBottom() );
    }
    textBox( textArr, x = this.x, y = this.y, options = {} ) {
        let width = this.marginedWidth();
        if ( typeof options == 'number' ) {
            width = options;
            options = {};
        } else if ( x.constructor === Object ) {
            options = x;
            x = this.x;
        }
        if ( typeof options.width == 'number' ) {
            width = options.width;
            delete options.width;
        }
        const originalStyle = {
            font: this._font.name,
            fontSize: this._fontSize,
            color: this._fillColor[0]
        }
        options = {
            ...originalStyle,
            lineHeight: 1,
            ...options
        };
        textArr = textArr.map( text => typeof text == 'string' ? { text } : text );
        addTextbox( textArr, this, x, y, width, options );
        return this.font( originalStyle.font ).fontSize( originalStyle.fontSize ).fillColor( originalStyle.color ).text( '', this.marginLeft(), this.y );
    }
    imageCenter( img, y = this.y, options = {} ) {
        if ( typeof options == 'number' ) {
            options = { width: options };
        } else if ( y.constructor === Object ) {
            options = y;
            y = this.y;
        }
        options = {
            width: this.marginedWidth(),
            ...options
        };
        return this.image( img, ( this.marginedWidth() - options.width ) / 2 + this.marginLeft(), y, options );
    }
    textCenter( txt, y = this.y, options = {} ) {
        if ( y.constructor === Object ) {
            options = y;
            y = this.y;
        }
        options = {
            ...options
        };
        this.text( txt, ( this.marginedWidth() - this.widthOfString( txt, options ) ) / 2 + this.marginLeft(), y, options );
        return this.text( '', this.marginLeft(), this.y );
    }
    textLeft( txt, y = this.y, options = {} ) {
        if ( y.constructor === Object ) {
            options = y;
            y = this.y;
        }
        options = {
            align: 'left',
            ...options
        };
        return this.text( txt, this.x, y, options );
    }
    textRight( txt, y = this.y, options = {} ) {
        if ( y.constructor === Object ) {
            options = y;
            y = this.y;
        }
        options = {
            ...options
        };
        return this.text( txt, this.page.width - ( this.widthOfString( txt, options ) + this.marginRight() ) - 1, y, options );
    }
    marginTop( margin = undefined, setY = true ) {
        if ( typeof margin == 'number' && margin >= 0 ) {
            this.page.margins.top = margin;
            if ( setY ) this.text( '', this.x, this.page.margins.top );
            return this;
        }
        if ( typeof margin == 'undefined' ) return this.page.margins.top;
        throw new Error( 'Invalid margin value passed' );
    }
    marginRight( margin = undefined ) {
        if ( typeof margin == 'number' && margin >= 0 ) {
            this.page.margins.right = margin;
            return this;
        }
        if ( typeof margin == 'undefined' ) return this.page.margins.right;
        throw new Error( 'Invalid margin value passed' );
    }
    marginLeft( margin = undefined, setX = true ) {
        if ( typeof margin == 'number' && margin >= 0 ) {
            this.page.margins.left = margin;
            if ( setX ) this.text( '', this.page.margins.left, this.y );
            return this;
        }
        if ( typeof margin == 'undefined' ) return this.page.margins.left;
        throw new Error( 'Invalid margin value passed' );
    }
    marginBottom( margin = undefined ) {
        if ( typeof margin == 'number' && margin >= 0 ) {
            this.page.margins.bottom = margin;
            return this;
        }
        if ( typeof margin == 'undefined' ) return this.page.margins.bottom;
        throw new Error( 'Invalid margin value passed' );
    }
    end( endingCallback = undefined ) {
        let endingLength = 0;
        // CALCULATE ENDING
        if ( endingCallback ) {
            const doc = new SuperPDF( {
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
                const point = [0.5 * this.marginLeft(), this.page.height - 70];
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