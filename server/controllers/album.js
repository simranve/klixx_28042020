import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";
import { get } from "lodash";
import formidable from "formidable";
import APIError from "../helpers/APIError";
import { fetchReturnObj } from "../service/transform-response";
import AlbumSchema from "../models/album";
import User from "../models/user";
import config from "../../config/env";
import ServerConfig from "../models/serverConfig";
import album from "../models/album";
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


function createAlbum(req, res, next) {
  const token = tokenFromHeaders(req);
  const userData = decode(token);
  console.log(userData);
  if(req.body.albumName === '' || req.body.location === '' || req.body.eventOn === '' ){
    const returnObj = {
      success: false,
      data : [],
      message:"Parameters missing"
    };
    
    res.send(returnObj);
  }
  else{
    const Album = new AlbumSchema({
      photographerId: userData._id,
      albumName:req.body.albumName,
      location:req.body.location,
      eventOn:req.body.eventOn
      
    });
  
    Album.saveAsync().then(savedAlbum => {
      console.log(savedAlbum); //eslint-disable-line
      // const transactionOwner = new Transaction({
      //   userIdFrom: req.body.riderEmail,
      //   tripId: req.body.tripId,
      //   amount: Number(req.body.amount),
      //   walletIdFrom: req.body.riderEmail
      // });
      // transactionOwner
      //   .saveAsync()
      //   .then(transactionRider => {
          const returnObj = {
            success: true,
            data : savedAlbum,
            message:"Album created successfully"
          };
          
          res.send(returnObj);
        // })
        // .error(e => {
        //   console.log("error", e);
        // }); //eslint-disable-line
    })
    .error(ee => {
      const returnObj = {
        success: false,
        data : e,
        message:"Cannot creat Album"
      };
      
      res.send(returnObj);
      }); 
    ;
  
  }
  
}

function deleteAlbum(req, res, next) {
  console.log("deletePost")
  // const { id } = req.body;
  // console.log(req.body)
  const{ id } = req.params;
  console.log(req.params)
  AlbumSchema.remove({ _id: id })
    .then(result => {
      if (result) {
        return res.send({
          success: true,
          data: result,
          message: "Deleted Album"
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
// function updateAlbum(req, res, next) {
//   console.log("updateAlbum")
//   const details = {
    
//     albumName:req.body.albumName,
//     location:req.body.location,
//     eventOn:req.body.eventOn
//   }

//   AlbumSchema.findOneAndUpdateAsync(
//     { _id: req.params._id },
//     { $set: { albumName:req.body.albumName } }
//     // { new: 1 }
//   )
//     .then(updatedTripObj => {
//       //eslint-disable-line
//       console.log(updatedTripObj)
//       if (updatedTripObj) {
//         const returnObj = {
//           success: true,
//           message: "Album updated",
//           data:updatedTripObj
//         }
//         res.send(returnObj);
//       } else {
//         const returnObj = {
//           success: false,
//           message:
//             "unable to update Album object as album id provided didnt match",
//           data: null,
//           meta: null
//         };
//         res.send(returnObj);
//       }
//     })
// }
function getAlbum(req,res,next){
  const token = tokenFromHeaders(req);
  const userData = decode(token);
  console.log("deletePost")
  const { id } = req.params;
  console.log(req.params)
  AlbumSchema.find({ photographerId: userData._id })
    .then(result => {
      if (result) {
        return res.send({
          success: true,
          data: result,
          message: "Album"
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
export default {
  createAlbum,
  deleteAlbum,
  // updateAlbum,
  getAlbum
};
