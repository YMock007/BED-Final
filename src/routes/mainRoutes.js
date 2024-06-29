const express = require('express');
const router = express.Router();
const usersRoutes = require('./secA_usersRoutes');
const tasksRoutes = require('./secA_tasksRoutes');
const tasksProgressRoutes = require('./secA_tasksProgressRoutes');
const walletRoutes = require('./secB_walletRoutes');
const characterRoutes = require('./secB_charactersRoutes')
const equipmentsRoutes = require('./secB_equipmentsRoutes');
const skillsRoutes = require('./secB_skillsRoutes');
const arsenalRoutes = require('./secB_arsenalRoutes');
const libraryRoutes = require('./secB_libraryRoutes');
const questsRoutes = require('./secB_questsRoutes');
const duelRoutes = require('./secB_duelRoutes');
const tradeRoutes = require('./secB_tradeRoutes');
const newsfeedRoutes = require('./secA_newsfeedRoutes')
const commentsRoutes = require('./secA_commentsRoutes')

const jwtMiddleware = require('../middlewares/jwtMiddleware')
const bcryptMiddleware = require('../middlewares/bcryptMiddleware')
const authController = require('../controllers/authController')
const userController = require('../controllers/secA_usersController')



router.post("/jwt/generate", authController.preTokenGenerate, jwtMiddleware.generateToken, authController.beforeSendToken, jwtMiddleware.sendToken)
router.get("/jwt/verify", jwtMiddleware.verifyToken, authController.showTokenVerified)
router.post("/bcrypt/compare", authController.preCompare, bcryptMiddleware.comparePassword, authController.showCompareSuccess)
router.post("/bcrypt/hash", bcryptMiddleware.hashPassword, authController.showHashing)
router.post("/register", userController.checkUsernameOrEmailExist, bcryptMiddleware.hashPassword, userController.register, jwtMiddleware.generateToken, jwtMiddleware.sendToken);
router.post("/login", userController.login, userController.loginTimeUpdate, bcryptMiddleware.comparePassword, jwtMiddleware.generateToken, jwtMiddleware.sendToken);


router.use("/users", usersRoutes);
router.use("/tasks", tasksRoutes);
router.use("/task_progresses", tasksProgressRoutes);
router.use("/wallets", walletRoutes);
router.use("/characters", characterRoutes);
router.use("/equipment", equipmentsRoutes);  
router.use("/skills", skillsRoutes);          
router.use("/arsenals", arsenalRoutes);
router.use("/libraries", libraryRoutes);
router.use("/quests", questsRoutes);
router.use("/duels", duelRoutes);
router.use("/trades", tradeRoutes);
router.use("/newsfeeds", newsfeedRoutes);
router.use("/comments", commentsRoutes);

module.exports = router;
