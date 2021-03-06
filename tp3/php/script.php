<?php if (isset($_GET['source'])) die(highlight_file(__FILE__, 1)); ?>

<?php

include("config.php");
include("opendb.php");

$myList = json_decode($_POST["list"]);


for($i=0;$i<count($myList);$i++)

    addToDatabase(extractElements($myList[$i]));


function extractElements($entre) {
    
    $elements = array('');
    $elementIndex = 0;
    
    
    for($i = 0 ; $i<strlen($entre)-1 ; $i++) {
    
         if($entre[$i] == "\t") {

            $elements[++$elementIndex] = '';
         }

         else {
            
            $elements[$elementIndex] .= $entre[$i];
         }

    }
    
    return $elements;

} 

function getFunction($extractedElements) {
    
    return $extractedElements[3];
}

function addToDatabase($extractedElements) {
    
    $extractedFunction = getFunction($extractedElements);
    
    switch($extractedFunction) {
        
        case "SearchDocuments": _addToDatabase("SearchDocuments",$extractedElements); break;
        case "SetDocuments": _addToDatabase("SetDocuments",$extractedElements); break;
        case "UpdateDocuments": _addToDatabase("UpdateDocuments",$extractedElements); break;
        case "GetDocuments": _addToDatabase("GetDocuments",$extractedElements); break;
        case "GetDocumentResSpace": _addToDatabase("GetDocumentResSpace",$extractedElements); break;
        default: return;
    }
}

function _addToDatabase($type,$extractedElements) {

   $date = $extractedElements[0];    
   $sessionId = $extractedElements[1];
   $user = $extractedElements[2];
   $docbase = $extractedElements[4];
   $timeElapsed = $extractedElements[5];
   $threadId = $extractedElements[6];
   $memory = $extractedElements[7];
   $element8 = $extractedElements[8];
   $element9 = $extractedElements[9];
   
   addSessionIdToDatabase($sessionId);
   addUserToDatabase($user);
 
    $result = mysql_query("INSERT INTO `$type` VALUES (\"$date\",$sessionId,\"$user\",\"$docbase\",$timeElapsed,$threadId,$memory,$element8,$element9);");
        
   if(!$result)
   
        echo("erreur mysql");

}

function addSessionIdToDatabase($sessionId) {

    $result = mysql_query("INSERT INTO `sessions` VALUES ($sessionId);");
    
   if(!$result)
   
        echo("erreur mysql");
}

function addUserToDatabase($user) {
    
    $result = mysql_query("INSERT INTO `users` VALUES (\"$user\");");
   if(!$result)
   
        echo("erreur mysql");  

}

include("closedb.php");

?>