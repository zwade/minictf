DROP DATABASE IF EXISTS bageldb;
CREATE DATABASE bageldb;
USE bageldb;

CREATE TABLE `bagels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(20) NOT NULL,
  `description` varchar(100) NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO `bagels` (`type`, `description`) VALUES
('Everything', 'The more the merrier'),
('Everything', 'MoAR!'),
('Cheesy', '6 cheese? Nah, this is a 10 cheese bagel'),
('Garlic', 'yum'),
('Onion', 'tasty'),
('PoppySeed', 'hello'),
('PoppySeed', 'hiya'),
('SesameSeed', 'Welcome to sesame street'),
('CinnamonSugar', "Its that intense"),
('FrenchToast', 'toasty'),
('ChocolateChip', 'yummy'),
('CinnamonRaisin', 'yuck'),
('Blueberry', 'also yuck'),
('Cranberry', 'hi'),
('Spinach', 'Eat more greens!'),
('Protein', 'P R O T E I N'),
('Flag', 'CTF{h4ck_4nd_g3t_b4g3ls}');


DROP DATABASE IF EXISTS flagdb;
CREATE DATABASE flagdb;
USE flagdb;

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
