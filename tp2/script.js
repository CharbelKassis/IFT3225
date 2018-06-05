
$(document).ready(initTable);
var clickListenersAlreadyAdded = false;

 /*  initialiser le tableau qui contiendra les images */
 function initTable() {
    
    var nbLignes = $("#nbLignes").val();
    var nbColonnes = $("#nbColonnes").val();
    var URL = $("#URL").val();
    
    /* charger l'image en mémoire, puis une fois chargé, commencer a construire le tableau de canvas */
    var image = _loadImage(URL);
    
    image.onload = function() { 
        
        _onImageLoad(nbLignes,nbColonnes,image); 
        
        /* ajouter les ecouteurs de cliques sur les canvas et les bouttons ainsi les touches de clavier */
        var jeu = new Jeu(nbLignes,nbColonnes);
        _addAllListeners(jeu);
        
    };
    
}

/* fonction pour extraire l'id du canvas ou du td
si type == "canvas" alors decal vaut 0 => l'id d'un canvas est de la forme "i,j" donc il ne faut pas decaler la fin pour chercher le j
si type == "td" (ou undefined), alors decal v aut 1 => l'id d'un td est de la forme "i,j!" donc il faut decaler de 1 pour chercher le j
*/
function extractPositionFromId(id,type) {
        
       var decal = (type == "canvas") ? 0 : 1; 
        
       var virgulePosition = _virgulePosition(id)
       var i = +(id.substring(0,virgulePosition));
       var j = +(id.substring(virgulePosition+1,id.length-decal));
       
       return {"i":i,"j":j};
}

/* fonction qui ajoute les listeners, voir les fonction dans listener.js */
function _addAllListeners(jeu) {
    
    if(!clickListenersAlreadyAdded) {
            
        addClickListeners();
        addKeyboardListener(jeu);
        clickListenersAlreadyAdded = true;
    }
  
    addCanvasListener(jeu);
    unbindListeners();
    addKeyboardListener(jeu);
    $("#brasser").click(function() {_shuffle(jeu)});
}

/****************************************************************************************************************************************************************************
************************************************ Les fonctions privées qui générent du code HTML et dessinent les images ****************************************************
****************************************************************************************************************************************************************************/

/* charger l'image en mémoire */

function _loadImage(URL) {

    var image = new Image();
    image.src = URL;
    return image;
  
}

/* créer le tableau de canvas */
function _onImageLoad(nbLignes,nbColonnes,image) {
        
      /* retourner le code html du tableau puis l'ajouter au body */
      var table = _tableElement(nbLignes,nbColonnes,image);
      $("body").append(table);
      
      /* dessiner les images une fois que les canvas sont créés */
      _drawImages(image,nbLignes,nbColonnes); 
      
      /* applique les changement selon la valeur du checkbox de l'affichage du numéro, voir listener.js pour cette fonction */
      checkboxChange();
}


/* generer le code html du tableau en prenant en parametre le nombre de lignes, le nombre de colonnes et l'image */ 
function _tableElement(nbLignes,nbColonnes,image) {
    
    var table = "<table>";
    
    // extraire la hauteur et la largeur de l'image
    var hauteur = image.naturalHeight;
    var largeur = image.naturalWidth;
    
    // générer les attributs "height" et "width" des canvas
    var attributeHeight = _heightAttribute(hauteur,nbLignes);
    var attributeWidth = _widthAttribute(largeur,nbColonnes);
    
    for(var i=0;i<nbLignes;i++) {
        
        table += "<tr>";
        
        for(var j=0;j<nbColonnes;j++) 
            /* création d'un canvas dont la forme de l'id est "i,j" dans un td dont l'id est de la forme "i,j!" */ 
            table += _tdCanvasElement(i,j,attributeHeight,attributeWidth);          
        
        table += "</tr>";     
    }
    table += "</table>"
    return table;
}

/* fonction qui dessine les images dans les canvas selon la position du canvas dans le tableau */ 
function _drawImages(image,nbLignes,nbColonnes) {
    
    $("canvas").each( function() {
        
       /* extraire l'id du canvas */
       var id = $(this).attr("id"); 
       
       var position = extractPositionFromId(id,"canvas");
       var i = position["i"];
       var j = position["j"];
       var context = $(this)[0].getContext("2d")
       
       /* si ce n'est pas la dernière case en bas en à droite, alors dessiner les sous-images dans les canvas */
       if( i != nbLignes-1 || j != nbColonnes-1) 
       
            _draw(context,i,j,image);

       else {
           
           context.fillStyle = "gray";
           context.fillRect(0,0,this.width,this.height);
       }
    
            
    });
}

/* la fonction qui dessine l'image dans le context graphique */
function _draw(context,i,j,image) {
    
    var canvasHeight = context.canvas.height;
    var canvasWidth = context.canvas.width;
    var sx = j*canvasWidth;
    var sy = i*canvasHeight;
    context.drawImage(image,sx,sy,canvasWidth,canvasHeight,0,0,canvasWidth,canvasHeight);

}

/******************************************************************************************************************************************************************************
***************************************************************** Les fonctions qui retournent des valeurs ********************************************************************  
******************************************************************************************************************************************************************************/

/* fonction qui génère l'attribut id du canvas */
function _id(i,j) {

   return "id='"+i+","+j+"' ";  
}

/* fonction qui génère l'attribut height du canvas */
function _heightAttribute(hauteur,nbLignes) {
    
    return "height='"+(hauteur/nbLignes)+"' ";
}

/* fonction qui génère l'attribut width du canvas */
function _widthAttribute(largeur,nbColonnes) {
    
    return "width='"+(largeur/nbColonnes)+"' ";
}

/* fonction qui génère un canvas dans un td */
function _tdCanvasElement(i,j,attributeHeight,attributeWidth) {
    
    return "<td id='"+i+","+j+"!'> <canvas " + _id(i,j) + attributeHeight + attributeWidth + "/> </td>"
}

/*  fonction qui retourne la position de la virgule dans l'id du canvas */
function _virgulePosition(id) {
  
    for(var i=0;i<id.length;i++)
    
        if(id[i] == ",")
        
            return i;
    
}

/* retourne le nombre de deplacement */
function getNbDeDeplacements() {
    
    var regex = /\d+/;
    return $("h1").text().match(regex)[0];
}

/* fonction qui extrait le nombre de deplacement, l'incrémente puis l'affiche */
function incrementerNbDeDeplacements() {
    
    var nbDeDeplacements = getNbDeDeplacements();
    $("h1").text("Deplacement: "+ ++nbDeDeplacements );
}