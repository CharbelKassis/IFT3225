var kilobyte = 1024;
var megabyte = kilobyte*1000;


/*
 * FileParser: Objet servant a parser de gros fichiers
 * sizeOfBlock: La taille de chaque bloque du fichier que le parseur va lire
 * type: le type du fichier que ce parseur doit lire
 * server: le lien vers le script coté serveur
 * emptyDatabase: le lien vers le script qui efface la base de donnée
 */
function FileParser(sizeOfBlock,type,server,emptyDatabase) {
    
    this._type = type;
    this._sizeOfBlock = sizeOfBlock;
    this._currentBlock = 1;
    this._currentReadingBytePosition = 0;
    this._parsingBuffer = null;
    this._currentParsedString = null;
    this.parsingFunction = null;
    this._file = null;
    this._outputList = [];
    this._server = server;
    this._emptyDatabase = emptyDatabase;
    
    /* pour la fonction sendToServer */
    this._newConnectionToServer = true;
    this._nbOfLineAddingToDb = 0;
}

FileParser.prototype.sendToServer = function() {
    
    var nbAjaxCalls = +($("#totalAjaxCalls").text());
    $("#totalAjaxCalls").text(++nbAjaxCalls);
    _updateAjaxCallsPourcentage();
    
    var stringifiedList = JSON.stringify(this._outputList);
    var size = this._outputList.length;
    this._nbOfLineAddingToDb = size;
    
    if(this._newConnectionToServer) {
    
        $("#nbOfLine").text(size);
        this._newConnectionToServer = false;    
    }
    
    this._ajaxCall(stringifiedList,size);
  
    this._outputList = [];

}

FileParser.prototype.addToOutput = function(line) {
    
    this._outputList.push(line);
}

FileParser.prototype.setParsingBuffer = function(buffer) {
    
    this._parsingBuffer = buffer;
}

FileParser.prototype.getParsingBuffer = function() {
    
    return this._parsingBuffer;
}

FileParser.prototype.setCurrentParsedString = function(string) {
    
    this._currentParsedString = string;
}

FileParser.prototype.getCurrentParsedString = function() {
    
    return this._currentParsedString
}

FileParser.prototype.setParsingFunction = function(parsingFunction) {
    
    this.parsingFunction = parsingFunction;
}

FileParser.prototype.getFileSize = function() {
    
    return this._file.size;
}

FileParser.prototype.getCurrentReadingBytePosition = function() {
    
    return this._currentReadingBytePosition;
}

FileParser.prototype.getSizeOfBlock = function() {
    
    return this._sizeOfBlock;
}

FileParser.prototype.getCurrentBlock = function() {
    
    return this._currentBlock;
}

FileParser.prototype.setCurrentBlock = function(block) {
    
    this._currentBlock = block;
}

FileParser.prototype.setCurrentReadingBytePosition = function(position) {
    
    this._currentReadingBytePosition = position;
}

FileParser.prototype.getNumberOfFileBlocks = function() {
    
    var modulo = this.getFileSize() % this._sizeOfBlock;
    
    var numberOfFileBlocks = this.getFileSize() / this._sizeOfBlock;
    
    if(modulo != 0)
    
        numberOfFileBlocks = Math.ceil(numberOfFileBlocks);

    return numberOfFileBlocks;
}

FileParser.prototype.setFile = function(file) {
    
    this._file = file;
    $("#totalBlock").text(this.getNumberOfFileBlocks());
}

/* fonction appelée lorsqu'on demande d'initialiser le parsing. Lance une exception si aucun fichier est chargé ou bien l'extension du fichier n'est pas la même que celui
   spécifier au parseur */
FileParser.prototype.initParse = function() {
    
    if(!this._file)
    
        throw new NoFileLoadedException();
        
    this._verifyExtension();
    
    this._emptyDatabaseFunction();
    $("#status").text("Working");
    $("#status").css("color","green");    
    this._parseFile(this.currentReadingBytePosition,this._sizeOfBlock);

}

FileParser.prototype.getFileName = function() {
    
    return this._file? this._file.name : null;
}

/* commencer le parsing du fichier, crée des bloques de this._sizeOfBlock octets puis les lis. la fonction s'appelle récursivement après l'appelle de la fonction readFileBlockThenParseNext */
FileParser.prototype._parseFile = function(begin,end) {
    
   if(end > this.getFileSize()) {

       this.reset();
                    
   }

   else {    
            
        var fileReader = new FileReader();
        var fileBlock = this._file.slice(begin,end);
        var self = this;
        fileReader.onload = function(event) { _readFileBlockThenParseNext(event,self); };
        fileReader.readAsText(fileBlock);
   }

}

/* Verifie si l'extension du fichier est la meme que this._type */
FileParser.prototype._verifyExtension = function() {
    
    var fileName = this.getFileName();
    var fileExtension = fileName.substring(fileName.lastIndexOf('.')+1);
    
    if(fileExtension != this._type)
    
        throw new WrongFileExtensionException(this._type,fileExtension);

}

/* remet a 0 le pointeur de parseur dans le text */
FileParser.prototype.reset = function() {
    
    this._currentBlock = 1;
    this._currentReadingBytePosition = 0;
    this._parsingBuffer = null;
    this._currentParsedString = null;
    this.parsingFunction = null;
    this._file = null;
    this._outputList = [];
    
}

/* retourne la condition d'arrêt pour l'extraction d'un élément */
FileParser.prototype.getEndingCondition = function() {
    
    var textBlock = this._currentParsedString;
    
    if(this._parsingBuffer.getCurrentFunction() == "GetDocumentResSpace" && this._parsingBuffer.getCurrentType() == "TotalSize") {
    
        return function(i) {return (textBlock.charAt(i) == "\n" || textBlock.charAt(i) == "\r");};

    }        
            
     return function(i) {return (textBlock.charAt(i) == "\t");};   

}

FileParser.prototype._ajaxCall = function(stringifiedList,size) {
    
    var self=this;
    
    $.ajax({
        
        type: "POST",
        url: this._server,
        data: {'list' : stringifiedList },
        error: function(data) {console.log(data);}
    })
    
    .done(function(){
        
        $("#status").text("Working");
        $("#status").css("color","green");    
        
        var nbTotalSuccess = +($("#totalSuccessfulAjax").text());     
        $("#totalSuccessfulAjax").text(++nbTotalSuccess);
        _updateAjaxCallsPourcentage();
        
        if($("#ajaxPourcentage").text() == "100") {
        
            $("#status").text("Finished Working");
            $("#status").css("color","red");   
            
        }
        
        $("#nbOfLine").text(self._nbOfLineAddingToDb);
        
    });
    
}

FileParser.prototype._emptyDatabaseFunction = function() {
    
    $.ajax({
         type: "GET",
         url: this._emptyDatabase
         });
         
}

/* lis le bloque courant puis demande de parsyer le prochain bloque du fichier */
function _readFileBlockThenParseNext(event,parser) {
    
    /* Calculer la position du prochain bloque à lire */
    parser.setCurrentBlock(parser.getCurrentBlock()+1);
    var begin = parser.getCurrentReadingBytePosition()+parser.getSizeOfBlock();
    var end = begin+parser.getSizeOfBlock();
    parser.setCurrentReadingBytePosition(begin);

    /* Affichage de l'état du parsing*/
    $("#parsedBlock").text(parser.getCurrentBlock());
    var pourcentage = Math.floor( (parser.getCurrentBlock()/parser.getNumberOfFileBlocks() )* 100);
    $("#pourcentage").text(pourcentage);
    
    /* Extraire les éléments du bloque de texte avec la fonction de parsing */
    parser.setCurrentParsedString(event.target.result);
    parser.parsingFunction(parser);
    
    /* Appel recursif pour parcher le prochain bloque de texte */
    parser._parseFile(begin,end);
   
}

function _updateAjaxCallsPourcentage() {
    
    var nbOfSuccess =  +($("#totalSuccessfulAjax").text());
    var totalAjaxCalls = +($("#totalAjaxCalls").text());
    var pourcentage = Math.floor( (nbOfSuccess/totalAjaxCalls) * 100);
    
    $("#ajaxPourcentage").text(pourcentage);

}
