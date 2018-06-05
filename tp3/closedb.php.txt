<?php if (isset($_GET['source'])) die(highlight_file(__FILE__, 1)); ?>

<?php

mysql_close($connection) or die("Probleme lors de la fermeture de la connection ". msql_error());
?>