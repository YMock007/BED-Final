const pool = require("../services/db");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const callback = (error, results, fields) => {
  if (error) {
    console.error("Error creating tables:", error);
  } else {
    console.log("Tables created successfully");
  }
  process.exit();
}

bcrypt.hash('1234', saltRounds, (error, hash) => {
  if (error) {
    console.error("Error hashing password:", error);
  } else {
    console.log("Hashed password:", hash);


    const SQLSTATEMENT = `
    -- Drop tables
    
    
    DROP TABLE IF EXISTS post_comments;
    DROP TABLE IF EXISTS newsfeed;
    DROP TABLE IF EXISTS trade;
    DROP TABLE IF EXISTS character_duel;
    DROP TABLE IF EXISTS quest;
    DROP TABLE IF EXISTS library;
    DROP TABLE IF EXISTS arsenal;
    DROP TABLE IF EXISTS skills;
    DROP TABLE IF EXISTS equipments;
    DROP TABLE IF EXISTS character_status;
    DROP TABLE IF EXISTS usersWallet;
    DROP TABLE IF EXISTS taskProgress;
    DROP TABLE IF EXISTS task;
    DROP TABLE IF EXISTS user;
    
    -- Create tables
    CREATE TABLE user (
      user_id INT PRIMARY KEY AUTO_INCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(255) DEFAULT 'user',
      created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE task (
      task_id INT PRIMARY KEY AUTO_INCREMENT,
      title TEXT,
      description TEXT,
      points INT
    );
    
    CREATE TABLE taskProgress (
      progress_id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      task_id INT NOT NULL,
      completion_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      notes TEXT
    );
    
    CREATE TABLE usersWallet (
      wallet_id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      points_balance INT DEFAULT 0
    );
    
    CREATE TABLE character_status (
      character_id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      sect VARCHAR(255) NOT NULL,
      character_name VARCHAR(255) NOT NULL,
      hp INT NOT NULL DEFAULT 0,
      atk INT NOT NULL DEFAULT 0,
      def INT NOT NULL DEFAULT 0,
      skill TEXT,
      equipment TEXT
    );
    
    CREATE TABLE equipments (
      equipment_id INT PRIMARY KEY AUTO_INCREMENT,
      equipment_name VARCHAR(255) NOT NULL,
      profession VARCHAR(255) NOT NULL,
      character_id INT NOT NULL,
      hp INT NOT NULL DEFAULT 0,
      atk INT NOT NULL DEFAULT 0,
      def INT NOT NULL DEFAULT 0,
      points_worth INT NOT NULL DEFAULT 0
    );
    
    CREATE TABLE skills (
      skill_id INT PRIMARY KEY AUTO_INCREMENT,
      skill_name VARCHAR(255) NOT NULL,
      profession VARCHAR(255) NOT NULL,
      character_id INT NOT NULL,
      hp INT NOT NULL DEFAULT 0,
      atk INT NOT NULL DEFAULT 0, 
      def INT NOT NULL DEFAULT 0,
      points_worth INT NOT NULL DEFAULT 0
    );
    
    CREATE TABLE arsenal (
      arsenal_id INT PRIMARY KEY AUTO_INCREMENT,
      profession VARCHAR(255) NOT NULL,
      equipment_name VARCHAR(255) NOT NULL,
      hp INT NOT NULL DEFAULT 0,
      atk INT NOT NULL DEFAULT 0,
      def INT NOT NULL DEFAULT 0,
      points_worth INT NOT NULL DEFAULT 0
    );
    
    CREATE TABLE library (
      library_id INT PRIMARY KEY AUTO_INCREMENT,
      profession VARCHAR(255) NOT NULL,
      skill_name VARCHAR(255) NOT NULL,
      hp INT NOT NULL DEFAULT 0,
      atk INT NOT NULL DEFAULT 0,
      def INT NOT NULL DEFAULT 0,
      points_worth INT NOT NULL DEFAULT 0
    );
    
    CREATE TABLE quest (
      quest_id INT PRIMARY KEY AUTO_INCREMENT,
      title TEXT,
      description TEXT,
      enemy_name TEXT,
      enemy_hp INT NOT NULL DEFAULT 0,
      enemy_atk INT NOT NULL DEFAULT 0,
      enemy_def INT NOT NULL DEFAULT 0,
      hp_reward INT NOT NULL DEFAULT 0,
      atk_reward INT NOT NULL DEFAULT 0,
      def_reward INT NOT NULL DEFAULT 0,
      points_reward INT NOT NULL DEFAULT 0
    );
    
    CREATE TABLE character_duel (
      duel_id INT PRIMARY KEY AUTO_INCREMENT,
      participant_1_name VARCHAR(255) NOT NULL,
      participant_2_name VARCHAR(255) NOT NULL,
      points_bet INT NOT NULL DEFAULT 0,
      winner_name VARCHAR(255) NOT NULL,
      loser_name VARCHAR(255) NOT NULL,
      duel_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE trade (
      trade_id INT PRIMARY KEY AUTO_INCREMENT,
      seller_user_id INT NOT NULL,
      seller_user_name VARCHAR(255) NOT NULL,
      buyer_user_id INT,
      buyer_user_name VARCHAR(255),
      equipment_id INT,
      equipment_name VARCHAR(255),
      skill_id INT,
      skill_name VARCHAR(255),
      points INT NOT NULL DEFAULT 0,
      trade_date TIMESTAMP
    );
    -- Table for newsfeed posts
    CREATE TABLE newsfeed (
      newsfeed_id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      post_title LONGTEXT NOT NULL,
      post_content LONGTEXT NOT NULL,
      post_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Table for comments
    CREATE TABLE post_comments (
      comment_id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      newsfeed_id INT NOT NULL,
      comment_content LONGTEXT NOT NULL,
      comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    
    -- Insert sample data
    INSERT INTO task (title, description, points) VALUES
    ('Plant a tree', 'Plant a tree in your neighborhood or a designated green area.', 50),
    ('Use Public Transportation', 'Use public transportation or carpool instead of driving alone.', 30),
    ('Reduce Plastic Usage', 'Commit to using reusable bags and containers.', 40),
    ('Energy Conservation', 'Turn off lights and appliances when not in use.', 25),
    ('Composting', 'Start composting kitchen scraps to create natural fertilizer.', 35);
    
    -- Sample data for the 'user' table
    INSERT INTO user (username, email, password, role) VALUES
    ('admin', 'admin@bed.com', '${hash}', 'admin');

    INSERT INTO user (username, email, password) VALUES
    ('jane_smith', 'jane.smith@example.com', '${hash}'),
    ('alice_wonderland', 'alice.wonderland@example.com', '${hash}');
    
    INSERT INTO taskProgress (user_id, task_id, notes) VALUES
    (1, 1, 'Planted a beautiful oak tree in the neighborhood park.'),
    (1, 2, 'Used public transportation for the daily commute.'),
    (2, 3, 'Switched to reusable bags for grocery shopping.'),
    (2, 4, 'Practiced energy conservation by turning off lights and appliances.'),
    (3, 5, 'Started composting kitchen scraps for natural fertilizer.'),
    (1, 3, 'Completed the "Reduce Plastic Usage" task by using reusable bags.'),
    (2, 1, 'Planted a variety of trees in the community garden.'),
    (3, 2, 'Opted for public transportation, reducing carbon footprint.'),
    (1, 4, 'Implemented energy conservation measures at home.'),
    (2, 5, 'Expanded composting efforts for a more sustainable lifestyle.');
    
    -- Sample data for the 'character_status' table
    INSERT INTO character_status (user_id, sect, character_name, hp, atk, def, skill, equipment)
    VALUES
    (1, 'Saber Sect', 'Valiant Warrior', 100, 30, 20, '', ''),
    (2, 'Sword Sect', 'Noble Knight', 120, 25, 30, '', ''),
    (3, 'Shield Sect', 'Guardian Defender', 90, 20, 35, '', '');
    
    
    -- Sample data for the 'arsenal' table
    INSERT INTO arsenal (profession, equipment_name, hp, atk, def, points_worth)
    VALUES
    ('Saber Sect', 'Blade of Valor', 15, 10, 5, 100),
    ('Sword Sect', 'Helm of the Noble', 20, 5, 15, 80),
    ('Shield Sect', 'Thunderguard Shield', 10, 15, 20, 90),
    ('Sword Sect', 'Vorpal Blade', 18, 12, 8, 120),
    ('Saber Sect', 'Frostbite Dagger', 10, 25, 5, 95),
    ('Shield Sect', 'Golem Gauntlets', 5, 20, 15, 85),
    ('Saber Sect', 'Mjolnir Hammer', 25, 15, 10, 130),
    ('Sword Sect', 'Shadow Cloak', 8, 18, 12, 110),
    ('Sword Sect', 'Venomous Whip', 12, 22, 7, 105),
    ('Shield Sect', 'Celestial Staff', 20, 10, 18, 115),
    ('Saber Sect', 'Lunar Crescent Sword', 22, 8, 15, 125),
    ('Saber Sect', 'Eclipse Scythe', 25, 8, 12, 120),
    ('Shield Sect', 'Aegis of Atlantis', 15, 12, 20, 105),
    ('Sword Sect', 'Emberforged Axe', 18, 20, 10, 130),
    ('Shield Sect', 'Starshard Bow', 10, 22, 15, 115);
    
    -- Sample data for the 'library' table
    INSERT INTO library (profession, skill_name, hp, atk, def, points_worth)
    VALUES
    ('Saber Sect', 'Earthquake', 15, 12, 20, 85),
    ('Sword Sect', 'Time Warp', 22, 8, 15, 90),
    ('Saber Sect', 'Soul Drain', 12, 17, 22, 80),
    ('Sword Sect', 'Mind Control', 17, 15, 8, 85),
    ('Shield Sect', 'Lightning Strike', 10, 22, 8, 90),
    ('Saber Sect', 'Chaos Bolt', 20, 10, 18, 100),
    ('Shield Sect', 'Divine Shield', 25, 5, 15, 105),
    ('Sword Sect', "Nature's Wrath", 15, 18, 12, 90),
    ('Saber Sect', 'Fireball', 10, 20, 5, 80),
    ('Shield Sect', 'Telekinesis', 8, 15, 10, 70),
    ('Sword Sect', 'Celestial Blessing', 18, 12, 20, 90),
    ('Saber Sect', 'Cursed Arrow', 22, 15, 8, 100),
    ('Shield Sect', 'Arcane Blast', 18, 5, 20, 85);
    
    -- Sample data for the 'quest' table
    INSERT INTO quest (title, description, enemy_name, enemy_hp, enemy_atk, enemy_def, hp_reward, atk_reward, def_reward, points_reward)
    VALUES
    ('Cleanse the Polluted Waters', 'Purge the polluted waters by defeating toxic creatures.', 'Toxic Sludge Elemental', 80, 40, 30, 30, 20, 15, 50),
    ('Protect the Endangered Species', 'Guard endangered species from poachers and predators.', 'Poacher Gang', 120, 60, 45, 50, 30, 25, 80),
    ('Battle against Deforestation', 'Engage in a battle to stop the destruction of the forest.', 'Lumberjack Titan', 200, 100, 75, 70, 40, 35, 120),
    ('Cleanse the Air of Dark Magic', 'Eliminate dark magic causing air pollution and chaos.', 'Dark Sorcerer of Smog', 150, 75, 55, 60, 35, 30, 100),
    ('Rescue the Endangered Plant', 'Rescue a unique plant species from the brink of extinction.', 'Poisonous Vine Guardian', 100, 50, 40, 40, 25, 20, 70),
    ('Retrieve the Lost Seed', 'Embark on a quest to find and protect a vital magical seed.', 'Mystical Seed Guardian', 180, 90, 65, 65, 38, 33, 110),
    ('Explore the Enchanted Garden', 'Discover the secrets of an enchanted garden and restore its balance.', 'Enchanted Garden Nymph', 130, 65, 50, 55, 32, 27, 90),
    ('Extinguish the Forest Fire', 'Control a raging forest fire and defeat the Fire Elemental.', 'Inferno Elemental', 160, 80, 60, 75, 45, 40, 105),
    ('Protect the Crystal Ecosystem', 'Safeguard a crystal ecosystem from invaders seeking its power.', 'Crystal Desecrator', 140, 70, 52, 50, 28, 23, 95),
    ('Defeat the Pollution Monster', 'Battle against a monstrous entity created from pollution.', 'Pollution Behemoth', 220, 110, 80, 85, 50, 45, 140),
    ('Guard the Wildlife Migration', 'Protect migrating wildlife from natural disasters and predators.', 'Wildlife Predator Pack', 110, 55, 42, 35, 18, 15, 60),
    ('Reclaim the Desert Oasis', 'Reclaim a magical oasis in the desert from desertification.', 'Sandstorm Djinn', 190, 95, 70, 80, 48, 42, 115),
    ('Summon the Rainstorm', 'Summon a healing rainstorm to revive a dying forest.', 'Storm Elemental Guardian', 170, 85, 62, 65, 38, 32, 105),
    ('Guard the Sacred Waters', 'Defend sacred waters from dark forces seeking to corrupt them.', 'Dark Water Spirit', 200, 100, 75, 90, 55, 50, 130),
    ('Retrieve the Phoenix Feather', 'Retrieve a rare phoenix feather from a fiery phoenix guarding its nest.', 'Fiery Phoenix', 240, 120, 90, 100, 60, 55, 160);
        
    `;

    pool.query(SQLSTATEMENT, callback);
  }
});
