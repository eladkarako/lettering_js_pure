/**
 * @method set_text
 * set text on top-level element, purging child-element.
 * @param {Node} element
 * @param {string?} text
 * @returns {boolean}
 */
function set_text(element, text) {
  text = "undefined" === text ? "" : text; //normalize argument

  Array.prototype.forEach.call(element.children, function (element) {
    (1 === element.nodeType) && set_text(element, "");
  });

  if (1 === element.nodeType) element.textContent = text;

  return true;
}


/**
 * @method get_text
 * get (or remove if text is empty) the textual-content of the element (if needed, of its traversed-child tree)
 * @param {Node} element
 * @returns {string}
 */
function get_text(element) {
  if (3 === element.nodeType || 4 === element.nodeType) return element.nodeValue; //text or CDATA

  if (1 !== element.nodeType && 9 !== element.nodeType && 11 !== element.nodeType) return ""; //not: element, doc., doc.fragment

  return "string" === typeof element.textContent ? element.textContent :
    Array.prototype.map.call(element.children, function (element) {
      return get_text(element);
    }).join('');
}


/**
 * @method lettering
 * a more reasonable LetteringJS, efficient code, no jQuery needed.
 * @param {Node} element
 * @param {Object} config
 * @returns {string}
 */
function lettering(element, config) {
  var
    template = '<span data-ltjs-role=\"###ROLE###\">###VALUE###</span>'
    , text = get_text(element)
    ;

  config = "undefined" === typeof config ? {} : config;
  config.method = "undefined" === typeof config.method ? "line" : config.method;
  config.is_set = "undefined" === typeof config.is_set ? true : config.is_set;


  text =
    "char" === config.method ? text
      .replace(/(\S)/gmi, function (whole, match, index) {
        return template.replace("###VALUE###", match).replace("###ROLE###", 'char')
      })

      : "word" === config.method ? text
      .replace(/(\S+)/gmi, function (whole, match, index) {    // \S+ is non-whitespace char-sequence
        return template.replace("###VALUE###", match).replace("###ROLE###", 'word')
      })

      : /* line (as fallback) */
      "line" === config.method ? text
        .replace(/\<\s*br\s*\/{0,1}\s*\>/gmi, "\n") // normalize <br/> HTML tag variations.
        .replace(/(\r\n)+/gi, "\n") // windows's CR+LF
        .replace(/\n+/gmi, "\n")
        .replace(/\n*([^\n]+)\n*/gmi, function (whole, match, index) {
          return template.replace("###VALUE###", match).replace("###ROLE###", 'line')
        })
        :
        ""
  ;


  if (true === config.is_set)
    set_text(element, text) && (element.innerHTML = text);

  return text;
}