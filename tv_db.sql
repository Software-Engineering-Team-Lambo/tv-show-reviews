
CREATE DATABASE IF NOT EXISTS tv_db;
CREATE TABLE IF NOT EXISTS tv_show(
    ID int NOT NULL AUTO_INCREMENT,
    title varchar(255),
    show_year YEAR,
    tv_desc varchar(255), --tv show description
    genre varchar(255),
    tv_cast JSON, --json array of the cast
    rating float, 
    tv_first varchar(255), --first appearance
    tv_last varchar(255), --last appearance
    images JSON, -- a json array of images assoisted to the show
    PRIMARY KEY(ID)
);

CREATE Table IF NOT EXISTS user_info(
    username varchar(225) UNIQUE,
    u_id int NOT NULL AUTO_INCREMENT,
    u_pass varchar(225), --assumed to be hashed
    PRIMARY KEY(u_id)
);

CREATE Table IF NOT EXISTS ratings(
    u_id int NOT NULL,
    show_id int NOT NULL,
    rating float NOT NULL,
    PRIMARY KEY(u_id,show_id),
    FOREIGN KEY(u_id) REFERENCES user_info(u_id),
    FOREIGN KEY(show_id) REFERENCES tv_show(ID)
);

DELIMITER $$

CREATE TRIGGER update_avg_rating_after_insert
AFTER INSERT ON ratings
FOR EACH ROW
BEGIN
    UPDATE tv_show
    SET rating = (
        SELECT AVG(r.rating)
        FROM ratings r
        WHERE r.show_id = NEW.show_id
    )
    WHERE ID = NEW.show_id;
END $$

CREATE TRIGGER update_avg_rating_after_update
AFTER UPDATE ON ratings
FOR EACH ROW
BEGIN
    UPDATE tv_show
    SET rating = (
        SELECT AVG(r.rating)
        FROM ratings r
        WHERE r.show_id = NEW.show_id
    )
    WHERE ID = NEW.show_id;
END $$

CREATE TRIGGER update_avg_rating_after_delete
AFTER DELETE ON ratings
FOR EACH ROW
BEGIN
    UPDATE tv_show
    SET rating = (
        SELECT AVG(r.rating)
        FROM ratings r
        WHERE r.show_id = OLD.show_id
    )
    WHERE ID = OLD.show_id;
END $$

DELIMITER ;




-- inserting dummy data
-- TV Shows
INSERT INTO tv_show (title, show_year, tv_desc, genre, tv_cast, tv_first, tv_last, images) VALUES
('Tron: Ares', 2025, 'A sequel to the Tron franchise featuring laser-based 3D printing and rival tech firms.', 'Sci-Fi', '["Jared Leto", "Greta Lee", "Jeff Bridges"]', '2025-10-12', '2025-10-12', '["tron_ares_1.jpg", "tron_ares_2.jpg"]'),
('Weapons', 2025, 'A suspenseful thriller about a woman uncovering dark secrets in her new home.', 'Thriller', '["Keira Knightley", "Tom Hiddleston"]', '2025-09-15', '2025-09-15', '["weapons_1.jpg", "weapons_2.jpg"]'),
('Mission: Impossible - The Final Reckoning', 2025, 'Ethan Hunt faces his most dangerous mission yet.', 'Action', '["Tom Cruise", "Rebecca Ferguson"]', '2025-07-25', '2025-07-25', '["mi_final_reckoning_1.jpg", "mi_final_reckoning_2.jpg"]'),
('Jurassic World: Rebirth', 2025, 'Dinosaurs return in a new era of adventure and chaos.', 'Adventure', '["Chris Pratt", "Bryce Dallas Howard"]',  '2025-06-20', '2025-06-20', '["jurassic_rebirth_1.jpg", "jurassic_rebirth_2.jpg"]'),
('How to Train Your Dragon (2025)', 2025, 'A live-action reimagining of the beloved animated series.', 'Family', '["Jay Baruchel", "America Ferrera"]',  '2025-05-15', '2025-05-15', '["httyd_2025_1.jpg", "httyd_2025_2.jpg"]'),
('The Fantastic Four: First Steps', 2025, 'The origin story of Marvel\'s first family.', 'Superhero', '["John Krasinski", "Emily Blunt"]',  '2025-08-01', '2025-08-01', '["fantastic_four_1.jpg", "fantastic_four_2.jpg"]'),
('F1: The Movie', 2025, 'A high-octane racing drama set in the world of Formula 1.', 'Drama', '["Brad Pitt", "Lewis Hamilton"]',  '2025-09-10', '2025-09-10', '["f1_movie_1.jpg", "f1_movie_2.jpg"]'),
('The Woman in Cabin 10', 2025, 'A journalist investigates a mysterious disappearance aboard a luxury yacht.', 'Mystery', '["Keira Knightley", "Matthew Goode"]',  '2025-08-30', '2025-08-30', '["woman_cabin_10_1.jpg", "woman_cabin_10_2.jpg"]'),
('Caramelo', 2025, 'A Brazilian drama about a young chef forming a bond with a stray dog.', 'Drama', '["Mariana Ximenes", "Lázaro Ramos"]',  '2025-07-05', '2025-07-05', '["caramelo_1.jpg", "caramelo_2.jpg"]'),
('K-Pop Demon Hunters', 2025, 'Animated film about K-pop idols who are also demon slayers.', 'Animation', '["Jisoo", "Lisa", "Rosé"]',  '2025-06-15', '2025-06-15', '["kpop_demon_1.jpg", "kpop_demon_2.jpg"]');

-- Users
INSERT INTO user_info (username, u_pass) VALUES
('john_doe', 'hashed_password_1'),
('jane_smith', 'hashed_password_2'),
('mike_jones', 'hashed_password_3'),
('emily_davis', 'hashed_password_4'),
('david_wilson', 'hashed_password_5'),
('susan_clark', 'hashed_password_6'),
('james_martin', 'hashed_password_7'),
('linda_brown', 'hashed_password_8'),
('robert_white', 'hashed_password_9'),
('mary_harris', 'hashed_password_10');

-- Ratings
INSERT INTO ratings (u_id, show_id, rating) VALUES
(1, 1, 8.0),
(1, 2, 7.5),
(1, 3, 9.0),
(1, 4, 6.8),
(1, 5, 7.2),
(2, 1, 7.5),
(2, 2, 8.0),
(2, 3, 6.5),
(2, 4, 7.0),
(2, 5, 8.2),
(3, 1, 6.9),
(3, 2, 7.8),
(3, 3, 8.5),
(3, 4, 7.1),
(3, 5, 7.3),
(4, 1, 7.6),
(4, 2, 6.8),
(4, 3, 7.9),
(4, 4, 6.5),
(4, 5, 8.0);

