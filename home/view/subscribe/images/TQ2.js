/*!
 * Sizzle CSS Selector Engine v1.9.4-pre
 * http://sizzlejs.com/
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-05-27
 */
(function( window, undefined ) {

var i,
    support,
    cachedruns,
    Expr,
    getText,
    isXML,
    compile,
    outermostContext,
    sortInput,

    // Local document vars
    setDocument,
    document,
    docElem,
    documentIsHTML,
    rbuggyQSA,
    rbuggyMatches,
    matches,
    contains,

    // Instance-specific data
    expando = "sizzle" + -(new Date()),
    preferredDoc = window.document,
    dirruns = 0,
    done = 0,
    classCache = createCache(),
    tokenCache = createCache(),
    compilerCache = createCache(),
    hasDuplicate = false,
    sortOrder = function() { return 0; },

    // General-purpose constants
    strundefined = typeof undefined,
    MAX_NEGATIVE = 1 << 31,

    // Instance methods
    hasOwn = ({}).hasOwnProperty,
    arr = [],
    pop = arr.pop,
    push_native = arr.push,
    push = arr.push,
    slice = arr.slice,
    // Use a stripped-down indexOf if we can't use a native one
    indexOf = arr.indexOf || function( elem ) {
        var i = 0,
            len = this.length;
        for ( ; i < len; i++ ) {
            if ( this[i] === elem ) {
                return i;
            }
        }
        return -1;
    },

    booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

    // Regular expressions

    // Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
    whitespace = "[\\x20\\t\\r\\n\\f]",
    // http://www.w3.org/TR/css3-syntax/#characters
    characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

    // Loosely modeled on CSS identifier characters
    // An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
    // Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
    identifier = characterEncoding.replace( "w", "w#" ),

    // Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
    attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
        "*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

    // Prefer arguments quoted,
    //   then not containing pseudos/brackets,
    //   then attribute selectors/non-parenthetical expressions,
    //   then anything else
    // These preferences are here to reduce the number of selectors
    //   needing tokenize in the PSEUDO preFilter
    pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)",

    // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
    rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

    rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
    rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

    rsibling = new RegExp( whitespace + "*[+~]" ),
    rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*)" + whitespace + "*\\]", "g" ),

    rpseudo = new RegExp( pseudos ),
    ridentifier = new RegExp( "^" + identifier + "$" ),

    matchExpr = {
        "ID": new RegExp( "^#(" + characterEncoding + ")" ),
        "CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
        "TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
        "ATTR": new RegExp( "^" + attributes ),
        "PSEUDO": new RegExp( "^" + pseudos ),
        "CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
            "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
            "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
        "bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
        // For use in libraries implementing .is()
        // We use this for POS matching in `select`
        "needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
            whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
    },

    rnative = /^[^{]+\{\s*\[native \w/,

    // Easily-parseable/retrievable ID or TAG or CLASS selectors
    rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

    rinputs = /^(?:input|select|textarea|button)$/i,
    rheader = /^h\d$/i,

    rescape = /'|\\/g,

    // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
    runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
    funescape = function( _, escaped, escapedWhitespace ) {
        var high = "0x" + escaped - 0x10000;
        // NaN means non-codepoint
        // Support: Firefox
        // Workaround erroneous numeric interpretation of +"0x"
        return high !== high || escapedWhitespace ?
            escaped :
            // BMP codepoint
            high < 0 ?
                String.fromCharCode( high + 0x10000 ) :
                // Supplemental Plane codepoint (surrogate pair)
                String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
    };

// Optimize for push.apply( _, NodeList )
try {
    push.apply(
        (arr = slice.call( preferredDoc.childNodes )),
        preferredDoc.childNodes
    );
    // Support: Android<4.0
    // Detect silently failing push.apply
    arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
    push = { apply: arr.length ?

        // Leverage slice if possible
        function( target, els ) {
            push_native.apply( target, slice.call(els) );
        } :

        // Support: IE<9
        // Otherwise append directly
        function( target, els ) {
            var j = target.length,
                i = 0;
            // Can't trust NodeList.length
            while ( (target[j++] = els[i++]) ) {}
            target.length = j - 1;
        }
    };
}

function Sizzle( selector, context, results, seed ) {
    var match, elem, m, nodeType,
        // QSA vars
        i, groups, old, nid, newContext, newSelector;

    if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
        setDocument( context );
    }

    context = context || document;
    results = results || [];

    if ( !selector || typeof selector !== "string" ) {
        return results;
    }

    if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
        return [];
    }

    if ( documentIsHTML && !seed ) {

        // Shortcuts
        if ( (match = rquickExpr.exec( selector )) ) {
            // Speed-up: Sizzle("#ID")
            if ( (m = match[1]) ) {
                if ( nodeType === 9 ) {
                    elem = context.getElementById( m );
                    // Check parentNode to catch when Blackberry 4.6 returns
                    // nodes that are no longer in the document #6963
                    if ( elem && elem.parentNode ) {
                        // Handle the case where IE, Opera, and Webkit return items
                        // by name instead of ID
                        if ( elem.id === m ) {
                            results.push( elem );
                            return results;
                        }
                    } else {
                        return results;
                    }
                } else {
                    // Context is not a document
                    if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
                        contains( context, elem ) && elem.id === m ) {
                        results.push( elem );
                        return results;
                    }
                }

            // Speed-up: Sizzle("TAG")
            } else if ( match[2] ) {
                push.apply( results, context.getElementsByTagName( selector ) );
                return results;

            // Speed-up: Sizzle(".CLASS")
            } else if ( (m = match[3]) && support.getElementsByClassName && context.getElementsByClassName ) {
                push.apply( results, context.getElementsByClassName( m ) );
                return results;
            }
        }

        // QSA path
        if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
            nid = old = expando;
            newContext = context;
            newSelector = nodeType === 9 && selector;

            // qSA works strangely on Element-rooted queries
            // We can work around this by specifying an extra ID on the root
            // and working up from there (Thanks to Andrew Dupont for the technique)
            // IE 8 doesn't work on object elements
            if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
                groups = tokenize( selector );

                if ( (old = context.getAttribute("id")) ) {
                    nid = old.replace( rescape, "\\$&" );
                } else {
                    context.setAttribute( "id", nid );
                }
                nid = "[id='" + nid + "'] ";

                i = groups.length;
                while ( i-- ) {
                    groups[i] = nid + toSelector( groups[i] );
                }
                newContext = rsibling.test( selector ) && context.parentNode || context;
                newSelector = groups.join(",");
            }

            if ( newSelector ) {
                try {
                    push.apply( results,
                        newContext.querySelectorAll( newSelector )
                    );
                    return results;
                } catch(qsaError) {
                } finally {
                    if ( !old ) {
                        context.removeAttribute("id");
                    }
                }
            }
        }
    }

    // All others
    return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * For feature detection
 * @param {Function} fn The function to test for native support
 */
function isNative( fn ) {
    return rnative.test( fn + "" );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *  property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *  deleting the oldest entry
 */
function createCache() {
    var keys = [];

    function cache( key, value ) {
        // Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
        if ( keys.push( key += " " ) > Expr.cacheLength ) {
            // Only keep the most recent entries
            delete cache[ keys.shift() ];
        }
        return (cache[ key ] = value);
    }
    return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
    fn[ expando ] = true;
    return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
    var div = document.createElement("div");

    try {
        return !!fn( div );
    } catch (e) {
        return false;
    } finally {
        // Remove from its parent by default
        if ( div.parentNode ) {
            div.parentNode.removeChild( div );
        }
        // release memory in IE
        div = null;
    }
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied if the test fails
 * @param {Boolean} test The result of a test. If true, null will be set as the handler in leiu of the specified handler
 */
function addHandle( attrs, handler, test ) {
    attrs = attrs.split("|");
    var current,
        i = attrs.length,
        setHandle = test ? null : handler;

    while ( i-- ) {
        // Don't override a user's handler
        if ( !(current = Expr.attrHandle[ attrs[i] ]) || current === handler ) {
            Expr.attrHandle[ attrs[i] ] = setHandle;
        }
    }
}

/**
 * Fetches boolean attributes by node
 * @param {Element} elem
 * @param {String} name
 */
function boolHandler( elem, name ) {
    // XML does not need to be checked as this will not be assigned for XML documents
    var val = elem.getAttributeNode( name );
    return val && val.specified ?
        val.value :
        elem[ name ] === true ? name.toLowerCase() : null;
}

/**
 * Fetches attributes without interpolation
 * http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
 * @param {Element} elem
 * @param {String} name
 */
function interpolationHandler( elem, name ) {
    // XML does not need to be checked as this will not be assigned for XML documents
    return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
}

/**
 * Uses defaultValue to retrieve value in IE6/7
 * @param {Element} elem
 * @param {String} name
 */
function valueHandler( elem ) {
    // Ignore the value *property* on inputs by using defaultValue
    // Fallback to Sizzle.attr by returning undefined where appropriate
    // XML does not need to be checked as this will not be assigned for XML documents
    if ( elem.nodeName.toLowerCase() === "input" ) {
        return elem.defaultValue;
    }
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns Returns -1 if a precedes b, 1 if a follows b
 */
function siblingCheck( a, b ) {
    var cur = b && a,
        diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
            ( ~b.sourceIndex || MAX_NEGATIVE ) -
            ( ~a.sourceIndex || MAX_NEGATIVE );

    // Use IE sourceIndex if available on both nodes
    if ( diff ) {
        return diff;
    }

    // Check if b follows a
    if ( cur ) {
        while ( (cur = cur.nextSibling) ) {
            if ( cur === b ) {
                return -1;
            }
        }
    }

    return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
    return function( elem ) {
        var name = elem.nodeName.toLowerCase();
        return name === "input" && elem.type === type;
    };
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
    return function( elem ) {
        var name = elem.nodeName.toLowerCase();
        return (name === "input" || name === "button") && elem.type === type;
    };
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
    return markFunction(function( argument ) {
        argument = +argument;
        return markFunction(function( seed, matches ) {
            var j,
                matchIndexes = fn( [], seed.length, argument ),
                i = matchIndexes.length;

            // Match elements found at the specified indexes
            while ( i-- ) {
                if ( seed[ (j = matchIndexes[i]) ] ) {
                    seed[j] = !(matches[j] = seed[j]);
                }
            }
        });
    });
}

/**
 * Detect xml
 * @param {Element|Object} elem An element or a document
 */
isXML = Sizzle.isXML = function( elem ) {
    // documentElement is verified for cases where it doesn't yet exist
    // (such as loading iframes in IE - #4833)
    var documentElement = elem && (elem.ownerDocument || elem).documentElement;
    return documentElement ? documentElement.nodeName !== "HTML" : false;
};

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
    var doc = node ? node.ownerDocument || node : preferredDoc,
        parent = doc.parentWindow;

    // If no document and documentElement is available, return
    if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
        return document;
    }

    // Set our document
    document = doc;
    docElem = doc.documentElement;

    // Support tests
    documentIsHTML = !isXML( doc );

    // Support: IE>8
    // If iframe document is assigned to "document" variable and if iframe has been reloaded,
    // IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
    if ( parent && parent.frameElement ) {
        parent.attachEvent( "onbeforeunload", function() {
            setDocument();
        });
    }

    /* Attributes
    ---------------------------------------------------------------------- */

    // Support: IE<8
    // Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
    support.attributes = assert(function( div ) {

        // Support: IE<8
        // Prevent attribute/property "interpolation"
        div.innerHTML = "<a href='#'></a>";
        addHandle( "type|href|height|width", interpolationHandler, div.firstChild.getAttribute("href") === "#" );

        // Support: IE<9
        // Use getAttributeNode to fetch booleans when getAttribute lies
        addHandle( booleans, boolHandler, div.getAttribute("disabled") == null );

        div.className = "i";
        return !div.getAttribute("className");
    });

    // Support: IE<9
    // Retrieving value should defer to defaultValue
    support.input = assert(function( div ) {
        div.innerHTML = "<input>";
        div.firstChild.setAttribute( "value", "" );
        return div.firstChild.getAttribute( "value" ) === "";
    });

    // IE6/7 still return empty string for value,
    // but are actually retrieving the property
    addHandle( "value", valueHandler, support.attributes && support.input );

    /* getElement(s)By*
    ---------------------------------------------------------------------- */

    // Check if getElementsByTagName("*") returns only elements
    support.getElementsByTagName = assert(function( div ) {
        div.appendChild( doc.createComment("") );
        return !div.getElementsByTagName("*").length;
    });

    // Check if getElementsByClassName can be trusted
    support.getElementsByClassName = assert(function( div ) {
        div.innerHTML = "<div class='a'></div><div class='a i'></div>";

        // Support: Safari<4
        // Catch class over-caching
        div.firstChild.className = "i";
        // Support: Opera<10
        // Catch gEBCN failure to find non-leading classes
        return div.getElementsByClassName("i").length === 2;
    });

    // Support: IE<10
    // Check if getElementById returns elements by name
    // The broken getElementById methods don't pick up programatically-set names,
    // so use a roundabout getElementsByName test
    support.getById = assert(function( div ) {
        docElem.appendChild( div ).id = expando;
        return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
    });

    // ID find and filter
    if ( support.getById ) {
        Expr.find["ID"] = function( id, context ) {
            if ( typeof context.getElementById !== strundefined && documentIsHTML ) {
                var m = context.getElementById( id );
                // Check parentNode to catch when Blackberry 4.6 returns
                // nodes that are no longer in the document #6963
                return m && m.parentNode ? [m] : [];
            }
        };
        Expr.filter["ID"] = function( id ) {
            var attrId = id.replace( runescape, funescape );
            return function( elem ) {
                return elem.getAttribute("id") === attrId;
            };
        };
    } else {
        // Support: IE6/7
        // getElementById is not reliable as a find shortcut
        delete Expr.find["ID"];

        Expr.filter["ID"] =  function( id ) {
            var attrId = id.replace( runescape, funescape );
            return function( elem ) {
                var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
                return node && node.value === attrId;
            };
        };
    }

    // Tag
    Expr.find["TAG"] = support.getElementsByTagName ?
        function( tag, context ) {
            if ( typeof context.getElementsByTagName !== strundefined ) {
                return context.getElementsByTagName( tag );
            }
        } :
        function( tag, context ) {
            var elem,
                tmp = [],
                i = 0,
                results = context.getElementsByTagName( tag );

            // Filter out possible comments
            if ( tag === "*" ) {
                while ( (elem = results[i++]) ) {
                    if ( elem.nodeType === 1 ) {
                        tmp.push( elem );
                    }
                }

                return tmp;
            }
            return results;
        };

    // Class
    Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
        if ( typeof context.getElementsByClassName !== strundefined && documentIsHTML ) {
            return context.getElementsByClassName( className );
        }
    };

    /* QSA/matchesSelector
    ---------------------------------------------------------------------- */

    // QSA and matchesSelector support

    // matchesSelector(:active) reports false when true (IE9/Opera 11.5)
    rbuggyMatches = [];

    // qSa(:focus) reports false when true (Chrome 21)
    // We allow this because of a bug in IE8/9 that throws an error
    // whenever `document.activeElement` is accessed on an iframe
    // So, we allow :focus to pass through QSA all the time to avoid the IE error
    // See http://bugs.jquery.com/ticket/13378
    rbuggyQSA = [];

    if ( (support.qsa = isNative(doc.querySelectorAll)) ) {
        // Build QSA regex
        // Regex strategy adopted from Diego Perini
        assert(function( div ) {
            // Select is set to empty string on purpose
            // This is to test IE's treatment of not explicitly
            // setting a boolean content attribute,
            // since its presence should be enough
            // http://bugs.jquery.com/ticket/12359
            div.innerHTML = "<select><option selected=''></option></select>";

            // Support: IE8
            // Boolean attributes and "value" are not treated correctly
            if ( !div.querySelectorAll("[selected]").length ) {
                rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
            }

            // Webkit/Opera - :checked should return selected option elements
            // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
            // IE8 throws error here and will not see later tests
            if ( !div.querySelectorAll(":checked").length ) {
                rbuggyQSA.push(":checked");
            }
        });

        assert(function( div ) {

            // Support: Opera 10-12/IE8
            // ^= $= *= and empty values
            // Should not select anything
            // Support: Windows 8 Native Apps
            // The type attribute is restricted during .innerHTML assignment
            var input = doc.createElement("input");
            input.setAttribute( "type", "hidden" );
            div.appendChild( input ).setAttribute( "t", "" );

            if ( div.querySelectorAll("[t^='']").length ) {
                rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
            }

            // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
            // IE8 throws error here and will not see later tests
            if ( !div.querySelectorAll(":enabled").length ) {
                rbuggyQSA.push( ":enabled", ":disabled" );
            }

            // Opera 10-11 does not throw on post-comma invalid pseudos
            div.querySelectorAll("*,:x");
            rbuggyQSA.push(",.*:");
        });
    }

    if ( (support.matchesSelector = isNative( (matches = docElem.webkitMatchesSelector ||
        docElem.mozMatchesSelector ||
        docElem.oMatchesSelector ||
        docElem.msMatchesSelector) )) ) {

        assert(function( div ) {
            // Check to see if it's possible to do matchesSelector
            // on a disconnected node (IE 9)
            support.disconnectedMatch = matches.call( div, "div" );

            // This should fail with an exception
            // Gecko does not error, returns false instead
            matches.call( div, "[s!='']:x" );
            rbuggyMatches.push( "!=", pseudos );
        });
    }

    rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
    rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

    /* Contains
    ---------------------------------------------------------------------- */

    // Element contains another
    // Purposefully does not implement inclusive descendent
    // As in, an element does not contain itself
    contains = isNative(docElem.contains) || docElem.compareDocumentPosition ?
        function( a, b ) {
            var adown = a.nodeType === 9 ? a.documentElement : a,
                bup = b && b.parentNode;
            return a === bup || !!( bup && bup.nodeType === 1 && (
                adown.contains ?
                    adown.contains( bup ) :
                    a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
            ));
        } :
        function( a, b ) {
            if ( b ) {
                while ( (b = b.parentNode) ) {
                    if ( b === a ) {
                        return true;
                    }
                }
            }
            return false;
        };

    /* Sorting
    ---------------------------------------------------------------------- */

    // Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
    // Detached nodes confoundingly follow *each other*
    support.sortDetached = assert(function( div1 ) {
        // Should return 1, but returns 4 (following)
        return div1.compareDocumentPosition( doc.createElement("div") ) & 1;
    });

    // Document order sorting
    sortOrder = docElem.compareDocumentPosition ?
    function( a, b ) {

        // Flag for duplicate removal
        if ( a === b ) {
            hasDuplicate = true;
            return 0;
        }

        var compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b );

        if ( compare ) {
            // Disconnected nodes
            if ( compare & 1 ||
                (!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

                // Choose the first element that is related to our preferred document
                if ( a === doc || contains(preferredDoc, a) ) {
                    return -1;
                }
                if ( b === doc || contains(preferredDoc, b) ) {
                    return 1;
                }

                // Maintain original order
                return sortInput ?
                    ( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
                    0;
            }

            return compare & 4 ? -1 : 1;
        }

        // Not directly comparable, sort on existence of method
        return a.compareDocumentPosition ? -1 : 1;
    } :
    function( a, b ) {
        var cur,
            i = 0,
            aup = a.parentNode,
            bup = b.parentNode,
            ap = [ a ],
            bp = [ b ];

        // Exit early if the nodes are identical
        if ( a === b ) {
            hasDuplicate = true;
            return 0;

        // Parentless nodes are either documents or disconnected
        } else if ( !aup || !bup ) {
            return a === doc ? -1 :
                b === doc ? 1 :
                aup ? -1 :
                bup ? 1 :
                sortInput ?
                ( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
                0;

        // If the nodes are siblings, we can do a quick check
        } else if ( aup === bup ) {
            return siblingCheck( a, b );
        }

        // Otherwise we need full lists of their ancestors for comparison
        cur = a;
        while ( (cur = cur.parentNode) ) {
            ap.unshift( cur );
        }
        cur = b;
        while ( (cur = cur.parentNode) ) {
            bp.unshift( cur );
        }

        // Walk down the tree looking for a discrepancy
        while ( ap[i] === bp[i] ) {
            i++;
        }

        return i ?
            // Do a sibling check if the nodes have a common ancestor
            siblingCheck( ap[i], bp[i] ) :

            // Otherwise nodes in our document sort first
            ap[i] === preferredDoc ? -1 :
            bp[i] === preferredDoc ? 1 :
            0;
    };

    return doc;
};

Sizzle.matches = function( expr, elements ) {
    return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
    // Set document vars if needed
    if ( ( elem.ownerDocument || elem ) !== document ) {
        setDocument( elem );
    }

    // Make sure that attribute selectors are quoted
    expr = expr.replace( rattributeQuotes, "='$1']" );

    if ( support.matchesSelector && documentIsHTML &&
        ( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
        ( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

        try {
            var ret = matches.call( elem, expr );

            // IE 9's matchesSelector returns false on disconnected nodes
            if ( ret || support.disconnectedMatch ||
                    // As well, disconnected nodes are said to be in a document
                    // fragment in IE 9
                    elem.document && elem.document.nodeType !== 11 ) {
                return ret;
            }
        } catch(e) {}
    }

    return Sizzle( expr, document, null, [elem] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
    // Set document vars if needed
    if ( ( context.ownerDocument || context ) !== document ) {
        setDocument( context );
    }
    return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
    // Set document vars if needed
    if ( ( elem.ownerDocument || elem ) !== document ) {
        setDocument( elem );
    }

    var fn = Expr.attrHandle[ name.toLowerCase() ],
        // Don't get fooled by Object.prototype properties (jQuery #13807)
        val = ( fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
            fn( elem, name, !documentIsHTML ) :
            undefined );

    return val === undefined ?
        support.attributes || !documentIsHTML ?
            elem.getAttribute( name ) :
            (val = elem.getAttributeNode(name)) && val.specified ?
                val.value :
                null :
        val;
};

Sizzle.error = function( msg ) {
    throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
    var elem,
        duplicates = [],
        j = 0,
        i = 0;

    // Unless we *know* we can detect duplicates, assume their presence
    hasDuplicate = !support.detectDuplicates;
    sortInput = !support.sortStable && results.slice( 0 );
    results.sort( sortOrder );

    if ( hasDuplicate ) {
        while ( (elem = results[i++]) ) {
            if ( elem === results[ i ] ) {
                j = duplicates.push( i );
            }
        }
        while ( j-- ) {
            results.splice( duplicates[ j ], 1 );
        }
    }

    return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
    var node,
        ret = "",
        i = 0,
        nodeType = elem.nodeType;

    if ( !nodeType ) {
        // If no nodeType, this is expected to be an array
        for ( ; (node = elem[i]); i++ ) {
            // Do not traverse comment nodes
            ret += getText( node );
        }
    } else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
        // Use textContent for elements
        // innerText usage removed for consistency of new lines (see #11153)
        if ( typeof elem.textContent === "string" ) {
            return elem.textContent;
        } else {
            // Traverse its children
            for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
                ret += getText( elem );
            }
        }
    } else if ( nodeType === 3 || nodeType === 4 ) {
        return elem.nodeValue;
    }
    // Do not include comment or processing instruction nodes

    return ret;
};

Expr = Sizzle.selectors = {

    // Can be adjusted by the user
    cacheLength: 50,

    createPseudo: markFunction,

    match: matchExpr,

    attrHandle: {},

    find: {},

    relative: {
        ">": { dir: "parentNode", first: true },
        " ": { dir: "parentNode" },
        "+": { dir: "previousSibling", first: true },
        "~": { dir: "previousSibling" }
    },

    preFilter: {
        "ATTR": function( match ) {
            match[1] = match[1].replace( runescape, funescape );

            // Move the given value to match[3] whether quoted or unquoted
            match[3] = ( match[4] || match[5] || "" ).replace( runescape, funescape );

            if ( match[2] === "~=" ) {
                match[3] = " " + match[3] + " ";
            }

            return match.slice( 0, 4 );
        },

        "CHILD": function( match ) {
            /* matches from matchExpr["CHILD"]
                1 type (only|nth|...)
                2 what (child|of-type)
                3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
                4 xn-component of xn+y argument ([+-]?\d*n|)
                5 sign of xn-component
                6 x of xn-component
                7 sign of y-component
                8 y of y-component
            */
            match[1] = match[1].toLowerCase();

            if ( match[1].slice( 0, 3 ) === "nth" ) {
                // nth-* requires argument
                if ( !match[3] ) {
                    Sizzle.error( match[0] );
                }

                // numeric x and y parameters for Expr.filter.CHILD
                // remember that false/true cast respectively to 0/1
                match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
                match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

            // other types prohibit arguments
            } else if ( match[3] ) {
                Sizzle.error( match[0] );
            }

            return match;
        },

        "PSEUDO": function( match ) {
            var excess,
                unquoted = !match[5] && match[2];

            if ( matchExpr["CHILD"].test( match[0] ) ) {
                return null;
            }

            // Accept quoted arguments as-is
            if ( match[3] && match[4] !== undefined ) {
                match[2] = match[4];

            // Strip excess characters from unquoted arguments
            } else if ( unquoted && rpseudo.test( unquoted ) &&
                // Get excess from tokenize (recursively)
                (excess = tokenize( unquoted, true )) &&
                // advance to the next closing parenthesis
                (excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

                // excess is a negative index
                match[0] = match[0].slice( 0, excess );
                match[2] = unquoted.slice( 0, excess );
            }

            // Return only captures needed by the pseudo filter method (type and argument)
            return match.slice( 0, 3 );
        }
    },

    filter: {

        "TAG": function( nodeNameSelector ) {
            var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
            return nodeNameSelector === "*" ?
                function() { return true; } :
                function( elem ) {
                    return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
                };
        },

        "CLASS": function( className ) {
            var pattern = classCache[ className + " " ];

            return pattern ||
                (pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
                classCache( className, function( elem ) {
                    return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "" );
                });
        },

        "ATTR": function( name, operator, check ) {
            return function( elem ) {
                var result = Sizzle.attr( elem, name );

                if ( result == null ) {
                    return operator === "!=";
                }
                if ( !operator ) {
                    return true;
                }

                result += "";

                return operator === "=" ? result === check :
                    operator === "!=" ? result !== check :
                    operator === "^=" ? check && result.indexOf( check ) === 0 :
                    operator === "*=" ? check && result.indexOf( check ) > -1 :
                    operator === "$=" ? check && result.slice( -check.length ) === check :
                    operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
                    operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
                    false;
            };
        },

        "CHILD": function( type, what, argument, first, last ) {
            var simple = type.slice( 0, 3 ) !== "nth",
                forward = type.slice( -4 ) !== "last",
                ofType = what === "of-type";

            return first === 1 && last === 0 ?

                // Shortcut for :nth-*(n)
                function( elem ) {
                    return !!elem.parentNode;
                } :

                function( elem, context, xml ) {
                    var cache, outerCache, node, diff, nodeIndex, start,
                        dir = simple !== forward ? "nextSibling" : "previousSibling",
                        parent = elem.parentNode,
                        name = ofType && elem.nodeName.toLowerCase(),
                        useCache = !xml && !ofType;

                    if ( parent ) {

                        // :(first|last|only)-(child|of-type)
                        if ( simple ) {
                            while ( dir ) {
                                node = elem;
                                while ( (node = node[ dir ]) ) {
                                    if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
                                        return false;
                                    }
                                }
                                // Reverse direction for :only-* (if we haven't yet done so)
                                start = dir = type === "only" && !start && "nextSibling";
                            }
                            return true;
                        }

                        start = [ forward ? parent.firstChild : parent.lastChild ];

                        // non-xml :nth-child(...) stores cache data on `parent`
                        if ( forward && useCache ) {
                            // Seek `elem` from a previously-cached index
                            outerCache = parent[ expando ] || (parent[ expando ] = {});
                            cache = outerCache[ type ] || [];
                            nodeIndex = cache[0] === dirruns && cache[1];
                            diff = cache[0] === dirruns && cache[2];
                            node = nodeIndex && parent.childNodes[ nodeIndex ];

                            while ( (node = ++nodeIndex && node && node[ dir ] ||

                                // Fallback to seeking `elem` from the start
                                (diff = nodeIndex = 0) || start.pop()) ) {

                                // When found, cache indexes on `parent` and break
                                if ( node.nodeType === 1 && ++diff && node === elem ) {
                                    outerCache[ type ] = [ dirruns, nodeIndex, diff ];
                                    break;
                                }
                            }

                        // Use previously-cached element index if available
                        } else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
                            diff = cache[1];

                        // xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
                        } else {
                            // Use the same loop as above to seek `elem` from the start
                            while ( (node = ++nodeIndex && node && node[ dir ] ||
                                (diff = nodeIndex = 0) || start.pop()) ) {

                                if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
                                    // Cache the index of each encountered element
                                    if ( useCache ) {
                                        (node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
                                    }

                                    if ( node === elem ) {
                                        break;
                                    }
                                }
                            }
                        }

                        // Incorporate the offset, then check against cycle size
                        diff -= last;
                        return diff === first || ( diff % first === 0 && diff / first >= 0 );
                    }
                };
        },

        "PSEUDO": function( pseudo, argument ) {
            // pseudo-class names are case-insensitive
            // http://www.w3.org/TR/selectors/#pseudo-classes
            // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
            // Remember that setFilters inherits from pseudos
            var args,
                fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
                    Sizzle.error( "unsupported pseudo: " + pseudo );

            // The user may use createPseudo to indicate that
            // arguments are needed to create the filter function
            // just as Sizzle does
            if ( fn[ expando ] ) {
                return fn( argument );
            }

            // But maintain support for old signatures
            if ( fn.length > 1 ) {
                args = [ pseudo, pseudo, "", argument ];
                return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
                    markFunction(function( seed, matches ) {
                        var idx,
                            matched = fn( seed, argument ),
                            i = matched.length;
                        while ( i-- ) {
                            idx = indexOf.call( seed, matched[i] );
                            seed[ idx ] = !( matches[ idx ] = matched[i] );
                        }
                    }) :
                    function( elem ) {
                        return fn( elem, 0, args );
                    };
            }

            return fn;
        }
    },

    pseudos: {
        // Potentially complex pseudos
        "not": markFunction(function( selector ) {
            // Trim the selector passed to compile
            // to avoid treating leading and trailing
            // spaces as combinators
            var input = [],
                results = [],
                matcher = compile( selector.replace( rtrim, "$1" ) );

            return matcher[ expando ] ?
                markFunction(function( seed, matches, context, xml ) {
                    var elem,
                        unmatched = matcher( seed, null, xml, [] ),
                        i = seed.length;

                    // Match elements unmatched by `matcher`
                    while ( i-- ) {
                        if ( (elem = unmatched[i]) ) {
                            seed[i] = !(matches[i] = elem);
                        }
                    }
                }) :
                function( elem, context, xml ) {
                    input[0] = elem;
                    matcher( input, null, xml, results );
                    return !results.pop();
                };
        }),

        "has": markFunction(function( selector ) {
            return function( elem ) {
                return Sizzle( selector, elem ).length > 0;
            };
        }),

        "contains": markFunction(function( text ) {
            return function( elem ) {
                return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
            };
        }),

        // "Whether an element is represented by a :lang() selector
        // is based solely on the element's language value
        // being equal to the identifier C,
        // or beginning with the identifier C immediately followed by "-".
        // The matching of C against the element's language value is performed case-insensitively.
        // The identifier C does not have to be a valid language name."
        // http://www.w3.org/TR/selectors/#lang-pseudo
        "lang": markFunction( function( lang ) {
            // lang value must be a valid identifier
            if ( !ridentifier.test(lang || "") ) {
                Sizzle.error( "unsupported lang: " + lang );
            }
            lang = lang.replace( runescape, funescape ).toLowerCase();
            return function( elem ) {
                var elemLang;
                do {
                    if ( (elemLang = documentIsHTML ?
                        elem.lang :
                        elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

                        elemLang = elemLang.toLowerCase();
                        return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
                    }
                } while ( (elem = elem.parentNode) && elem.nodeType === 1 );
                return false;
            };
        }),

        // Miscellaneous
        "target": function( elem ) {
            var hash = window.location && window.location.hash;
            return hash && hash.slice( 1 ) === elem.id;
        },

        "root": function( elem ) {
            return elem === docElem;
        },

        "focus": function( elem ) {
            return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
        },

        // Boolean properties
        "enabled": function( elem ) {
            return elem.disabled === false;
        },

        "disabled": function( elem ) {
            return elem.disabled === true;
        },

        "checked": function( elem ) {
            // In CSS3, :checked should return both checked and selected elements
            // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
            var nodeName = elem.nodeName.toLowerCase();
            return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
        },

        "selected": function( elem ) {
            // Accessing this property makes selected-by-default
            // options in Safari work properly
            if ( elem.parentNode ) {
                elem.parentNode.selectedIndex;
            }

            return elem.selected === true;
        },

        // Contents
        "empty": function( elem ) {
            // http://www.w3.org/TR/selectors/#empty-pseudo
            // :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
            //   not comment, processing instructions, or others
            // Thanks to Diego Perini for the nodeName shortcut
            //   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
            for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
                if ( elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4 ) {
                    return false;
                }
            }
            return true;
        },

        "parent": function( elem ) {
            return !Expr.pseudos["empty"]( elem );
        },

        // Element/input types
        "header": function( elem ) {
            return rheader.test( elem.nodeName );
        },

        "input": function( elem ) {
            return rinputs.test( elem.nodeName );
        },

        "button": function( elem ) {
            var name = elem.nodeName.toLowerCase();
            return name === "input" && elem.type === "button" || name === "button";
        },

        "text": function( elem ) {
            var attr;
            // IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
            // use getAttribute instead to test this case
            return elem.nodeName.toLowerCase() === "input" &&
                elem.type === "text" &&
                ( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === elem.type );
        },

        // Position-in-collection
        "first": createPositionalPseudo(function() {
            return [ 0 ];
        }),

        "last": createPositionalPseudo(function( matchIndexes, length ) {
            return [ length - 1 ];
        }),

        "eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
            return [ argument < 0 ? argument + length : argument ];
        }),

        "even": createPositionalPseudo(function( matchIndexes, length ) {
            var i = 0;
            for ( ; i < length; i += 2 ) {
                matchIndexes.push( i );
            }
            return matchIndexes;
        }),

        "odd": createPositionalPseudo(function( matchIndexes, length ) {
            var i = 1;
            for ( ; i < length; i += 2 ) {
                matchIndexes.push( i );
            }
            return matchIndexes;
        }),

        "lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
            var i = argument < 0 ? argument + length : argument;
            for ( ; --i >= 0; ) {
                matchIndexes.push( i );
            }
            return matchIndexes;
        }),

        "gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
            var i = argument < 0 ? argument + length : argument;
            for ( ; ++i < length; ) {
                matchIndexes.push( i );
            }
            return matchIndexes;
        })
    }
};

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
    Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
    Expr.pseudos[ i ] = createButtonPseudo( i );
}

function tokenize( selector, parseOnly ) {
    var matched, match, tokens, type,
        soFar, groups, preFilters,
        cached = tokenCache[ selector + " " ];

    if ( cached ) {
        return parseOnly ? 0 : cached.slice( 0 );
    }

    soFar = selector;
    groups = [];
    preFilters = Expr.preFilter;

    while ( soFar ) {

        // Comma and first run
        if ( !matched || (match = rcomma.exec( soFar )) ) {
            if ( match ) {
                // Don't consume trailing commas as valid
                soFar = soFar.slice( match[0].length ) || soFar;
            }
            groups.push( tokens = [] );
        }

        matched = false;

        // Combinators
        if ( (match = rcombinators.exec( soFar )) ) {
            matched = match.shift();
            tokens.push({
                value: matched,
                // Cast descendant combinators to space
                type: match[0].replace( rtrim, " " )
            });
            soFar = soFar.slice( matched.length );
        }

        // Filters
        for ( type in Expr.filter ) {
            if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
                (match = preFilters[ type ]( match ))) ) {
                matched = match.shift();
                tokens.push({
                    value: matched,
                    type: type,
                    matches: match
                });
                soFar = soFar.slice( matched.length );
            }
        }

        if ( !matched ) {
            break;
        }
    }

    // Return the length of the invalid excess
    // if we're just parsing
    // Otherwise, throw an error or return tokens
    return parseOnly ?
        soFar.length :
        soFar ?
            Sizzle.error( selector ) :
            // Cache the tokens
            tokenCache( selector, groups ).slice( 0 );
}

function toSelector( tokens ) {
    var i = 0,
        len = tokens.length,
        selector = "";
    for ( ; i < len; i++ ) {
        selector += tokens[i].value;
    }
    return selector;
}

function addCombinator( matcher, combinator, base ) {
    var dir = combinator.dir,
        checkNonElements = base && dir === "parentNode",
        doneName = done++;

    return combinator.first ?
        // Check against closest ancestor/preceding element
        function( elem, context, xml ) {
            while ( (elem = elem[ dir ]) ) {
                if ( elem.nodeType === 1 || checkNonElements ) {
                    return matcher( elem, context, xml );
                }
            }
        } :

        // Check against all ancestor/preceding elements
        function( elem, context, xml ) {
            var data, cache, outerCache,
                dirkey = dirruns + " " + doneName;

            // We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
            if ( xml ) {
                while ( (elem = elem[ dir ]) ) {
                    if ( elem.nodeType === 1 || checkNonElements ) {
                        if ( matcher( elem, context, xml ) ) {
                            return true;
                        }
                    }
                }
            } else {
                while ( (elem = elem[ dir ]) ) {
                    if ( elem.nodeType === 1 || checkNonElements ) {
                        outerCache = elem[ expando ] || (elem[ expando ] = {});
                        if ( (cache = outerCache[ dir ]) && cache[0] === dirkey ) {
                            if ( (data = cache[1]) === true || data === cachedruns ) {
                                return data === true;
                            }
                        } else {
                            cache = outerCache[ dir ] = [ dirkey ];
                            cache[1] = matcher( elem, context, xml ) || cachedruns;
                            if ( cache[1] === true ) {
                                return true;
                            }
                        }
                    }
                }
            }
        };
}

function elementMatcher( matchers ) {
    return matchers.length > 1 ?
        function( elem, context, xml ) {
            var i = matchers.length;
            while ( i-- ) {
                if ( !matchers[i]( elem, context, xml ) ) {
                    return false;
                }
            }
            return true;
        } :
        matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
    var elem,
        newUnmatched = [],
        i = 0,
        len = unmatched.length,
        mapped = map != null;

    for ( ; i < len; i++ ) {
        if ( (elem = unmatched[i]) ) {
            if ( !filter || filter( elem, context, xml ) ) {
                newUnmatched.push( elem );
                if ( mapped ) {
                    map.push( i );
                }
            }
        }
    }

    return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
    if ( postFilter && !postFilter[ expando ] ) {
        postFilter = setMatcher( postFilter );
    }
    if ( postFinder && !postFinder[ expando ] ) {
        postFinder = setMatcher( postFinder, postSelector );
    }
    return markFunction(function( seed, results, context, xml ) {
        var temp, i, elem,
            preMap = [],
            postMap = [],
            preexisting = results.length,

            // Get initial elements from seed or context
            elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

            // Prefilter to get matcher input, preserving a map for seed-results synchronization
            matcherIn = preFilter && ( seed || !selector ) ?
                condense( elems, preMap, preFilter, context, xml ) :
                elems,

            matcherOut = matcher ?
                // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
                postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

                    // ...intermediate processing is necessary
                    [] :

                    // ...otherwise use results directly
                    results :
                matcherIn;

        // Find primary matches
        if ( matcher ) {
            matcher( matcherIn, matcherOut, context, xml );
        }

        // Apply postFilter
        if ( postFilter ) {
            temp = condense( matcherOut, postMap );
            postFilter( temp, [], context, xml );

            // Un-match failing elements by moving them back to matcherIn
            i = temp.length;
            while ( i-- ) {
                if ( (elem = temp[i]) ) {
                    matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
                }
            }
        }

        if ( seed ) {
            if ( postFinder || preFilter ) {
                if ( postFinder ) {
                    // Get the final matcherOut by condensing this intermediate into postFinder contexts
                    temp = [];
                    i = matcherOut.length;
                    while ( i-- ) {
                        if ( (elem = matcherOut[i]) ) {
                            // Restore matcherIn since elem is not yet a final match
                            temp.push( (matcherIn[i] = elem) );
                        }
                    }
                    postFinder( null, (matcherOut = []), temp, xml );
                }

                // Move matched elements from seed to results to keep them synchronized
                i = matcherOut.length;
                while ( i-- ) {
                    if ( (elem = matcherOut[i]) &&
                        (temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

                        seed[temp] = !(results[temp] = elem);
                    }
                }
            }

        // Add elements to results, through postFinder if defined
        } else {
            matcherOut = condense(
                matcherOut === results ?
                    matcherOut.splice( preexisting, matcherOut.length ) :
                    matcherOut
            );
            if ( postFinder ) {
                postFinder( null, results, matcherOut, xml );
            } else {
                push.apply( results, matcherOut );
            }
        }
    });
}

function matcherFromTokens( tokens ) {
    var checkContext, matcher, j,
        len = tokens.length,
        leadingRelative = Expr.relative[ tokens[0].type ],
        implicitRelative = leadingRelative || Expr.relative[" "],
        i = leadingRelative ? 1 : 0,

        // The foundational matcher ensures that elements are reachable from top-level context(s)
        matchContext = addCombinator( function( elem ) {
            return elem === checkContext;
        }, implicitRelative, true ),
        matchAnyContext = addCombinator( function( elem ) {
            return indexOf.call( checkContext, elem ) > -1;
        }, implicitRelative, true ),
        matchers = [ function( elem, context, xml ) {
            return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
                (checkContext = context).nodeType ?
                    matchContext( elem, context, xml ) :
                    matchAnyContext( elem, context, xml ) );
        } ];

    for ( ; i < len; i++ ) {
        if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
            matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
        } else {
            matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

            // Return special upon seeing a positional matcher
            if ( matcher[ expando ] ) {
                // Find the next relative operator (if any) for proper handling
                j = ++i;
                for ( ; j < len; j++ ) {
                    if ( Expr.relative[ tokens[j].type ] ) {
                        break;
                    }
                }
                return setMatcher(
                    i > 1 && elementMatcher( matchers ),
                    i > 1 && toSelector(
                        // If the preceding token was a descendant combinator, insert an implicit any-element `*`
                        tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
                    ).replace( rtrim, "$1" ),
                    matcher,
                    i < j && matcherFromTokens( tokens.slice( i, j ) ),
                    j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
                    j < len && toSelector( tokens )
                );
            }
            matchers.push( matcher );
        }
    }

    return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
    // A counter to specify which element is currently being matched
    var matcherCachedRuns = 0,
        bySet = setMatchers.length > 0,
        byElement = elementMatchers.length > 0,
        superMatcher = function( seed, context, xml, results, expandContext ) {
            var elem, j, matcher,
                setMatched = [],
                matchedCount = 0,
                i = "0",
                unmatched = seed && [],
                outermost = expandContext != null,
                contextBackup = outermostContext,
                // We must always have either seed elements or context
                elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
                // Use integer dirruns iff this is the outermost matcher
                dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1);

            if ( outermost ) {
                outermostContext = context !== document && context;
                cachedruns = matcherCachedRuns;
            }

            // Add elements passing elementMatchers directly to results
            // Keep `i` a string if there are no elements so `matchedCount` will be "00" below
            for ( ; (elem = elems[i]) != null; i++ ) {
                if ( byElement && elem ) {
                    j = 0;
                    while ( (matcher = elementMatchers[j++]) ) {
                        if ( matcher( elem, context, xml ) ) {
                            results.push( elem );
                            break;
                        }
                    }
                    if ( outermost ) {
                        dirruns = dirrunsUnique;
                        cachedruns = ++matcherCachedRuns;
                    }
                }

                // Track unmatched elements for set filters
                if ( bySet ) {
                    // They will have gone through all possible matchers
                    if ( (elem = !matcher && elem) ) {
                        matchedCount--;
                    }

                    // Lengthen the array for every element, matched or not
                    if ( seed ) {
                        unmatched.push( elem );
                    }
                }
            }

            // Apply set filters to unmatched elements
            matchedCount += i;
            if ( bySet && i !== matchedCount ) {
                j = 0;
                while ( (matcher = setMatchers[j++]) ) {
                    matcher( unmatched, setMatched, context, xml );
                }

                if ( seed ) {
                    // Reintegrate element matches to eliminate the need for sorting
                    if ( matchedCount > 0 ) {
                        while ( i-- ) {
                            if ( !(unmatched[i] || setMatched[i]) ) {
                                setMatched[i] = pop.call( results );
                            }
                        }
                    }

                    // Discard index placeholder values to get only actual matches
                    setMatched = condense( setMatched );
                }

                // Add matches to results
                push.apply( results, setMatched );

                // Seedless set matches succeeding multiple successful matchers stipulate sorting
                if ( outermost && !seed && setMatched.length > 0 &&
                    ( matchedCount + setMatchers.length ) > 1 ) {

                    Sizzle.uniqueSort( results );
                }
            }

            // Override manipulation of globals by nested matchers
            if ( outermost ) {
                dirruns = dirrunsUnique;
                outermostContext = contextBackup;
            }

            return unmatched;
        };

    return bySet ?
        markFunction( superMatcher ) :
        superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
    var i,
        setMatchers = [],
        elementMatchers = [],
        cached = compilerCache[ selector + " " ];

    if ( !cached ) {
        // Generate a function of recursive functions that can be used to check each element
        if ( !group ) {
            group = tokenize( selector );
        }
        i = group.length;
        while ( i-- ) {
            cached = matcherFromTokens( group[i] );
            if ( cached[ expando ] ) {
                setMatchers.push( cached );
            } else {
                elementMatchers.push( cached );
            }
        }

        // Cache the compiled function
        cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
    }
    return cached;
};

function multipleContexts( selector, contexts, results ) {
    var i = 0,
        len = contexts.length;
    for ( ; i < len; i++ ) {
        Sizzle( selector, contexts[i], results );
    }
    return results;
}

function select( selector, context, results, seed ) {
    var i, tokens, token, type, find,
        match = tokenize( selector );

    if ( !seed ) {
        // Try to minimize operations if there is only one group
        if ( match.length === 1 ) {

            // Take a shortcut and set the context if the root selector is an ID
            tokens = match[0] = match[0].slice( 0 );
            if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
                    support.getById && context.nodeType === 9 && documentIsHTML &&
                    Expr.relative[ tokens[1].type ] ) {

                context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
                if ( !context ) {
                    return results;
                }
                selector = selector.slice( tokens.shift().value.length );
            }

            // Fetch a seed set for right-to-left matching
            i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
            while ( i-- ) {
                token = tokens[i];

                // Abort if we hit a combinator
                if ( Expr.relative[ (type = token.type) ] ) {
                    break;
                }
                if ( (find = Expr.find[ type ]) ) {
                    // Search, expanding context for leading sibling combinators
                    if ( (seed = find(
                        token.matches[0].replace( runescape, funescape ),
                        rsibling.test( tokens[0].type ) && context.parentNode || context
                    )) ) {

                        // If seed is empty or no tokens remain, we can return early
                        tokens.splice( i, 1 );
                        selector = seed.length && toSelector( tokens );
                        if ( !selector ) {
                            push.apply( results, seed );
                            return results;
                        }

                        break;
                    }
                }
            }
        }
    }

    // Compile and execute a filtering function
    // Provide `match` to avoid retokenization if we modified the selector above
    compile( selector, match )(
        seed,
        context,
        !documentIsHTML,
        results,
        rsibling.test( selector )
    );
    return results;
}

// Deprecated
Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Initialize against the default document
setDocument();

// Support: Chrome<<14
// Always assume duplicates if they aren't passed to the comparison function
[0, 0].sort( sortOrder );
support.detectDuplicates = hasDuplicate;

// EXPOSE
if ( typeof define === "function" && define.amd ) {
    define(function() { return Sizzle; });
} else {
    window.Sizzle = Sizzle;
}
// EXPOSE

})( window );

/*!
 * TQ javascript库，版本号：1.0
 * @author allexwang 王志刚
 * Email : 4241089@qq.com
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Date: 2013/06/01
 */
(function(window,undefined){

    'use strict';
    var TQ = {};
    var readyList = [];
    var _ie = document.all ? true : false;
    var n = 0;
    var aps = Array.prototype.slice;
    var doc = document;

    TQ = TQ.prototype = {
        E:function(id,doc){
            return ((typeof id =="string") ? ( doc || document ).getElementById(id):id) || null;
        },
        C:function(tagName) {
            var dom;
            tagName = tagName.toUpperCase();
            if (tagName == 'TEXT') {
                dom = document.createTextNode('');
            } else if (tagName == 'BUFFER') {
                dom = document.createDocumentFragment();
            } else {
                dom = document.createElement(tagName);
            }
            return dom;
        },
        getEl:function(selector, context) {
            if (typeof selector === 'string') return Sizzle(selector, context)[0];
            return selector;
        },
        isArray:function(o){ 
            return Object.prototype.toString.call(o) === '[object Array]';
        },
        isNode:function(node){ 
            return (node != undefined) && Boolean(node.nodeName) && Boolean(node.nodeType);
        },
        isNumber:function(o) { 
            return typeof o === 'number'; 
        },
        isFunction:function(o) { 
            return typeof o === 'function'; 
        },
        //var a = {'onError':empty}
        empty:function(){
            return function(){};
        },
        //检测elem是否存在于数组array中从第i个元素开始构成的数组中
        inArray:function( elem, array, i ) {
            var len;
            if (array) {
                len = array.length;
                i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;
         
                for ( ; i < len; i++ ) {
                    // Skip accessing in sparse arrays
                    if ( i in array && array[ i ] === elem ) {
                        return i;
                    }
                }
            }

            return -1;
        },
        //合并参数
        //isEmpty({}) === true;
        //isEmpty({'test':'test'}) === false;
        isEmpty:function(o,isprototype){
            for(var k in o){
              if(isprototype || o.hasOwnProperty(k)){
                  return false;
              }
            }
            return true;
        },
        /**
         * query to json
         * @id queryToJson
         * @param {Json} JSON
         * @param {Boolean} isEncode
         * @return {String} querystring
         * @example
         * var q1 = 'a=1&b=2&c=3';
         * queryToJson(q1) === {'a':1,'b':2,'c':3};
         */
        queryToJson:function(QS, isDecode){
            var _Qlist = TQ.trim(QS).split("&");
            var _json  = {};
            var _fData = function(data){
                if(isDecode){
                    return decodeURIComponent(data);
                }else{
                    return data;
                }
            };
            for(var i = 0, len = _Qlist.length; i < len; i++){
                if(_Qlist[i]){
                    var _hsh = _Qlist[i].split("=");
                    var _key = _hsh[0];
                    var _value = _hsh[1];
                    
                    // 如果只有key没有value, 那么将全部丢入一个$nullName数组中
                    if(_hsh.length < 2){
                        _value = _key;
                        _key = '$nullName';
                    }
                    // 如果缓存堆栈中没有这个数据
                    if(!_json[_key]) {
                        _json[_key] = _fData(_value);
                    }
                    // 如果堆栈中已经存在这个数据，则转换成数组存储
                    else {
                        if(isArray(_json[_key]) != true) {
                            _json[_key] = [_json[_key]];
                        }
                        _json[_key].push(_fData(_value));
                    }
                }
            }
            return _json;
        },
        /**
         * 自动把HTML分析成Dom节点,并返回相应的文档碎片跟带级联的节点列表
         * 不传入规则自动分析node-type属性,传入规则按照传入规则进行分析
         * @builder
         * @builder
         * @param {String|Node} sHTML 需要被处理的HTML字符串 或者节点引用
         * @param {Object | Null} 参数
         * {
         * // dom对象, 选择器
         * 'input1': 'input[node-type=input1],textarea[node-type=input1]'
         * }
         * @return {Object} 文档碎片跟节点列表
         * {
         *  'box': 文档碎片
         *  'list': 节点列表,带级联
         * }
         * @author FlashSoft | fangchao@staff.sina.com.cn
         * @example
         * var sHTML = '' +
         * '<div node-type=div1>' +
         * '<input />' +
         * '<input />' +
         * '<input />' +
         * '<input />' +
         * '<input />' +
         * '<input />' +
         * '<input node-type="feed_item444444" />' +
         * '<input node-type="feed_item" />' +
         * '<textarea style="font-family: Tahoma,宋体;" range="1400" name="status" node-type="poster"></textarea>' +
         * '<ul>' +
         * '<li class="MIB_linedot_l" node-type ="feed_item" dynamic-id="2777763617"></li>' +
         * '<li class="MIB_linedot_l" node-type= "feed_ite43m" dynamic-id="2777763617"></li>' +
         * '<li class="MIB_linedot_l" node-type=              "feed_1item" dynamic-id="2777763617"></li>' +
         * '<li class="MIB_linedot_l" node-type="feed_it2em" dynamic-id="2777763617"></li>' +
         * '<li class="MIB_linedot_l" node-type="feed_item" dynamic-id="2777763617"></li>' +
         * '<li class="MIB_linedot_l" anode-type="1111111111111111111" dynamic-id="2777763617"></li>' +
         * '</ul>' +
         * '</div>' +
         * '<input node-type="input13" />' +
         * '<h1 node-type="h1111" />asdfasdf</h1>';
         * var bd = $.core.dom.builder(sHTML);
         */
        builder:function(sHTML, oSelector){     
            var isHTML = ((typeof sHTML) === "string");
            // 自动配置
            // var selectorList = autoDeploy( _isHTML ? sHTML : sHTML.innerHTML, oSelector);
            
            // 写入HTML
            var container = sHTML;
            
            if(isHTML) {
                container = TQ.C('div');
                container.innerHTML = sHTML;
            }
            
            // 通过选择器产生domList
            // 默认产生的是数组,所以需要转化下
             
            // 用core.dom.sizzle.matches来提高性能.
            var domList, totalList;
            domList = {};
            
            if(oSelector){
                for(key in selectorList){
                    domList[key] = Sizzle(oSelector[key].toString(), container);
                }
            }else{
                totalList = Sizzle('[node-type]', container);
                for(var i = 0, len = totalList.length; i < len; i += 1){
                    var key = totalList[i].getAttribute('node-type');
                    if(!domList[key]){
                        domList[key] = [];
                    }
                    domList[key].push(totalList[i]);
                }
            }
            //end modify
            // 把结果放入到文档碎片中
            var domBox = sHTML;
            
            if (isHTML) {
                domBox = TQ.C('buffer');
                while (container.childNodes[0]) {
                    domBox.appendChild(container.childNodes[0]);
                }
            }
            
            // 返回文档碎片跟节点列表
            return {
                'box': domBox,
                'list': domList
            };
        },
        preventDefault:function(event){
            event = event || TQ.getEvent();
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
        },
        //to decide whether Element A contains Element B;
        //contains(getEl('parent'),getEl('child')) === true;
        contains:function(parent, node){
            if (parent === node) {
                return false;

            } else if (parent.compareDocumentPosition) {
                return ((parent.compareDocumentPosition(node) & 16) === 16);

            } else if (parent.contains && node.nodeType === 1) {
                return   parent.contains(node);

            }else {
                while (node = node.parentNode) {
                    if (parent === node){
                        return true;
                    }
                }
            }
            return false;
        },
        //events.removeEvent(outer,"click",add);
        removeEvent:function(el, type, fn) {
            el = TQ.getEl(el);

            if (el == null) {
                return false;
            }

            if (typeof fn !== "function") {
                return false;
            }

            if (el.removeEventListener) {
                el.removeEventListener(type, fn, false);
            } else if (el.detachEvent) {
                el.detachEvent("on" + type, fn);
            }

            el['on' + type] = null;
        },
        //
        getEvent:function(){
          return (function() {
              if (document.addEventListener) {
                  return function() {
                      var o = arguments.callee;
                      var e;
                      do {
                          e = o.arguments[0];
                          if (e && (e.constructor == Event || e.constructor == MouseEvent || e.constructor == KeyboardEvent)) {
                              return e;
                          }
                      } while (o = o.caller);
                      return e;
                  };
              } else {
                  return function(el, type, fn) {
                      return window.event;
                  };
              }
          }());
        },
        ajax:function(argsObj){
            var xhr = new XHR();
            return xhr.send(argsObj);
        },
        //events.addEvent(outer,"click",add);
        addEvent:function(el, type, fn) {
            el = TQ.getEl(el);

            if (el == null) {
                return false;
            }

            if (typeof fn !== "function") {
                return false;
            }

            if (el.addEventListener) {
                el.addEventListener(type, fn, false);
            } else if (el.attachEvent) {
                el.attachEvent('on' + type, fn);
            } else {
                el['on' + type] = fn;
            }
        },
        //
        fixEvent:function(e){
            e = e || TQ.getEvent();
            //fix target
            if(!e.target){
              e.target = e.srcElement || document;
            }
            //fix pageX & pageY
            if(e.pageX == null && e.clientX != null){
            var html = document.documentElement;
            var body = document.body;

            e.pageX = e.clientX + (html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || body && body.clientLeft || 0);
            e.pageY = e.clientY + (html.scrollTop  || body && body.scrollTop  || 0) - (html.clientTop  || body && body.clientTop  || 0);
            }
            //      //fix wheelDelta
            //      if(!('wheelDelta' in e)){
            //          e.wheelDelta = e.detail * 40 * -1;
            //      }
            //fix button
            if (!e.which && e.button) {
              if (e.button & 1) {e.which = 1;}      // Left
              else if (e.button & 4) {e.which = 2;} // Middle
              else if (e.button & 2) {e.which = 3;} // Right
            }

            //fix relatedTarget
            if (e.relatedTarget === undefined) {
              e.relatedTarget = e.fromElement || e.toElement;
            }

            //fix layerX & layerY(之后会去掉,为了向下兼容)
            if (e.layerX == null && e.offsetX != null){
              e.layerX = e.offsetX;
              e.layerY = e.offsetY;
            }
            return e;
        },
        //delete the space at the beginning and end of the string
        trim:function(str){
            if(typeof str !== 'string'){
                throw 'trim need a string as parameter';
            }
            var len = str.length;
            var s = 0;
            var reg = /(\u3000|\s|\t|\u00A0)/;
            
            while(s < len){
                if(!reg.test(str.charAt(s))){
                    break;
                }
                s += 1;
            }
            while(len > s){
                if(!reg.test(str.charAt(len - 1))){
                    break;
                }
                len -= 1;
            }
            return str.slice(s, len);
            // if(typeof str.trim === 'function'){
            //  return str.trim();
            // }else{
                // return str.replace(/^(\u3000|\s|\t|\u00A0)*|(\u3000|\s|\t|\u00A0)*$/g, '');
            // }
        },
        /**
         * to decide whether Element A has an classname B
         * hasClassName(getEl('test'),'classname1');
         */
        hasClassName:function(node, className){
            return (new RegExp('(^|\\s)' + className + '($|\\s)').test(node.className));
        },
        /**
         * Add a classname for an Element
         * addClassName(getEl('test'),'classname1');
         */
        addClassName:function(node, className) {
            if(node.nodeType === 1){
                if (!TQ.hasClassName(node,className)) {
                    node.className = TQ.trim(node.className) + ' ' + className;
                }
            }
        },
        /**
         * remove a classname for an Element
         * removeClassName(TQ.E('test'),'classname1');
         */
        removeClassName:function(node,className){

            var elem;
            var l;

            for(var i = 0,l = node.length;i<l;i++){
                elem = node[i];

                if(elem.nodeType === 1){
                    if(TQ.hasClassName(elem,className)){

                        elem.className = elem.className.replace(new RegExp('(^|\\s)' + className + '($|\\s)'),' ');
                    }
                }

            }
        },
        /**
         * find parent father node element
         * @param  {[type]} element is 'string'
         * @employ TQ.parent('#id');
         */
        parent:function(element){
            element = Sizzle(element);
            var p = element.parentNode;
            return p && p.nodeType !== 11 ? p : null;
        },
        /**
         * find child node element
         * @param  {[type]} element
         * @return {[type]}
         */
        child:function(element){
            element = Sizzle(element);
            var n = element.firstChild;
            var r = new List();
            for(;n;n = n.nextSibling){
                if(n.nodeType === 1 && n !== element){
                    r.push(n);
                }
            }
            return r;
        },
        /**
         * 查找相邻元素(后面)
         */
        next:function(element){
            return this._brother(element,'nextSibling');
        },
        /**
         * //查找相领前面元素
         */
        prev:function(element){
            return this._brother(element,'previousSibling');
        },
        /**
         * //第一个子级节点
         * @return {[type]}
         */
        first:function(element){
            element = TQ.getEl(element).firstChild;
            return (element && element.nodeType !=1) ? this.next(element) : element;
        },
        last:function(element){
            element = TQ.getEl(element).lastChild;
            return (element && element.nodeType !=1) ? this.prev(elem) : elem;
        },
        _brother:function(elem,position){
            elem = TQ.getEl(elem);
            do{
                elem = elem[position];
            }
            while (elem && elem.nodeType !=1);
            return elem;
        },
        //用一个表达式来检查当前选择的元素集合，如果其中至少有一个元素符合这个给定的表达式就返回true。
        is: function(elem, selector ) {
            return !!selector && JY.query.filter( selector , elem ).length > 0 ;
        },
        //遍历集合List或array
        each:function(arr , callback){
            for (var i = 0,l = arr. length; i<l ; i++ ){
                if (arr [i]!==undefined){
                    callback.call(arr[i],arr[i],i);
                }
            };
            return this;
        },
        //元素位置
        position:function(elem){
            elem = Sizzle(elem);   
            return {x:elem.getBoundingClientRect().left + doc.documentElement.scrollLeft,y:elem.getBoundingClientRect().top + doc.documentElement.scrollTop};
        },
        //元素偏移量
        offset:function(elem){
            elem = Sizzle(elem);   
            return {x:elem.getBoundingClientRect().left + doc.documentElement.scrollLeft,y:elem.getBoundingClientRect().top + doc.documentElement.scrollTop};
        },
        //交互变换的样式
        toggleClass:function(elem,cls){
            if (TQ.hasClassName(elem,cls)){
                TQ.removeClass(elem,cls);
            }else{
                TQ.addClassName(elem,cls);
            };
            return this;
        },
        /**
         * 获取dom的宽高
         * @getSize
         * @params {Element} dom 被计算的dom节点
         * @return {Object} 
         *      {
         *          'width' : 0
         *          'height' : 0
         *      }
         * @example 
         * getSize(TQ.E('layer'));
         */
        /**
         * 页面统一隐藏容器工具
         * @id hideContainer
         * @example 
         * hideContainer.appendChild(TQ.E('test'));
         * hideContainer.removeChild(TQ.E('test'));
         * @import isNode
         */
        hideContainer:function(){
            
             var hideDiv;
             
             var initDiv = function() {
                if(hideDiv) return;
                hideDiv = TQ.C("div");
                hideDiv.style.cssText = "position:absolute;top:-9999px;left:-9999px;";
                document.getElementsByTagName("head")[0].appendChild(hideDiv);
             };
             
             var that = {
                /**
                 * 向隐藏容器添加节点
                 * @method appendChild
                 * @param {Element} el 节点
                 */
                appendChild: function(el) {
                    if(TQ.isNode(el)) {
                        initDiv();
                        hideDiv.appendChild(el);
                    }
                },
                /**
                 * 向隐藏容器添加节点
                 * @method removeChild
                 * @param {Element} el 节点
                 */
                removeChild: function(el) {
                    if(TQ.isNode(el)) {
                        hideDiv && hideDiv.removeChild(el);
                    }
                }
             };
             
             return that;
             
        },
        //TQ.setStyles(TQ.getEl('test'),{aa:aa})
        setStyles:function(el, styles) {
            TQ.foreach(styles, function(v, k) { TQ.setStyle(el, k, v); });
        },
        /**
         * set Elements style
         * @id setStyle
         * @alias setStyle
         * @param {Element} node
         * @param {String} property
         * @param {String} val
         * @example
         * setStyle(TQ.getEl('test'),'display','none');
         */
        setStyle:function(node, property, val){
            function supportFilters() {
                if ('y' in supportFilters) {
                    return supportFilters.y;
                }
                return supportFilters.y = ('filters' in TQ.C('div'));
            };

            if (supportFilters()) {
                switch (property) {
                    case "opacity":
                        node.style.filter = "alpha(opacity=" + (val * 100) + ")";
                        if (!node.currentStyle || !node.currentStyle.hasLayout) {
                            node.style.zoom = 1;
                        }
                        break;
                    case "float":
                        property = "styleFloat";
                    default:
                        node.style[property] = val;
                }
            }
            else {
                if (property == "float") {
                    property = "cssFloat";
                }
                node.style[property] = val;
            }
        },
        /**
         * get Elements style
         * @id getStyle
         * @alias getStyle
         * @param {Element} node
         * @param {String} property
         * @return {String} value
         * @example
         * getStyle(TQ.E('test'),'display') === 'none';
         */
        getStyle:function(node, property){
            
            function supportFilters() {
                if ('y' in supportFilters) {
                    return supportFilters.y;
                }
                return supportFilters.y = ('filters' in TQ.C('div'));
            }
            
            if (supportFilters()) {
                switch (property) {
                    // 透明度
                    case "opacity":
                        var val = 100;
                        try {
                            val = node.filters['DXImageTransform.Microsoft.Alpha'].opacity;
                        } 
                        catch (e) {
                            try {
                                val = node.filters('alpha').opacity;
                            } 
                            catch (e) {
                            }
                        }
                        return val / 100;
                    // 浮动
                    case "float":
                        property = "styleFloat";
                    default:
                        var value = node.currentStyle ? node.currentStyle[property] : null;
                        return (node.style[property] || value);
                }
            }
            else {
                // 浮动
                if (property == "float") {
                    property = "cssFloat";
                }
                // 获取集合
                try {
                    var computed = document.defaultView.getComputedStyle(node, "");
                } 
                catch (e) {}
                return node.style[property] || computed ? computed[property] : null;
            }
        },
        /**
         * Get window's size
         * @id winSize
         * @alias winSize
         * @param {Element} _target
         * @return {Object} n
         * @example
         * winSize(t) === {'width':100,'height':100};
         */
        winSize:function(_target){
            var w, h;
            var target;
            if (_target) {
                target = _target.document;
            }
            else {
                target = document;
            }
            
            if(target.compatMode === "CSS1Compat") {
                w = target.documentElement[ "clientWidth" ];
                h = target.documentElement[ "clientHeight" ];
            }else if (self.innerHeight) { // all except Explorer
                if (_target) {
                    target = _target.self;
                }
                else {
                    target = self;
                }
                w = target.innerWidth;
                h = target.innerHeight;
                
            }else if (target.documentElement && target.documentElement.clientHeight) { // Explorer 6 Strict Mode
                w = target.documentElement.clientWidth;
                h = target.documentElement.clientHeight;
                    
            }else if (target.body) { // other Explorers
                w = target.body.clientWidth;
                h = target.body.clientHeight;
            }
            return {
                width: w,
                height: h
            };
        },
        // @return {Object} html element size {width, height}
        getSize:function(el){
            if (el === window) {
                return TQ.winSize();
            }

            function getStyleIntVal(el, style) {
                var val = parseInt(TQ.getStyle(el, style), 10);
                return !isNaN(val) ? val : 0;
            }

            var width, height, style = el.style;
            if (style.display == 'none') {
                style.visibility = 'hidden';
                style.display = '';
                width = el.offsetWidth;
                height = el.offsetHeight;
                style.display = 'none';
                style.visibility = 'visible';
            } else {
                width = el.offsetWidth;
                height = el.offsetHeight;
            }

            // with margins
            width += getStyleIntVal(el, 'marginLeft') + getStyleIntVal(el, 'marginRight');
            height += getStyleIntVal(el, 'marginTop') + getStyleIntVal(el, 'marginBottom');

            return {width: width, height: height};
        },
        /**
         * 遍历数组
         * @id foreach
         * @alias foreach
         * @param {Array} o
         * @param {Function} insp
            function(value,index){}
            函数到第一个值参数是数组的值，第二个参数是索引，函数如果返回false会阻断遍历，函数的返回值进入foreach的返回数组
         * @return {Array}
         * @example
         * var li1 = [1,2,3,4]
         * var li2 = $.core.arr.foreach(li1,function(v,i){return v + i});
         */
        foreach:function(o, insp){
            var arrForeach = function(o, insp){
                var r = [];
                for (var i = 0, len = o.length; i < len; i += 1) {
                    var x = insp(o[i], i);
                    if (x === false){
                        break;
                    } else if (x !== null) {
                        r[i] = x;
                    }
                }
                return r;
            };
            
            var objForeach = function(o, insp){
                var r = {};
                for (var k in o) {
                    var x = insp(o[k], k);
                    if (x === false){
                        break;
                    } else if (x !== null) {
                        r[k] = x;
                    }
                }
                return r;
            };

            if (TQ.isArray(o) || (o.length && o[0] !== undefined)) {
                return arrForeach(o, insp);
            } else if (typeof o === 'object') {
                return objForeach(o, insp);
            }
            return null;
        },
        /**
         * 获取滚动条的上下位置
         * @id scrollPos
         * @alias scrollPos
         * @param {Document} oDocument 可以指定文档，比如Ifm.docuemnt
         * @return {Object} {top:x,left:x}
         * @example
         * var scrollPos = TQ.scrollPos();
         * alert(scrollPos.top);// 距顶位置
         */
        scrollPos:function(oDocument){
            oDocument = oDocument || document;
            var dd = oDocument.documentElement;
            var db = oDocument.body;
            return {
                top: Math.max(window.pageYOffset || 0, dd.scrollTop, db.scrollTop),
                left: Math.max(window.pageXOffset || 0, dd.scrollLeft, db.scrollLeft)
            };
        },
        /**
        * events
        */
        delegatedEvent:function (actEl,expEls){
            var checkContains = function(list,el){
                for(var i = 0, len = list.length; i < len; i += 1){
                    if(TQ.contains(list[i],el)){
                        return true;
                    }
                }
                return false;
            };

            if(!TQ.isNode(actEl)){
                throw 'delegatedEvent need an Element as first Parameter';
            }

            if(!expEls){
                expEls = [];
            }

            if(TQ.isArray(expEls)){
                expEls = [expEls];
            }

            var evtList = {};
            var bindEvent = function(e){
                var evt = TQ.fixEvent(e);
                var el = evt.target;
                var type = e.type;
                doDelegated(el, type, evt);
            };

            var doDelegated = function(el, type, evt){
                var actionType = null;
                var changeTarget = function(){
                    var path, lis, tg;
                    path = el.getAttribute('action-target');
                    if(path){
                        lis = Sizzle(path, actEl);
                        if(lis.length){
                            tg = evt.target = lis[0];
                        }
                    };
                    changeTarget = TQ.empty;
                    return tg;
                };
                var checkBuble = function(){
                    var tg = changeTarget() || el;
                    if(evtList[type] && evtList[type][actionType]){
                        return evtList[type][actionType]({
                            'evt' : evt,
                            'el' : tg,
                            'box' : actEl,
                            'data' : TQ.queryToJson(tg.getAttribute('action-data') || '')
                        });
                    }else{
                        return true;
                    }
                };

                if(checkContains(expEls,el)){
                    return false;
                }else if(!TQ.contains(actEl, el)){
                    return false;
                }else{
                    while(el && el !== actEl){
                        if(el.nodeType === 1){
                            actionType = el.getAttribute('action-type');
                            if(actionType && checkBuble() === false){
                                break;
                            }
                        }
                        el = el.parentNode;
                    }
                    
                }
            };

            var that = {};
            /**
             * 添加代理事件
             * @method add
             * @param {String} funcName
             * @param {String} evtType
             * @param {Function} process
             * @return {void}
             * @example
             *      document.body.innerHTML = '<div id="outer"><a href="###" action_type="alert" action_data="test=123">test</a><div id="inner"></div></div>'
             *      var a = delegatedEvent(getEl('outer'),getEl('inner'));
             *      a.add('alert','click',function(spec){window.alert(spec.data.test)});
             *
             */
            that.add = function(funcName, evtType, process){
                if(!evtList[evtType]){
                    evtList[evtType] = {};
                    TQ.addEvent(actEl, evtType, bindEvent);
                }

                var ns = evtList[evtType];
                ns[funcName] = process;
            };
            /**
             * 移出代理事件
             * @method remove
             * @param {String} funcName
             * @param {String} evtType
             * @return {void}
             * @example
             *      document.body.innerHTML = '<div id="outer"><a href="###" action_type="alert" action_data="test=123">test</a><div id="inner"></div></div>'
             *      var a = delegatedEvent(getEl('outer'),getEl('inner'));
             *      a.add('alert','click',function(spec){window.alert(spec.data.test)});
             *      a.remove('alert','click');
             */
            that.remove = function(funcName, evtType){
                if(evtList[evtType]){
                    delete evtList[evtType][funcName];
                    if(TQ.isEmpty(evtList[evtType])){
                        delete evtList[evtType];
                        TQ.removeEvent(actEl, evtType, bindEvent);
                    }
                }
            };

            /**
             * 添加略过节点
             * @method pushExcept
             * @param {Node} el
             * @example
             * document.body.innerHTML = '<div id="outer"><a href="###" action_type="alert" action_data="test=123">test</a><div id="inner"></div></div>'
             * var a = delegatedEvent(getEl('outer'));
             * a.add('alert','click',function(spec){window.alert(spec.data.test)});
             * a.pushExcept(getEl('inner'));
             */
            that.pushExcept = function(el){
                expEls.push(el);
            };

            /**
             * 移出略过节点
             * @method removeExcept
             * @param {Node} el
             * @example
             * document.body.innerHTML = '<div id="outer"><a href="###" action_type="alert" action_data="test=123">test</a><div id="inner"></div></div>'
             * var a = delegatedEvent(getEl('outer'));
             * a.add('alert','click',function(spec){window.alert(spec.data.test)});
             * a.pushExcept(getEl('inner'));
             * a.removeExcept(getEl('inner'));
             */
            that.removeExcept = function(el){
                if(!el){
                    expEls = [];
                }else{
                    for(var i = 0, len = expEls.length; i < len; i += 1){
                        if(expEls[i] === el){
                            expEls.splice(i,1);
                        }
                    }
                }
            };
            /**
             * 晴空略过节点
             * @method clearExcept
             * @example
             * document.body.innerHTML = '<div id="outer"><a href="###" action_type="alert" action_data="test=123">test</a><div id="inner"></div></div>'
             * var a = delegatedEvent(getEl('outer'));
             * a.add('alert','click',function(spec){window.alert(spec.data.test)});
             * a.pushExcept(getEl('inner'));
             * a.clearExcept();
             */
            that.clearExcept = function(el){
                expEls = [];
            };
            /**
             * 支持外调action 非基于节点的代理事件触发
             * @method fireAction
             * @param {string} actionType
             * @param {string} evtType
             * @param {Event} [evt]
             * @param {hash} [params]
             * @example
             * document.body.innerHTML = '<div id="outer"><a href="###" action_type="alert" action_data="test=123">test</a><div id="inner"></div></div>'
             * var a = delegatedEvent(getEl('outer'));
             * a.add('alert','click',function(spec){window.alert(spec.data.test)});
             * a.fireAction('alert', 'click', null, {
             *     actionData : 'test1=1&test2=2'
             * });
             * 
             */
            that.fireAction = function(actionType, evtType, evt, params){
                var actionData = '';
                if(params && params['actionData']){
                    actionData = params['actionData'];
                }

                if(evtList[evtType] && evtList[evtType][actionType]){
                    evtList[evtType][actionType]({
                        'evt' : evt,
                        'el' : null,
                        'box' : actEl,
                        'data' : TQ.queryToJson(actionData),
                        'fireFrom' : 'fireAction'
                    });
                }
            };
            /**
             * 支持外调节点 可以将某代理事件代理区域外节点的事件转嫁到该代理事件上
             * @method fireInject
             * @param {Element} dom
             * @param {string} evtType
             * @param {Event} [evt]
             * @example
             * document.body.innerHTML = '<div id="outer"><a href="###" action_type="alert" action_data="test=123">test</a><div id="inner"></div></div><button id='inject'>click me!</button>'
             * var a = delegatedEvent(getEl('outer'));
             * a.add('alert','click',function(spec){window.alert(spec.data.test)});
             * var button = getEl('inject');
             * addEvent(button, 'click', function(evt) {
             *    a.fireInject(button, 'click', evt);
             * });
             */
            that.fireInject = function(dom, evtType, evt){
                var actionType = dom.getAttribute('action-type');
                var actionData = dom.getAttribute('action-data');
                if(actionType && evtList[evtType] && evtList[evtType][actionType]){
                    evtList[evtType][actionType]({
                        'evt' : evt,
                        'el' : dom,
                        'box' : actEl,
                        'data' : TQ.queryToJson(actionData || ''),
                        'fireFrom' : 'fireInject'
                    });
                }
            };

            /**
             * 支持节点触发 解决直接fire节点的某事件不冒泡引起代理事件不生效而添加的方法
             * @method fireDom
             * @param {Element} dom
             * @param {string} evtType
             * @param {Event} [evt]
             * @example
             * document.body.innerHTML = '<div id="outer"><a href="###" action_type="alert" action_data="test=123">test</a><div id="inner"></div></div>'
             * var a = delegatedEvent(TQ.E('outer'));
             * a.add('alert','click',function(spec){window.alert(spec.data.test)});
             * a.fireDom(a, 'click', null);
             */
            that.fireDom = function(dom, evtType, evt){
                doDelegated(dom, evtType, evt || {});
            };
            /**
             * 销毁
             * @method destroy
             */
            that.destroy = function(){
                for(var k in evtList){
                    for(var l in evtList[k]){
                        delete evtList[k][l];
                    }

                    delete evtList[k];
                    TQ.removeEvent(actEl, k, bindEvent);
                }
            };
            return that;
        },
        method:function(){
            var func = arguments[0]; 
            var args = Array.prototype.slice.call(arguments , 1);
            if (func ){
                func.apply(null,args);
            }
        },
        //json转换成&url参数
        param:function(obj){
            if (typeof obj =="string"){
                return obj;
            }else{
                var a = [];
                for (var i in obj ){
                    if (typeof obj[i] =="object"){
                        a.push(i+"="+this.param(obj[i]));
                    }else
                    a.push(i+"="+obj[i]);
                }
                return a.join("&");
            }
        },
        //字符串转换成json格式
        parseJson:function(txt){
            return  typeof txt ==="string" ? ( new Function( "return " + txt ) )() :  txt;
        },
        //*继承扩展对象*/
        extend:function(){
            var target = arguments[0]||{};
            var obj = arguments[1];
            if (typeof target == "function"){
                target = target.prototype;
            }

            if (typeof obj ==="object"){
                for (var i  in obj ){
                    target[i]=obj[i];
                }

                if (arguments.length>2){
                    arguments.callee.apply(this,[target].concat(aps.call(arguments,2)));
                }
            }
        }
    };

    window.TQ = TQ;
    //window.List = List;

    //*列表集合*/
    var List = function(){};
    List.prototype = new Array();
    List.prototype.constructor = List;

})(window);


/**
 * page Right Recommended by the media
 * @type {Object}
 * mediaRecommendData.setData('url');
 */
var mediaRecommendData = {
    setData:function(url){
        Jsonp.request(url, {
            "callback": "mediaRecommendData.createHtml",
            "t": new Date().getTime()
        });
    },
    createHtml:function(json){
        if(json && json.mediaInfos){
            var ret = json.ret;
            if ( ret == -1) Passport.login();

            if (ret == 0) {
                var mediaTemplate = TQ.getEl('#media_Recommend').innerHTML;
                var mediaData = json.mediaInfos;
                var len = mediaData.length;
                var html = [];
                var i = 0;
                var data = {};
                for (; i < len; i++) {
                    data = {
                        chlid: mediaData[i].chlid,
                        m_link: './list-user.htm?chlid='+mediaData[i].chlid,
                        m_img: mediaData[i].icon,
                        text: mediaData[i].mrk,
                        chlname: mediaData[i].chlname,
                        subFlag: mediaData[i].subFlag ? '<a href="#" class="qx_b" action-data="chlid=' + mediaData[i].chlid + '" istxt="1" action-type="unSubscribe" bosszone="subBtn2">\u53D6\u6D88</a>': '<a href="#" class="dy_b" istxt="1" action-data="chlid=' + mediaData[i].chlid + '" action-type="subscribe" bosszone="subBtn2">\u8BA2\u9605</a>',
                        recommend: mediaData[i].recommend
                    };
                    html.push(Mu.render(mediaTemplate, data));
                };

                //media Recommend Template
                TQ.getEl('div[node-type=mediaRecommend]').innerHTML = html.join('');
            } else {
                //error
            }
        }
    }
};

/**
 * To subscribe to  or  unsubscribe
 * @param  {[type]} opt [description]
 * var test = Subscribe({})
 */
var Subscribe = function(opt) {
    var opt = opt;
    this.outer = opt.outer;
    this.sub = opt.sub;
    this.unsub = opt.unsub;
    this.subClassName = opt.subClassName;
    this.unsubClassName = opt.unsubClassName;
    this.istxt = opt.istxt || true;
    this.callback = opt.callback || null;
    this.addEvent();
};
Subscribe.prototype = {
    constructor: Subscribe,
    node: null,
    isTrue: false,
    locked:false,
    addEvent: function() {
        var self = this;
        var locked = false;
        var subscrbeHandlers = {};
        function getOpts(opts) {
            var parm = {};
            parm.chlid = parseInt(opts.data.chlid, 10);
            self.node = opts.el;
            return parm;
        };

        subscrbeHandlers.subscribe = function(opts) {
            TQ.preventDefault(opts.evt);
            if (!Passport.check()) { Passport.login(); return false;}
            if (!self.locked) {
                self.locked = true;
                var istxt = parseInt(opts.el.getAttribute('istxt'),10);
                var D = getOpts(opts);
                self.isTrue = true;
                
                if(istxt != 0){
                    opts.el.className = 'loading';
                    opts.el.innerHTML = '';
                }

                Jsonp.request(Common.host + 'addSubWeb?chlid=' + D.chlid + '&callback=subscribeEvent.subscribeStatus', {
                    "t": new Date().getTime()
                });
            }
        };
        subscrbeHandlers.unSubscribe = function(opts) {
            TQ.preventDefault(opts.evt);
            if (!Passport.check()) { Passport.login(); return false;}
            if (!self.locked) {
                self.locked = true;
                var istxt = parseInt(opts.el.getAttribute('istxt'),10);
                var D = getOpts(opts);
                self.isTrue = false;

                if(istxt != 0){
                    opts.el.className = 'loading';
                    opts.el.innerHTML = '';
                }

                Jsonp.request(Common.host + 'delSubWeb?chlid=' + D.chlid + '&callback=subscribeEvent.subscribeStatus', {
                    "t": new Date().getTime()
                });
            }
        };
        
        var dEvt = TQ.delegatedEvent(self.outer);
        dEvt.add('subscribe', 'click', subscrbeHandlers.subscribe);
        dEvt.add('unSubscribe', 'click', subscrbeHandlers.unSubscribe);
    },
    subscribeStatus: function(json) {
        if(json){
            var self = this;
            var ret = json.ret;
            var el = self.node;
            var istxt = parseInt(el.getAttribute('istxt'),10);

            if (ret == 0) {
                if (self.isTrue) {
                    switch( istxt ){
                        case 0:
                            el.innerHTML = '';
                            el.className = 'fl qx_s';
                            break;
                        case 1:
                            el.innerHTML = '\u53D6\u6D88';
                            el.className = self.subClassName;
                            break;
                        case 3:
                            el.innerHTML = '\u53D6\u6D88';
                            el.className = 'qx2_b';
                            break;
                        default:
                    };
                    el.setAttribute('title','\u53D6\u6D88\u8BA2\u9605');
                    el.setAttribute('action-type', 'unSubscribe');
                } else {
                    switch( istxt ){
                        case 0:
                            el.innerHTML = '';
                            el.className = 'fl dy_s';
                            break;
                        case 1:
                            el.innerHTML = '\u8BA2\u9605';
                            el.className = self.unsubClassName;
                            break;
                        case 3:
                            el.innerHTML = '\u8BA2\u9605';
                            el.className = 'dy2_b';
                            break;
                        default:
                    };
                    el.setAttribute('title','\u8BA2\u9605');
                    el.setAttribute('action-type', 'subscribe'); 
                }

                if (self.callback && typeof self.callback == 'function') {
                    self.callback(el);
                };
            } else {
                //console.log('没有数据')
            }
        } else {
            //console.log('请求失败')
        }

        self.locked = false;
    }
};


/**
 * get location.search parameters
 * @param  {[type]} paras [description]  is string
 * getRequest('string');
 */
var getRequest = function(paras){
    var url = location.search;
    var _request = {};

    if( url.indexOf("?") != -1){
        var str = url.substr(1),
            i = 0,
            strs = str.split("&");

        for( ;i<strs.length;i+=1 ){
            _request[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1]);
        }
    }

    var value = _request[paras.toLowerCase()];
    if(typeof(value) == "undefined"){
        return "";
    } else {
        return value;
    }
};

String.prototype.encodeHTML = function() {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(this));
    return div.innerHTML.replace(/\s/g, "&nbsp;").replace(/"/g, "&quot;");
};
//获取字符长度
String.prototype.getByteLength = function() {
    return this.replace(/[^\x00-\xff]/g, "rr").length;
};
String.prototype.decodeHTML = function() {
    return this.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '\"').replace(/&#39;/g, '\'').replace(/&amp;/g, '&');
};
String.prototype.cutString = function(n, suf, encodeFlag) {
    //var r = /[^\x00-\xff]/g;
    var str = this,
    suf = suf || '';
    if ( !! encodeFlag === false) {
        str = this.decodeHTML();
        if (str.getByteLength() <= n) return str.encodeHTML();
        var m = Math.floor(n / 2);
        for (var i = m, len = str.getByteLength(); i <= len; i++) {
            if (str.substr(0, i).getByteLength() > n) {
                return (str.substr(0, i - 1) + suf).encodeHTML();
            }
        }
        return (str + suf).encodeHTML();
    } else {
        if (str.getByteLength() <= n) return str;
        var m = Math.floor(n / 2);
        for (var i = m, len = str.getByteLength(); i <= len; i++) {
            if (str.substr(0, i).getByteLength() > n) {
                return str.substr(0, i - 1) + suf;
            }
        }
        return str + suf;
    }
};
/*  |xGv00|c0e4aa3ec2134659482f3b9a36b224c2 */