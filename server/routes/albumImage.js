import express from "express";
import httpStatus from "http-status";
import passport from "passport";
import validate from 'express-validation';
import APIError from "../helpers/APIError";
import config from "../../config/env";
// import appConfigCtrl from "../controllers/appConfig";
import albumImageCtrl from "../controllers/albumImage";
import paramValidation from '../../config/param-validation';

const router = express.Router();

/**
 * Middleware for protected routes. All protected routes need token in the header in the form Authorization: JWT token
 */
router.use((req, res, next) => {
  passport.authenticate(
    "jwt",
    config.passportOptions,
    (error, userDtls, info) => {
      //eslint-disable-line
      if (error) {
        const err = new APIError(
          "token not matched",
          httpStatus.INTERNAL_SERVER_ERROR
        );
        return next(err);
      } else if (userDtls) {
        req.user = userDtls;
        next();
      } else {
        const err = new APIError(
          `token is valid but no user found ${info}`,
          httpStatus.UNAUTHORIZED
        );
        return next(err);
      }
    }
  )(req, res, next);
});

/**  /api/posts -  */
router
  .route("/addImage")
  .post(validate(paramValidation.createPost), albumImageCtrl.createPost)


  router.route('/deleteImage/:id')
  .delete(albumImageCtrl.deleteImage);

// router.route('/updateAlbum/:id')
//   .put(albumCtrl.updateAlbum);

router.route('/getAlbumImages')
  .post(albumImageCtrl.getAlbumImages);




export default router;
