/*
 * FileParser: Objet servant a garder en mémoire l'état du parsing et les éléments extraits
 */

function ParsingBuffer() {
    
    this._currentElementType = null; // le type d'élément qui se fait parser (Date, SessionId, User, etc)
    this._currentFunction = null; // le type de fonction qui est en train de se faire extraire (SearchDocuments, SetDocuments, etc)
    this._isIncomplete = false; // vaut true si l'élément n'a pas été extrait complètement à cause de la fin d'un bloque de texte.
    this._textPointer = 0; // pointeur sur le texte, utilisé pour savoir où on est rendu dans le parsing
    this._elements = []; // les éléments extraits
    
}

ParsingBuffer.prototype.getCurrentFunction = function() {
    
    return this._currentFunction;
}

ParsingBuffer.prototype.setCurrentFunction = function(funct) {
    
    this._currentFunction = funct;
}

ParsingBuffer.prototype.getElements = function() {
    
    return this._elements;
}

ParsingBuffer.prototype.addElement = function(element) {
    
    this._elements.push(element);
}

ParsingBuffer.prototype.getPointer = function() {
    
    return this._textPointer;
}

ParsingBuffer.prototype.setPointer = function(pointer) {
    
    this._textPointer = pointer;
}

ParsingBuffer.prototype.getCurrentType = function() {
    
    return this._currentElementType;
}

ParsingBuffer.prototype.setCurrentType = function(element) {
    
    this._currentElementType = element;
}

ParsingBuffer.prototype.elementIsIncomplete = function() {
    
    return this._isIncomplete;
}

ParsingBuffer.prototype.setIsIncomplete = function(bool) {
    
    this._isIncomplete = bool;
}