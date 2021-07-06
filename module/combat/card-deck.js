/**
 * An initiative deck for Year Zero games.
 * @extends {Deck} `card-deck` NPM package
 */
export default class InitDeck extends Deck {
  /**
   * @param {?Array<*>} [arr] An array of objects, default are initiative cards.
   */
  constructor(arr) {
    if (arr) super(arr);
    else super(InitDeck.INITIATIVE_CARDS);
    super.shuffle();
  }

  /* ------------------------------------------- */

  /**
   * The size of the deck.
   * @type {number}
   * @readonly
   */
  get size() {
    return this._stack.length;
  }

  /* ------------------------------------------- */

  /**
   * Method to loot cards: draw a number and keep only some of them.
   * @param {number}    qty             Total number of cards to draw
   * @param {number}    [keep=1]        Number of cards to keep from the draw
   * @param {?Function} fn              Callback function to sort the best cards to keep
   * @param {boolean}   [shuffle=false] Whether the discarded cards should be shuffle back in the deck
   * @returns {number[]|any[]}
   */
  loot(qty, keep, { fn = null, shuffle = false } = {}) {
    // Draws the cards.
    let cards = super.draw(qty);
    if (!Array.isArray(cards)) cards = [cards];

    // Sorts the drawn cards.
    if (fn) cards.sort(fn); else cards.sort();

    // Keeps the best cards.
    const keptCards = cards.splice(0, keep);

    // Shuffles the remaining cards back to the deck is desired.
    if (shuffle && cards.length > 0) {
      super.addToTop(cards);
      super.shuffle();
    }

    // Returns the kept cards.
    return keptCards;
  }

  /* ------------------------------------------- */

  static INITIATIVE_CARDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
}


/* ------------------------------------------- */
/*  card-deck NPM package                      */
/* ------------------------------------------- */

/**
 * @module deck
 */
// 'use strict';

// var Array.isArray = require( './lib/is-array' );

// Get a random integer index within the provided array
function randomIndex( arr ) {
  return Math.floor( Math.random() * arr.length );
}

// Predicate function to filter out undefined values
function isNotUndefined( val ) {
  return typeof val !== 'undefined';
}

// Shuffle an array in place, returning that array
function shuffle( arr ) {
  // Fisher–Yates implementation adapted from http://bost.ocks.org/mike/shuffle/
  var remaining = arr.length;
  var tmp;
  var idx;

  // While there remain elements to shuffle…
  while ( remaining ) {
    // Pick a remaining element...
    idx = Math.floor( Math.random() * remaining-- );

    // And swap it with the current element.
    tmp = arr[ remaining ];
    arr[ remaining ] = arr[ idx ];
    arr[ idx ] = tmp;
  }
}

/**
 * @class Deck
 */
function Deck( arr ) {
  if ( Array.isArray( arr ) ) {
    this.cards( arr );
  }
}

/**
 * Populate the deck with an array of cards, wiping out any cards that had
 * previously been added to the deck
 *
 * @chainable
 * @param  {Array} cardArray An array of cards to use for the deck
 * @return {Deck} The deck instance (for chaining)
 */
Deck.prototype.cards = function( cardArray ) {
  if ( ! Array.isArray( cardArray ) ) { return this; }
  // Replace the deck with the new cards
  this._stack = cardArray;
  return this;
};

/**
 * Randomize the order of cards within the deck
 *
 * @chainable
 * @return {Deck} The deck instance (for chaining)
 */
Deck.prototype.shuffle = function() {
  shuffle( this._stack );
  return this;
};

/**
 * Get the number of cards currently contained within the deck
 *
 * @return {Number} The number of cards left in the deck
 */
Deck.prototype.remaining = function() {
  return this._stack.length;
};

/**
 * Draw a card or cards, removing the drawn cards from the deck
 *
 * @param {Number} [count] The number of cards to draw
 * @return {Object|Array} A single card or an array of cards
 */
Deck.prototype.draw = function( count ) {
  count || ( count = 1 );
  var drawnCards = this._stack.splice( 0, count );
  if ( ! drawnCards.length ) { return; }
  return count === 1 ? drawnCards[ 0 ] : drawnCards;
};

/**
 * Draw a card or cards from the bottom of the deck, removing the drawn cards
 * from the deck
 *
 * @param  {Number} [count] The number of cards to draw
 * @return {Object|Array} A single card or an array of cards
 */
Deck.prototype.drawFromBottom = function( count ) {
  count || ( count = 1 );
  var drawnCards = this._stack.splice( -count, count ).reverse();
  if ( ! drawnCards.length ) { return; }
  return count === 1 ? drawnCards[ 0 ] : drawnCards;
};

/**
 * Draw a card or cards matching a condition defined in a provided predicate
 * function, removing the drawn cards from the deck
 *
 * @param {Function} predicate A function to use to evaluate whether a given
 *                             card in the deck should be drawn
 * @param {Number} [count] The number of cards to draw
 * @return {Object|Array} A single card or an array of cards
 */
Deck.prototype.drawWhere = function( predicate, count ) {
  if ( typeof predicate !== 'function' ) {
    return;
  }
  count || ( count = 1 );
  var drawnCards = this._stack.filter( predicate ).slice( 0, count );
  for ( var i = 0; i < drawnCards.length; i++ ) {
    // Remove from the stack
    this._stack.splice( this._stack.indexOf( drawnCards[ i ] ), 1 );
  }
  if ( ! drawnCards.length ) { return; }
  return count === 1 ? drawnCards[ 0 ] : drawnCards;
};

/**
 * Draw a card or cards from random positions in the deck, removing the drawn
 * cards from the deck
 *
 * @param {Number} [count] The number of cards to draw
 * @return {Object|Array} A single card or an array of cards
 */
Deck.prototype.drawRandom = function( count ) {
  if ( ! this._stack.length ) { return; }
  count || ( count = 1 );
  if ( count === 1 ) {
    return this._stack.splice( randomIndex( this._stack ), 1 )[ 0 ];
  }
  var drawnCards = [];
  for ( var i = 0; i < count; i++ ) {
    drawnCards.push( this._stack.splice( randomIndex( this._stack ), 1 )[ 0 ] );
  }
  drawnCards = drawnCards.filter( isNotUndefined );
  return drawnCards;
};

/**
 * Insert a card or cards at the bottom of the deck in order
 *
 * @chainable
 * @param {Object|Array} cards The card object or array of card objects to insert
 * @return {Deck} The deck instance (for chaining)
 */
Deck.prototype.addToBottom = function( cards ) {
  if ( ! Array.isArray( cards ) ) {
    // Handle individual card objects
    return this.addToBottom( [ cards ] );
  }
  this._stack.push.apply( this._stack, cards );
  return this;
};

/**
 * Insert a card or cards at the bottom of the deck in random order
 *
 * @chainable
 * @param {Object|Array} cards The card object or array of card objects to insert
 * @return {Deck} The deck instance (for chaining)
 */
Deck.prototype.shuffleToBottom = function( cards ) {
  if ( ! Array.isArray( cards ) ) {
    // Handle individual card objects
    return this.shuffleToBottom( [ cards ] );
  }
  shuffle( cards );
  return this.addToBottom( cards );
};

/**
 * Insert a card or cards at the top of the deck in order
 *
 * @chainable
 * @param {Object|Array} cards The card object or array of card objects to insert
 * @return {Deck} The deck instance (for chaining)
 */
Deck.prototype.addToTop = function( cards ) {
  if ( ! Array.isArray( cards ) ) {
    // Handle individual card objects
    return this.addToTop( [ cards ] );
  }
  this._stack.unshift.apply( this._stack, cards );
  return this;
};

/**
 * Insert a card or cards at the top of the deck in random order
 *
 * @chainable
 * @param {Object|Array} cards The card object or array of card objects to insert
 * @return {Deck} The deck instance (for chaining)
 */
Deck.prototype.shuffleToTop = function( cards ) {
  if ( ! Array.isArray( cards ) ) {
    // Handle individual card objects
    return this.shuffleToTop( [ cards ] );
  }
  shuffle( cards );
  return this.addToTop( cards );
};

/**
 * Insert a card or cards into the deck at random positions
 *
 * @chainable
 * @param {Object|Array} cards The card object or array of card objects to insert
 * @return {Deck} The deck instance (for chaining)
 */
Deck.prototype.addRandom = function( cards ) {
  if ( ! Array.isArray( cards ) ) {
    // Handle individual card objects
    return this.addRandom( [ cards ] );
  }
  var stack = this._stack;
  cards.forEach( function( card ) {
    stack.splice( randomIndex( stack ), 0, card );
  } );
  return this;
};

/**
 * Look at a card or cards on the bottom of the deck, without removing them
 * from the deck
 *
 * @param {Number} count The number of cards to retrieve
 * @return {Object|Array} A single card or an array of cards
 */
Deck.prototype.top = function( count ) {
  if ( ! this._stack.length ) { return; }
  count || ( count = 1 );
  var returnedCards = this._stack.slice( 0, count );
  return count === 1 ? returnedCards[ 0 ] : returnedCards;
};

/**
 * Look at a card or cards on the top of the deck, without removing them from
 * the deck
 *
 * @param {Number} count The number of cards to retrieve
 * @return {Object|Array} A single card or an array of cards
 */
Deck.prototype.bottom = function( count ) {
  if ( ! this._stack.length ) { return; }
  count || ( count = 1 );
  var returnedCards =  this._stack.slice( -count ).reverse();
  return count === 1 ? returnedCards[ 0 ] : returnedCards;
};

/**
 * Look at a random card or cards, without removing them from the deck
 *
 * @param {Number} count The number of cards to retrieve
 * @return {Object|Array} A single card or an array of cards
 */
Deck.prototype.random = function( count ) {
  if ( ! this._stack.length ) { return; }
  count || ( count = 1 );
  var idx;
  if ( count === 1 ) {
    idx = randomIndex( this._stack );
    return this._stack.slice( idx, idx + 1 )[ 0 ];
  }
  var cards = [].concat( this._stack );
  shuffle( cards );
  cards.length = count;
  return cards.filter( isNotUndefined );
};

// module.exports = Deck;
