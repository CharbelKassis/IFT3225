<?php if (isset($_GET['source'])) die(highlight_file(__FILE__, 1)); ?>

<?php

include("php/config.php");
include("php/opendb.php");


$tables = ["users","SearchDocuments","SetDocuments","UpdateDocuments","GetDocumentResSpace","GetDocuments"];

echo("<?xml version=\"1.0\" encoding=\"UTF-8\"?>
      <!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\"
      \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">
      
      <html xmlns=\"http://www.w3.org/1999/xhtml\">
        <head>
            <title>Rapport du TP3</title>
            <link rel=\"stylesheet\" type=\"text/css\" href=\"css/resultat.css\"/>
        </head>
    <body>");


echo("<ul>");
showResult($tables);
echo("</ul>");
echo("</body></html>");

function showResult($tables) {
    
    for($i=0;$i<count($tables);$i++) {
    
        $countResult = mysql_query("Select count(*) as total from ".$tables[$i].";");
        $fetchCount = mysql_fetch_assoc($countResult);
        $total = $fetchCount["total"];
           
        $averageTimeElapsedResult = mysql_query("Select avg(TimeElapsed) as average from ".$tables[$i].";");
        $fetchAverageTimeElapsed = mysql_fetch_assoc($averageTimeElapsedResult);
        $averageTimeElapsed = $fetchAverageTimeElapsed["average"];
        $averageTimeElapsed = round($averageTimeElapsed,2);
            
        echo("<li><h1>".$tables[$i]."</h1></li>");
        echo("<li><ul><li><span class='underline'>Count</span>: $total</li>");
        
        if($averageTimeElapsed != "")
        
            echo("<li><span class='underline'>Average Time Elapsed</span>: $averageTimeElapsed</li>");
            
        if($tables[$i] == "SearchDocuments") {
        
            $averageTimeSeekReadResult = mysql_query("Select avg(timeSeekRead) as average from SearchDocuments;");
            $fetchAverageTimeSeekRead = mysql_fetch_assoc($averageTimeSeekReadResult);
            $averageTimeSeekRead = $fetchAverageTimeSeekRead["average"];
            echo("<li><span class='underline'>Time Seek Read</span>: $averageTimeSeekRead</li>");
        
        }
      
        echo("</ul></li>");  
    
    }
 
}


include("php/closedb.php");


?>