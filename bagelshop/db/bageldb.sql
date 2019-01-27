CREATE TABLE `bagels` (
  /*`id` int(11) NOT NULL,*/
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(20) NOT NULL,
  `description` varchar(100) NOT NULL,
  PRIMARY KEY (id)
);

/*INSERT INTO `bagels` (`id`, `type`, `description`) VALUES
(1, 'everything', 'all the things'),
(2, 'excellent', 'blah'),
(3, 'wow', 'cool');*/

INSERT INTO `bagels` (`type`, `description`) VALUES
('Everything', 'The more the merrier'),
('Everything', 'MoAR!'),
('Cheesy', '6 cheese? Nah, this is a 10 cheese bagel'),
('Garlic', ''),
('Onion', ''),
('PoppySeed', ''),
('PoppySeed', ''),
('SesameSeed', 'Welcome to sesame street'),
('CinnamonSugar', ''),
('FrenchToast', ''),
('ChocolateChip', ''),
('CinnamonRaisin', ''),
('Blueberry', ''),
('Cranberry', ''),
('Spinach', 'Eat more greens!'),
('Protein', 'P R O T E I N'),
('Flag', 'flag{h4ck_4nd_g3t_b4g3ls}');
