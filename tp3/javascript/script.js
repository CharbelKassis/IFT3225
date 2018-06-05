
/* Création d'un objet FileParser, qui parsera le fichier .txt par bloque de 1 megabytes*/
var parser = new FileParser(10*megabyte,"txt","php/script.php","php/emptyDatabase.php");

/* ajouter le fichier au parseur */
function loadFile() {

    inputElement = $("input")[0];
    file = (inputElement.files)[0];
    parser.reset();
    parser.setFile(file);
    parser.setParsingFunction(findStars);
    
}

function initParse() {
    
    try{
        parser.initParse();
    }
    catch(e) {
        
        alert(e);
    }
       
}