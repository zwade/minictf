CREATE TABLE `flagsafe` (
  `id` int NOT NULL AUTO_INCREMENT,
  `word1` varchar(20) NOT NULL,
  `word2` varchar(20) NOT NULL,
  `word3` varchar(20) NOT NULL,
  `flag` varchar(100) NOT NULl,
  PRIMARY KEY (id)
);

INSERT INTO `flagsafe` (`word1`,`word2`,`word3`,`flag`) VALUES
('crusade','round','mountain','CTF{y0u_br0ke_into_the_v4ult}');