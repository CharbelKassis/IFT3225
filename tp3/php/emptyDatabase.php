<?php if (isset($_GET['source'])) die(highlight_file(__FILE__, 1)); ?>

<?php

include("config.php");
include("opendb.php");

mysql_query("truncate SearchDocuments;");
mysql_query("truncate SetDocuments;");
mysql_query("truncate UpdateDocuments;");
mysql_query("truncate GetDocuments;");
mysql_query("truncate GetDocumentResSpace;");
mysql_query("truncate users;");
mysql_query("truncate sessions;");

include("closedb.php");

?>