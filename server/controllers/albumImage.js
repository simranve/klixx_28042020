import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";
import { get } from "lodash";
import formidable from "formidable";
import APIError from "../helpers/APIError";
import { fetchReturnObj } from "../service/transform-response";
import albumImageSchema from "../models/albumImage";
import User from "../models/user";
import config from "../../config/env";
import ServerConfig from "../models/serverConfig";
// import post from "../models/post";
import notificationCtrl from "./notification";

/**
 * Return the post details of the user.
 * @param req
 * @param res
 * @param next
 * @returns
 */

function decode(token) {
  return jwt.decode(token, config.jwtSecret);
}

function tokenFromHeaders(req) {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "JWT"
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  return "";
}

/**
 * Get getCloudinaryDetails
 * @returns {Cloudinary Details}

 */
function getCloudinaryDetails() {
  return new Promise((resolve, reject) => {
    ServerConfig.findOneAsync({ key: "cloudinaryConfig" })
      .then(foundDetails => {
        resolve(foundDetails.value);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function getAlbumImages(req,res,next){
  const token = tokenFromHeaders(req);
  const userData = decode(token);
  // console.log("deletePost")
  // const { id } = req.params;
  // console.log(req.params)
  albumImageSchema.find({ albumId: req.body.albumId })
    .then(result => {
      if (result) {
        return res.send({
          success: true,
          data: result,
          message: "Album Images"
        });
      }
      return res.send({
        success: false,
        data: null,
        message: "Falied to get album by user ID"
      });
    })
    .catch(e => {
      return res.send({
        success: false,
        data: e,
        message: "Falied to delete post by ID"
      });
    });
}




function deleteImage(req, res, next) {
  console.log("deleteImage")
  const { id } = req.params;
  console.log(req.params)
  albumImageSchema.remove({ _id: id })
    .then(result => {
      if (result) {
        return res.send({
          success: true,
          data: result,
          message: "Deleted post by ID"
        });
      }
      return res.send({
        success: false,
        data: null,
        message: "Falied to delete post by ID"
      });
    })
    .catch(e => {
      return res.send({
        success: false,
        data: e,
        message: "Falied to delete post by ID"
      });
    });
}

function createPost(req, res, next) {
  const token = tokenFromHeaders(req);
  const userData = decode(token);
  console.log("reach dfghhj")
  getCloudinaryDetails()
    .then(value => {
      if (value) {
        cloudinary.config({
          cloud_name: value.cloud_name,
          api_key: value.api_key,
          api_secret: value.api_secret
        });
        const form = new formidable.IncomingForm();
        form.on("error", err => {
          console.error(err, "error heree"); //eslint-disable-line
        });
        console.log("reach dfghhj1111111111")

        form.parse(req, (err, fields, files) => {
          const img = get(files, "image.path", "");
          cloudinary.v2.uploader.upload(img, (error, results) => {
            if (error) {
              return res.send({
                success: false,
                message: "Image Not Found"
              });
            }
            if (results) {
              albumImageSchema.create({
                imageUrl: results.url,
                // userId: get(userData, "_id", ""),
                albumId: fields.albumId,
                // longAddress: fields.longAddress,
                // shortAddress: fields.shortAddress,
                // loc: !fields.loc ? undefined : JSON.parse(fields.loc),
                postedAt: Date.now()
              })
                .then(data => {
                  const notificationData = {
                    userId: req.user._id,
                    postId: data._id
                  };
                  notificationCtrl.createNotification("post", notificationData);
                  res.send({
                    success: true,
                    message: "image uplaoded"
                  });
                })
                .catch(e => {
                  res.send({
                    success: false,
                    message: "failed to upload"
                  });
                });
            }
          });
        });
      }
    })
    .catch(e => {
      const err = new APIError(
        `Error occured while updatating trip object ${e}`,
        httpStatus.INTERNAL_SERVER_ERROR
      );
      next(err);
    });
}



export default {
  getAlbumImages,

  createPost,

  deleteImage,
};
