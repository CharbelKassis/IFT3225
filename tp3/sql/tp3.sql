DROP DATABASE kassisch_tp3;
CREATE DATABASE kassisch_tp3;

use kassisch_tp3;

create TABLE `users` (

       `userId` VARCHAR(20),
       PRIMARY KEY (`userId`)

);

create TABLE `sessions` (

       `sessionId` INT UNSIGNED,
       PRIMARY KEY (`sessionId`)
);

create TABLE `SearchDocuments` (

       `date` DATETIME(3),
       `sessionId` INT UNSIGNED,
       `userId` VARCHAR(20),
       `docBase` VARCHAR(20),
       `timeElapsed` FLOAT UNSIGNED,
       `threadId` INT UNSIGNED,
       `memory` INT UNSIGNED,
       `rsCount` INT UNSIGNED,
       `timeSeekRead` FLOAT UNSIGNED,
       
       PRIMARY KEY (`date`,`sessionId`,`userId`,`docBase`),
       FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`sessionId`),
       FOREIGN KEY (`userId`) REFERENCES `users`(`userId`)
       
);

create TABLE `SetDocuments` (

       `date` DATETIME(3),
       `sessionId` INT UNSIGNED,
       `userId` VARCHAR(20),
       `docBase` VARCHAR(20),
       `timeElapsed` FLOAT UNSIGNED,
       `threadId` INT UNSIGNED,
       `memory` INT UNSIGNED,
       `DocCount` INT UNSIGNED,
       `TotalSize` INT UNSIGNED,
       
       PRIMARY KEY (`date`,`sessionId`,`userId`,`docBase`),
       FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`sessionId`),
       FOREIGN KEY (`userId`) REFERENCES `users`(`userId`)
);

create TABLE `UpdateDocuments` (

       `date` DATETIME(3),
       `sessionId` INT UNSIGNED,
       `userId` VARCHAR(20),
       `docBase` VARCHAR(20),
       `timeElapsed` FLOAT UNSIGNED,
       `threadId` INT UNSIGNED,
       `memory` INT UNSIGNED,
       `DocCount` INT UNSIGNED, 
       `TotalSize` INT UNSIGNED,
        
       PRIMARY KEY (`date`,`sessionId`,`userId`,`docBase`),
       FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`sessionId`),
       FOREIGN KEY (`userId`) REFERENCES `users`(`userId`)
);

create TABLE `GetDocuments` (

       `date` DATETIME(3),
       `sessionId` INT UNSIGNED,
       `userId` VARCHAR(20),
       `docBase` VARCHAR(20),
       `timeElapsed` FLOAT UNSIGNED,
       `threadId` INT UNSIGNED,
       `memory` INT UNSIGNED,
       `DocCount` INT UNSIGNED,
       `TotalSize` INT UNSIGNED,
       
       PRIMARY KEY (`date`,`sessionId`,`userId`,`docBase`),
       FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`sessionId`),
       FOREIGN KEY (`userId`) REFERENCES `users`(`userId`)

);

create TABLE `GetDocumentResSpace` (

        `date` DATETIME(3),
       `sessionId` INT UNSIGNED,
       `userId` VARCHAR(20),
       `docBase` VARCHAR(20),
       `timeElapsed` FLOAT UNSIGNED,
       `threadId` INT UNSIGNED,
       `memory` INT UNSIGNED,
       `DocCount` INT UNSIGNED,
       `TotalSize` INT UNSIGNED,
       
       PRIMARY KEY (`date`,`sessionId`,`userId`,`docBase`),
       FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`sessionId`),
       FOREIGN KEY (`userId`) REFERENCES `users`(`userId`)
       
);

