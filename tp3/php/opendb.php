<?php if (isset($_GET['source'])) die(highlight_file(__FILE__, 1)); ?>

<?php

$connection = mysql_connect( $db_host, $db_user, $db_password);

if (!$connection) {
    
    echo("Erreur de connection a la DB");   
    die("probleme de connection ". mysql_error());
  
 }

mysql_select_db($db_name) or die("probleme de selection " . mysql_error());



?>