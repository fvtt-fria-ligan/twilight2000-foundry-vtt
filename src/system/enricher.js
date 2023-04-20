/* ------------------------------------------ */
/*  T2K SYMBOL                                */
/*   Generates a T2K symbol                   */
/* ------------------------------------------ */

/**
 * - $1: Symbol
 * @example "[[S]] or [[F]] or [[B]] etc."
 */
const T2K_SYMBOL_PATTERN = /\[\[([SFBRTDNC]+)\]\]/gm;

async function t2kSymbolEnricher(match) {
  const symbolDoc = document.createElement('span');
  symbolDoc.className = 't2k-symbol';
  symbolDoc.innerHTML = match[1];
  return symbolDoc;
}

/* ------------------------------------------ */
/*  FONT AWESOME ICON                         */
/*   Generates a FontAwesome icon HTML text   */
/* ------------------------------------------ */

/**
 * - $1: Icon classes
 * @example "@FontAwesomeIcon[fas fa-cog]"
 */
const FONT_AWESOME_ICON_PATTERN = /@FontAwesomeIcon\[(.+?)\]/gm;

async function fontAwesomeIconEnricher(match) {
  const iconDoc = document.createElement('i');
  // iconDoc.style.textIndent = 0; // Fix for inherited <p> indent
  iconDoc.className = match[1];
  return iconDoc;
}

/* ------------------------------------------ */
/*  INLINE ICON IMAGE                         */
/*   Generates a small inline icon            */
/*   from an image                            */
/* ------------------------------------------ */

/**
 * - $1: Path to the image
 * - $2: Tooltip text
 * @example "@IconImage[icons/svg/dice-target.svg]{Dice Target}"
 */
const INLINE_ICON_IMAGE = /@IconImage\[(.+?)\](?:{(.+?)})?/gm;

async function iconImageEnricher(match) {
  const imgDoc = document.createElement('img');
  imgDoc.setAttribute('src', match[1]);
  // imgDoc.setAttribute('width', 16);
  // imgDoc.setAttribute('height', 16);
  imgDoc.style.width = '1em';
  imgDoc.style.height = '1em';
  imgDoc.style.verticalAlign = 'middle';
  // imgDoc.style.lineHeight = 0;
  imgDoc.className = 'nopopout';

  if (match[2]) {
    imgDoc.setAttribute('data-tooltip', match[2]);
  }

  return imgDoc;
}

/* ------------------------------------------ */

// function _createBrokenLink(type, title) {
//   return `<a class="${type} broken" data-id="null">`
//     // + '<i class="fa-solid fa-triangle-exclamation"></i>'
//     + '<i class="fa-solid fa-pen-slash"></i>'
//     + `${title}</a>`;
// }

export function enrichTextEditors() {
  CONFIG.TextEditor.enrichers.push(
    {
      pattern: T2K_SYMBOL_PATTERN,
      enricher: t2kSymbolEnricher,
    },
    {
      pattern: FONT_AWESOME_ICON_PATTERN,
      enricher: fontAwesomeIconEnricher,
    },
    {
      pattern: INLINE_ICON_IMAGE,
      enricher: iconImageEnricher,
    });
}
