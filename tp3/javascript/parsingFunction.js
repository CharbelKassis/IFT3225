/************************************************************ Constantes utilisées pour rendre le code plus lisible **********************************************************************************/

const DATE = 0;
const SESSION_ID = 1;
const USER = 2;
const FUNCTION = 3;
const DOC_BASE = 4;
const TIME_ELAPSED = 5;
const THREAD_ID = 6;
const MEMORY = 7;
const DOC_COUNT = 8;
const TOTAL_SIZE = 9;
const RS_COUNT = 10;
const TIME_SEEK_READ = 11;
const GET_FLAG = 12;
const GET_DOCUMENT_RES_SPACE = 13;
const SKIP_GET_FLAG = 14;
const SKIP_INTERNAL_CALL = 15;
const SKIP_TO_EXT_DOCS = 16;
const SKIP_CORBA_ALLOC = 17;

/* La première fonction de parsing, est utilisé avant de débuter la vraie fonction. On cherche les étoiles puis on coupe la partie supérieure. S'il n'y a pas d'étoiles, 
on suppose que le format du fichier text n'est par valide et la fonction lance une exception */

function findStars(parser) {
    
    var string = parser.getCurrentParsedString();
    var stars = /\*{70}/;
    var starsPosition = string.search(stars);
    
    if(starsPosition == -1)
    
        throw new WrongFileFormatException("**********************************************************************");
     
     string = string.substring(starsPosition+70,string.length-1);
     string = _removeSpaces(string);
     parser.setCurrentParsedString(string);
     
     /* une fois apres avoir trouver la position des etoiles, modifier la fonction de parsing de l'objet FileParser*/
     parser.setParsingFunction(extractElementsFromText)
     parser.setParsingBuffer(new ParsingBuffer());
     parser.getParsingBuffer().setCurrentType("Date");
     extractElementsFromText(parser)
       
}

/* la deuxième et vraie fonction de parsing. Tant que le pointeur n'est pas à zero (sauf au tout début), on continue à extraire ( _extract(parser) ) les éléments. */
function extractElementsFromText(parser) {
    
    /* extraire les éléments tant qu'on est dans le bloque de text */
    
    do{
        _extract(parser)
    }
    while(parser.getParsingBuffer().getPointer() != 0)
    
    parser.sendToServer();
    
}

/* Dependement du type qui est entrain de se faire extraire, faire appel à une fonction d'extraction, sortir du switch si l'élément courrant n'a pas été complètement extrait à
cause de la fin du bloque de text à fin de le compléter au prochain appel de la fonction _extract(parser) */
function _extract(parser) {
    
    var buffer = parser.getParsingBuffer();
    var currentType = buffer.getCurrentType(); 
    
    switch(currentType) {
            
            /* la partie commune à toutes les fonctions */
            case "Date": _extractDate(parser); if(buffer.elementIsIncomplete()) break;
            case "SessionId": _extractSessionId(parser); if(buffer.elementIsIncomplete()) break;
            case "User": _extractUser(parser); if(buffer.elementIsIncomplete()) break;
            case "Function": _extractFonction(parser); if(buffer.elementIsIncomplete()) break;
            case "Docbase": if(currentType == "Date") break; else _extractDocbase(parser); if(buffer.elementIsIncomplete()) break;
            case "TimeElapsed": _extractTimeElapsed(parser); if(buffer.elementIsIncomplete()) break;
            case "ThreadId": _extractThreadId(parser); if(buffer.elementIsIncomplete()) break;
            case "Memory": _extractMemory(parser);break;
            
            /* SetDocuments, UpdateDocuments, GetDocuments et GetDocumentResSpace */
            case "DocCount": _extractDocCount(parser); if(buffer.elementIsIncomplete()) break;
            case "TotalSize": _extractTotalSize(parser); if(buffer.elementIsIncomplete()) break;
                               _addToList(parser);
                               _skipToNextLine(parser);break;
            
            /* SearchDocuments */
            case "RSCount": _extractRSCount(parser); if(buffer.elementIsIncomplete()) break;
            case "TimeSeekRead": _extractTimeSeekRead(parser); if(buffer.elementIsIncomplete()) break;
                                 _addToList(parser);
                                 _skipToNextLine(parser);break;
            
            /* GetDocuments */
           case "SkipCorbaAlloc": _skipCorbaAlloc(parser); break;
                             
           /* GetDocumentResSpace et GetDocuments; */
           case "SkipGetFlag": _skipGetFlag(parser); if(buffer.elementIsIncomplete()) break;
           case "SkipInternalCall": _skipInternalCall(parser); if(buffer.elementIsIncomplete()) break;
           case "SkipToExtDocs": _skipToExtDocs(parser); if(buffer.elementIsIncomplete()) break;
           
        }
}

/* fonction de débuggage, extraire une ligne du fichier log une fois que son parsing est terminée puis l'afficher dans la console du navigateur */
function _printLine(parser) {
    
    var elements = parser.getParsingBuffer().getElements();
    var toPrint = new StringBuilder();
    
    for(var i=elements.length-10;i<elements.length;i++)
        
       toPrint.append(elements[i].toString()+"\t");
        
    return toPrint.toString();
        
}

function _addToList(parser) {
       
    var line = _printLine(parser);
    
    parser.addToOutput(line);
    
    parser.getParsingBuffer().getParsingBuffer = [];
    
}

/* sert à enlever les espaces après les étoiles */
function _removeSpaces (string) {

    var i;
    
    for(i=0;i<string.length;i++)
    
        if(string.charAt(i) != "\n" && string.charAt(i) != "\r")
        
            return string.substring(i,string.length-1);
            
     return string; // ne devrait jamais arrivé, mais au cas où.
}


/* remet a 0 l'état du parsing d'un fichier dans la page html */
function _resetParsingState() {
    
   $("#parsedBlock").text("0");
   $("#pourcentage").text("0");
}

/********************************************************************************* Extract functions *********************************************************************************/

/* Retourne le nom du prochain élément à extraire */
function _getNext(element,isCommon,parser) {
    
    return isCommon ? _getCommonNext(element) : _getSpecificNext(element,parser);
}

/* retourner le nom du prochain élément qui est commun à toutes les fonction à extraire */
function _getCommonNext(element) {
    
    var next;
    
    switch(element) {
        
        case DATE: next = "SessionId"; break;
        case SESSION_ID: next = "User"; break;
        case USER: next = "Function"; break;
        case FUNCTION: next = "Docbase"; break;
        case DOC_BASE: next = "TimeElapsed"; break;
        case TIME_ELAPSED: next = "ThreadId"; break;
        case THREAD_ID: next = "Memory"; break;
        
    }
    
    return next;
}

/* Retourne le nom du prochain élément spécifique à une fonction après avoir extrait l'élément "Memory" */
function _getSpecificNext(element,parser) {
    
    var buffer = parser.getParsingBuffer();
    var funct = buffer.getCurrentFunction();
    var next;
    
    switch(funct) {
        
        case "SetDocuments": 
        case "UpdateDocuments": next = _getNextUpdateDocuments(element); break;
        case "SearchDocuments": next = _getNextSearchDocuments(element); break;
        case "GetDocuments": next = _getNextGetDocuments(element); break;
        case "GetDocumentResSpace": next = _getNextGetDocumentResSpace(element); break;

    }
    
    return next;
}

/* Retourne le prochain élément pour la fonction UpdateDocuments */
function _getNextUpdateDocuments(element) {
    
    var next;
    
    switch(element) {
        
        case MEMORY: next = "DocCount";break;
        case DOC_COUNT: next = "TotalSize";break;
        case TOTAL_SIZE: next = "Date";break;
    }
    
    return next;
}

/* Retourne le prochain élément pour la fonction SearchDocuments */
function _getNextSearchDocuments(element) {
    
    var next;
    
    switch(element) {
        
        case MEMORY: next = "RSCount";break;
        case RS_COUNT: next = "TimeSeekRead"; break;
        case TIME_SEEK_READ: next = "Date";break;
    }
    
    return next;
}

/* Retourne le prochain élément pour la fonction GetDocument*/
function _getNextGetDocuments(element) {
    
    var next;
    
    switch(element) {
        
        case MEMORY: next = "SkipGetFlag"; break;
        case SKIP_GET_FLAG: next = "SkipInternalCall"; break;
        case SKIP_INTERNAL_CALL: next = "SkipToExtDocs"; break;
        case SKIP_TO_EXT_DOCS: next = "SkipCorbaAlloc"; break;
        case SKIP_CORBA_ALLOC: next = "DocCount"; break;
        case DOC_COUNT: next = "TotalSize"; break;
        case TOTAL_SIZE: next = "Date"; break; 
    }
    
    return next;
}

/* Retourne le prochain élément pour la fonction GetDocument*/
function _getNextGetDocumentResSpace(element) {
    
    var next;
    
    switch(element) {
        
        case MEMORY: next = "SkipGetFlag"; break;
        case SKIP_GET_FLAG: next = "SkipInternalCall"; break;
        case SKIP_INTERNAL_CALL: next = "SkipToExtDocs"; break;
        case SKIP_TO_EXT_DOCS: next = "DocCount"; break;
        case DOC_COUNT: next = "TotalSize"; break;
        case TOTAL_SIZE: next = "Date"; break;
    }
    
    return next;
}

/* Retourne true si la fonction est à extraire, retourne false sinon */
function _functionIsNeededForExtraction(funct) {
    
    switch(funct) {
        
        case "SetDocuments": 
        case "UpdateDocuments":
        case "SearchDocuments": 
        //case "GetDocuments":
        case "GetDocumentResSpace":return true;
        default: return false;
    }
}

/****************************************************** Fonctions pour rendre le code plus visible *****************************************************************/
function _extractDate(parser) {
    
    _extractElement(parser,DATE,true);

}

function _extractSessionId(parser) {
    
    _extractElement(parser,SESSION_ID,true);

}

function  _extractUser(parser) {
    
    _extractElement(parser,USER,true);

}

function _extractFonction(parser) {
    
    var funct = _extractElement(parser,FUNCTION,true).toString();
    var buffer = parser.getParsingBuffer();
    var elements = buffer.getElements();
    
    /* si le nom de la fonction a été complètement extrait */
    if(!buffer.elementIsIncomplete()) { 
        
        /* si la fonction n'est pas à extraire du fichier .txt alors, remettre le type à rechercher à "Date", enlever les 4 éléments déjà extrait (Date, SessionId, User, Fonction) puis
        aller directement à la prochaine ligne pour la parser */
        if(!_functionIsNeededForExtraction(funct)) {
        
            parser.getParsingBuffer().setCurrentType("Date");  
            elements.pop();elements.pop();elements.pop();elements.pop();
             _skipToNextLine(parser);

        }
        
        /* Sinon, si la fonction est bien à extraire alors mettre son nom dans l'objet Buffer pour s'en servir plus tard pour extraire les éléments spécifiques à cette fonction */
        else
        
            buffer.setCurrentFunction(funct);
   
    }

}



function _extractDocbase(parser) {
    
    _extractElement(parser,DOC_BASE,true);
}

function _extractTimeElapsed(parser) {
    
    _extractElement(parser,TIME_ELAPSED,true);

}

function _extractThreadId(parser) {
    
    _extractElement(parser,THREAD_ID,true);

}

function _extractMemory(parser) {
    
    _extractElement(parser,MEMORY,false);

}

function  _extractDocCount(parser) {
    
    _extractElement(parser,DOC_COUNT,false);
}

function _extractTotalSize(parser) {
    
    _extractElement(parser,TOTAL_SIZE,false);
}

function _extractRSCount(parser) {
    
    _extractElement(parser,RS_COUNT,false);
}

function _extractTimeSeekRead(parser) {
    
    _extractElement(parser,TIME_SEEK_READ,false);
}

function _extractInternalCall(parser) {
    
    _extractElement(parser,INTERNAL_CALL,false);
}

function  _skipGetFlag(parser) {
    
    _skipElement(SKIP_GET_FLAG,parser);
}

function _skipInternalCall(parser) {
    
    _skipElement(SKIP_INTERNAL_CALL,parser);
}

function _skipToExtDocs(parser) {
    
    _skipElement(SKIP_TO_EXT_DOCS,parser);
}

function  _skipCorbaAlloc(parser) {
    
    _skipElement(SKIP_CORBA_ALLOC,parser);
}


/*******************************************************************************************************************************************************************/

/* fonction pour extraire un élément du text */
function _extractElement(parser,element,isCommon) {
    
    var buffer = parser.getParsingBuffer();
    var incomplete = buffer.elementIsIncomplete();
    
    /* si l'élément n'a pas été complètement extrait, alors l'extraire complètement du bloque de text suvivant */
    if(incomplete) {

       return _completeElement(parser,element,isCommon);
          
    }
    
    /* sinon ajouter le nouveau élément au stringBuilder */
    else
    
       return _findElement(parser,element,isCommon);

}

/* fonction pour sauter une partie spécifique indiqué par la fonction de condition */
function _skip(parser,condition) {
    
    
    var buffer = parser.getParsingBuffer();
    var textBlock = parser.getCurrentParsedString(); 
    var elements = buffer.getElements();
    var pointer = buffer.getPointer();
    buffer.setIsIncomplete(true);
    
    for(var i=pointer;i<textBlock.length;i++) {
        
        var charact = parser.getCurrentParsedString()[i];
        
        if( condition(i) ) {
     
           buffer.setIsIncomplete(false);
           break;
        }
    }
    _updatePointer(parser,i);
    
}

/* fonction pour aller directement à la prochaine ligne */
function _skipToNextLine(parser) {
        
    function condition(i) { return (parser.getCurrentParsedString()[i] == "\n" || parser.getCurrentParsedString()[i] == "\r") }

    _skip(parser,condition);
  
}

/* fonction pour sauter au prochain élément de la même ligne */
function _skipToNextElement(parser) {
    
    function condition(i) { return parser.getCurrentParsedString()[i] == "\t"}
    
    _skip(parser,condition);
}

function _skipElement(element,parser) {
        
     _skipToNextElement(parser);
    
    if(!parser.getParsingBuffer().elementIsIncomplete()) {
       
       var buffer = parser.getParsingBuffer();
       var next = _getNext(element,false,parser);
       buffer.setCurrentType(next);
            
    }
        
    
}

/* recherche et extrait l'élément (si possible complètement) puis l'ajoute dans un stringBuilder */
function _findElement(parser,element,isCommon) {
        
    var buffer = parser.getParsingBuffer();
    var stringBuilder = new StringBuilder();
    var textBlock = parser.getCurrentParsedString();
    buffer.addElement(stringBuilder);
    var pointer = buffer.getPointer();
    var i;
    buffer.setIsIncomplete(true);
    
    
    for(i=pointer;i<textBlock.length;i++) {
        
        if(parser.getEndingCondition()(i)) {
            
            var next = _getNext(element,isCommon,parser);
            buffer.setIsIncomplete(false);
            buffer.setCurrentType(next);
            break;
        }    
        var charact = textBlock.charAt(i)
        stringBuilder.append(charact);
        
    }

    _updatePointer(parser,i);
    return stringBuilder; // utile pour chercher la fonction
    

}

/* Duplication de code (à modifier plus tard si le temps) , sert à completer l'élément extrait si une partie existe sur le prochain bloque de texte */
function _completeElement(parser,element,isCommon) {
    
    var buffer = parser.getParsingBuffer();
    var textBlock = parser.getCurrentParsedString();
    var elements = buffer.getElements();
    var stringBuilder = elements[elements.length-1];
    var pointer = buffer.getPointer();
       
    for(i=pointer;i<textBlock.length;i++) {
        
         if(parser.getEndingCondition()(i)) {
            
            var next = _getNext(element,isCommon,parser);
            buffer.setIsIncomplete(false);
            buffer.setCurrentType(next);
            break;
        }
        
        var charact = textBlock.charAt(i);
        stringBuilder.append(charact);
        
    }
    
    _updatePointer(parser,i);
    
    return stringBuilder; // utile pour chercher la fonction
   
    
}

/* mettre à jour le pointeur sur le bloque de texte */
function _updatePointer(parser,i,increm) {
    
    var buffer = parser.getParsingBuffer();
    increm = increm ? increm : 1;
    
    if(buffer.elementIsIncomplete() )
    
        buffer.setPointer(0); 
        
    else
    
        buffer.setPointer(i+increm);
        
    
}


