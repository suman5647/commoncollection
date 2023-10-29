import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import * as multer from 'multer';
import * as authorize from '../controllers/authorize';
import * as passport from 'passport';
import { JwtAuthUtil } from '../platform/jwt.operations';

const PubRouter: Router = Router();
const router: Router = Router();
const userController: UserController = new UserController();
const REGISTERUSER_PATH: string = '/register';
const ISSUETOKEN_PATH: string = '/issue';
const REFRESHTOKEN_PATH: string = '/refresh';
const ACTIVATETOKEN_PATH: string = '/activate';
const FORGOTPASSWORD_PATH: string = '/forgotpassword';
const RESETPASSWORD_PATH: string = '/resetpassword';
const SETPASSWORD_PATH: string = '/setpassword';
const CHANGEMYPASSWORD_PATH: string = '/changepassword';
const CHANGEMYADDRESS_PATH: string = '/changeaddress';
const USERPROFILE_PATH: string = '/profile';
const WELCOMEUSER_PATH: string = '/welcome';
const FACEBOOKLOGIN_PATH: string = '/facebook';
const GOOGLELOGIN_PATH: string = '/google';
const FACEBOOKREDIRECT_PATH: string = '/facebook/redirect';
const FACEBOOKUSERDELETE_PATH: string = '/facebook/userdelete';
const GOOGLEREDIRECT_PATH: string = '/google/redirect';
const USERPROFILEPHOTO_PATH: string = '/uploadphoto'
const MYSTORY_PATH: string = '/mystory';
const ADMIN_LOGIN: string = '/admin';
const FBUSER_DELETE: string = '/facebook/deleteuser';

const storage = multer.memoryStorage({
    destination: function (req, file, callback) {
        callback(null, '');
    }
});

const singleUpload = multer({ storage: storage }).single('file');

PubRouter.post(REGISTERUSER_PATH, userController.registerUser);
router.post(ISSUETOKEN_PATH, userController.issueToken);
router.get(REFRESHTOKEN_PATH, userController.refreshToken);
router.get(ACTIVATETOKEN_PATH, userController.activateToken);
router.post(FORGOTPASSWORD_PATH, userController.forgotPassword);
router.get(SETPASSWORD_PATH, userController.setPasswordURL);
router.post(RESETPASSWORD_PATH, userController.setPassword);
router.post(CHANGEMYPASSWORD_PATH, authorize.permitted('*'), userController.changePassword);
router.put(CHANGEMYADDRESS_PATH, authorize.permitted('*'), userController.updateAddress);
router.put(MYSTORY_PATH, authorize.permitted('*'), userController.putMyStory);
router.get(USERPROFILE_PATH, authorize.permitted('*'), userController.myProfile);
router.get(WELCOMEUSER_PATH, authorize.permitted('*'), userController.welcomeMsg);
router.post(USERPROFILEPHOTO_PATH, authorize.permitted('*'), singleUpload, userController.uploadPhoto);
router.get(FACEBOOKLOGIN_PATH, passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
router.get(FACEBOOKREDIRECT_PATH, passport.authenticate('facebook', {
    failureRedirect: '/login'
}), async function (req: any, res) {
    var tokenRespone = await new JwtAuthUtil().issueToken(req.user);
    res.redirect(`/loginsucess?access_token=${tokenRespone.access_token}&refresh_token=${tokenRespone.refresh_token}`);
    return;
});
router.get(GOOGLELOGIN_PATH, passport.authenticate('google', { scope: ['email', 'profile'] }));
router.get(GOOGLEREDIRECT_PATH, passport.authenticate('google', {
    failureRedirect: '/login'
}), async function (req: any, res) {
    var tokenRespone = await new JwtAuthUtil().issueToken(req.user);
    res.redirect( `/loginsucess?access_token=${tokenRespone.access_token}&refresh_token=${tokenRespone.refresh_token}`);
    return;
});
router.post(FBUSER_DELETE, userController.deleteFacebookUser);
router.get(FACEBOOKUSERDELETE_PATH, userController.checkUserStatus);
//for admin
router.post(ADMIN_LOGIN, authorize.permitted('admin'), userController.adminLogin);

export const authRoutes = router;
export const pubRouter = PubRouter;