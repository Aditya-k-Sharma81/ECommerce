import express from 'express';
import { register, login, isAuth, logout, updateProfile } from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';
import { upload } from '../configs/multer.js';

const userRouter = express.Router();

userRouter.post('/register', register);
userRouter.post("/login", login);
userRouter.get("/is-auth", authUser, isAuth);
userRouter.get("/logout", authUser, logout);
userRouter.post("/update-profile", authUser, upload.single('image'), updateProfile);

export default userRouter;
