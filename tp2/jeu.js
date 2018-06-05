function Jeu(nbLignes,nbColonnes) {
  
    this.jeuOriginal = new Array();
    this.jeu = new Array();
    this.createJeu(nbLignes,nbColonnes);
}

/* fonction qui retourne l'id du canvas vide */
Jeu.prototype.idCanvasVide = function () {
    
    return this.jeuOriginal[this.jeuOriginal.length-1][this.jeuOriginal[0].length-1];
}

/* construit la matrice du jeu original */
Jeu.prototype.createJeu = function(nbLignes,nbColonnes) {
    
    for(var i=0;i<nbLignes;i++) {
    
        this.jeuOriginal[i] = new Array(nbColonnes);
        this.jeu[i] = new Array(nbColonnes);
        
        for(var j=0;j<nbColonnes;j++) {
        
            this.jeuOriginal[i][j] = i+","+j;
            this.jeu[i][j] = i+","+j;
        }
            
    }
    
}

/* vérification de la victoire, si toutes les valeurs sont les mêmes alors la partie est terminée */
Jeu.prototype.verifierVictoire = function() {
    
    for(var i=0;i<this.jeu.length;i++)
    
        for(var j=0;j<this.jeu[i].length;j++)
        
            if(this.jeu[i][j] != this.jeuOriginal[i][j])
            
                return false;
                
     return true;
}

/* vérifier si on peut deplacer un canvas latéralement, retourne la position de la case vide si c'est possible */
Jeu.prototype.canMove = function(canvasParent) {
    
    var id = canvasParent.attr("id");
    var position = extractPositionFromId(id,"td");
    var i = position["i"];
    var j = position["j"];
    
    //extraire l'id du TD dans lequel se trouve le canvas puis passer les position a la fonction _rechercherCaseVide
    return this._rechercherCaseVide(i,j);
}

/* fonction qui cherche une case vide, retourne la position i et j si elle le trouve, retourne false sinon */
Jeu.prototype._rechercherCaseVide = function(i,j) {
    
    var idCaseVide = this.idCanvasVide();
    var test;
    
    if(test = this._testerLesCases(i+1,j,idCaseVide))
        return test;
    if(test = this._testerLesCases(i-1,j,idCaseVide))
        return test;
    if(test = this._testerLesCases(i,j+1,idCaseVide))
        return test;
    if(test = this._testerLesCases(i,j-1,idCaseVide))
        return test;    
     return false;
     
}

/* fonction qui calcule les valeurs des cases et compare leur valeur à celle de la case vide */
Jeu.prototype._testerLesCases = function(i,j,valeurCaseVide) {
     
    if(this.jeu[i] && this.jeu[i][j] && this.jeu[i][j] == valeurCaseVide)
    
        return {"i":i,"j":j};
        
    return false;
    
}

/* deplace le canvas vers la case (di,dj) */
Jeu.prototype.deplacer = function(canvas,di,dj) {
    
    /* rechercher le parent du canvas cliqué ainsi que le parent du canvas vide pour effecter la permutation */
    var idCanvas = canvas.attr("id");
    var canvasParent = canvas.parent();
    var idCanvasParent = canvasParent.attr("id");
    var idCanvasVide = this.idCanvasVide();
    var canvasVide = $("[id='"+idCanvasVide+"']");
    var positionCanvasParent = extractPositionFromId(idCanvasParent,"td");

    /* si les numéro sont affichés, les permuter aussi */
    this.swapEverything(canvasVide,canvas,positionCanvasParent["i"],positionCanvasParent["j"],di,dj)
    
}

/* fonction qui permute les numeros, les canvas et les canvas virtuels (this.jeu) */
Jeu.prototype.swapEverything = function(canvas1,canvas2,si,sj,di,dj) {
    
    swapNumero(canvas1,canvas2);
    this._swapVirtualCanvas(si,sj,di,dj);
    swap(canvas1,canvas2);
}

/* fonction qui permute les cases dans la matrice this.jeu, qui est une représentation virtuelle du jeu */
Jeu.prototype._swapVirtualCanvas = function(si,sj,di,dj) {

    var temp = this.jeu[si][sj];
    this.jeu[si][sj] = this.jeu[di][dj];
    this.jeu[di][dj] = temp;

}

/*******************************************************************************************************************************************************************
 *********************************************************** Methodes pour permuter des éléments *******************************************************************
 *******************************************************************************************************************************************************************/

/* fonction qui permute les numéros */ 
function swapNumero(canvas1,canvas2) {
    
    var checkbox = $("#afficherNumero");
    
    /* si le checkbox est checked, alors chercher les frere des canvas (les span dans lequelles est écrit le chiffre) puis les permuter */
    if(checkbox.is(':checked')) {

        var numeroDeCanvas1 = canvas1.prev();
        var numeroDeCanvas2 = canvas2.prev();
        swap(numeroDeCanvas1,numeroDeCanvas2);     
    }
     
}

/* fonction qui permute deux elements */
function swap(element1,element2) {
    
    var parentDeElement1 = element1.parent();
    var parentDeElement2 = element2.parent();

    element1 = element1.detach();
    
    element2.detach().appendTo(parentDeElement1)
    element1.appendTo(parentDeElement2);
 
}

