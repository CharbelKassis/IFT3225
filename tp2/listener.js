

/* fonction principale qui ajoute les événements de cliques et changements au jeu */
function addClickListeners(jeu) {
    
    /* ajouter l'événement de click sur le boutton "Afficher" */
    var afficherImages = $("#afficherImages");
    afficherImages.click(_restart);
    
    /* ajouter l'événement de click sur le checkbox d'affichage de numéro */
    var afficherNumero = $("#afficherNumero");
    afficherNumero.change(checkboxChange);
    
    /* ajouter l'événement de click sur le boutton "Brasser les tuiles" */
    var brasser = $("#brasser");
    brasser.click(function() {_shuffle(jeu)});
        
}

/* enleve les listeners pour mettre a jour l'objet jeu */
function unbindListeners () {
    
    $("#brasser").unbind("click");
    $("html").unbind("keydown");
    
}

function addCanvasListener(jeu) {
    
    var canvas = $("canvas");
    canvas.click(function() { _cliqueCanvas(jeu,this); });
}

function addKeyboardListener(jeu) {
    
    var keyCodeToVectorMap = {	
    
        38: {"i":-1 , "j":0}, /* le keyCode pour flèche haut, le vecteur de déplacement est donc (-1,0) */
        40: {"i":1 , "j":0}, /* le keyCode de flèche bas, le vecteur de déplacement est donc (1,0) */
        37: {"i":0 , "j":-1}, /* le keyCode de flèche gauche, le vecteur de déplacement est donc (0,-1) */
        39: {"i":0 , "j":1} /* le keyCode de flèche droite, le vecteur de déplacement est donc (0,1) */
    
    }
    
    $("html").keydown(function(key) {
        
        switch(key.keyCode) {
            
            case(38):
            case(40):
            case(37):
            case(39): key.preventDefault(); /* empeche le navigateur de web de déplacer la page web si on pèse sur les flèches */
                      _keyDownFunction(keyCodeToVectorMap,key.keyCode,jeu);
            default:
        }
  
    });
}

/* fonction privée pour redémarrer le jeu, est utilisée pour charger une nouvelle image ou bien refaire une partie après avoir gagner */
function _restart() {

    /* effacer l'ancien tableau de canvas, remettre à zero de nombre de déplacement puis rappeller la fonction initTable */
    $("table").remove();
    $("h1").text("Deplacement: 0");
    initTable();
    
    /* mettre ce code si on veut que le checkbox redevienne false par défaut à chaque changement d'image
    
    $("#afficherNumero").prop('checked', false); 
    
    remplacer false par true si on veut que le checkbox redevienne true par défaut */
    
}

/****************************************************************************************************************************************************************************
************************************************ Les fonctions pour l'affichage de numéro ***********************************************************************************
****************************************************************************************************************************************************************************/


/* fonction qui s'exécute lors d'un changement dans un checkbox */
function checkboxChange() {
    
    var checkbox = $("#afficherNumero");
    
    if(checkbox.is(':checked')) 
        
        $.each($("canvas"),_appendIndex);

    else
        
        $(".numero").remove();
       
}

/* fonction pour calculer les index du canvas puis les utiliser pour générer le numéro de la case */
function _appendIndex() {
   
   var id = $(this).attr("id");
   var position = extractPositionFromId(id,"canvas");
   var i = position["i"];
   var j = position["j"];
   
   var span = _spanElement(i,j);
   $(this).parent().prepend(span);
}

/* créer l'élément span qui contient le numéro du canvas */
function _spanElement(i,j) {
    
    var nbColonnes = $("#nbColonnes").val();
    var numero = nbColonnes*i+j;
    return "<span class='numero'>"+numero+"</span>";
}

/****************************************************************************************************************************************************************************
************************************************ Les fonctions privées utilisées lors de clique sur canvas ou bouttons et touche de clavier *********************************
****************************************************************************************************************************************************************************/

/* fonction de clique du canvas, cherche si il y a une case vide dans jeu, si oui alors deplacer le canvas */
function _cliqueCanvas(jeu,canvas) {
     
     /* verifie si le canvas peut se deplacer */
     var canvasParent = $(canvas).parent();
     var positionCaseVide = jeu.canMove(canvasParent);
     
     /* si oui alors effectuer le deplacement */
     if(positionCaseVide)
     
        _effectuerDeplacement($(canvas),positionCaseVide["i"],positionCaseVide["j"],jeu);
      
}

function _effectuerDeplacement(canvas,i,j,jeu) {
    
        jeu.deplacer(canvas,i,j);
        incrementerNbDeDeplacements();
        
        /* verifier la victoire à chaque déplacement */
        if(jeu.verifierVictoire())
        
           _victoire();
}

/* fonction qui s'exécute lorsqu'on on a pesé sur les touches flèches du clavier */
function _keyDownFunction(map,keyCode,jeu) {
    
    /* extraire le vecteur de deplacement */
    var vecteur = map[keyCode];
    var i = vecteur["i"];
    var j = vecteur["j"];
    
    /* rechercher le parent (l'élément td) du canavs, puis rechercher le td latéral avec le vecteur de déplacement */
    var idCanvasVide = jeu.idCanvasVide();
    var parentDuCanvasVide = $("[id='"+idCanvasVide+"']").parent();
    var idParentDuCanvasVide = parentDuCanvasVide.attr("id");
    var position = extractPositionFromId(idParentDuCanvasVide,"td");
    var tdLateralAuCanvasVide = $(_getTdLateralSelector(vecteur,position));
    var canvas = tdLateralAuCanvasVide.find("canvas");
    
    /* si l'id existe bien (donc il n'y a pas eu de débordement en calculant la position du canvas) */
    if(tdLateralAuCanvasVide[0])
    
        _effectuerDeplacement(canvas,position["i"],position["j"],jeu);
    
}


/* fonction qui retourne l'id d'un td latéral avec la position de la case vide et le vecteur de déplacement */
function _getTdLateralSelector(vecteur,position) {
    
    var i = position["i"];
    var j = position["j"];
    var directionI = -vecteur["i"];
    var directionJ = -vecteur["j"];
    
    return "[id='"+(i+directionI)+","+(j+directionJ)+"!']";
}

/* fonction qui s'exécute lors d'une victoire */
function _victoire() {

    var rejouer = confirm("Victoire! vous avez gagner en utilisant "+getNbDeDeplacements()+" déplacements.\nVoulez vous rejouer?");
    
    if(rejouer)
    
        _restart();
        
     $("table").remove();
    
    
}

/* fonction pour brasser les tuiles */
function _shuffle(jeu) {
    
    var nbLignes = $("#nbLignes").val();
    var nbColonnes = $("#nbColonnes").val();
        
    $.each($("canvas"),function() {
        
        var randomI = Math.floor(Math.random()*nbLignes);
        var randomJ = Math.floor(Math.random()*nbColonnes);
        var canvasDestination = $("[id='"+randomI+","+randomJ+"']");
        var canvasSourceParent = $(this).parent();
        var canvasDestinationParent = canvasDestination.parent();
        var sourceParentPosition = extractPositionFromId(canvasSourceParent.attr("id"),"td");
        var destinationParentPosition = extractPositionFromId(canvasDestinationParent.attr("id"),"td");
        jeu.swapEverything(canvasDestination,$(this),sourceParentPosition["i"],sourceParentPosition["j"],destinationParentPosition["i"],destinationParentPosition["j"]);
    });
}