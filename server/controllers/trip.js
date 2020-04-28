import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";
import { get } from "lodash";
import formidable from "formidable";
import APIError from "../helpers/APIError";
import { fetchReturnObj } from "../service/transform-response";
import TripSchema from "../models/trip";
import TripRequestSchema from "../models/trip-request";
import UserSchema from "../models/user";
import SendNotification from "../service/pushNotification";
import paymentCtrl from "../controllers/payment";
import config from "../../config/env";
import ServerConfig from "../models/serverConfig";

/**
 * Return the trip details of the user.
 * @param req
 * @param res
 * @param next
 * @returns { trip: historyObjArray[{ tripObj }]  }
 */

function getHistory(req, res, next) {
  const historyObjArray = [];
  const recentObjArray = [];

  const userID = req.user._id; //eslint-disable-line
  const userType = req.user.userType;
  const searchObj = {};
  if (userType === "1") {
    searchObj.riderId = userID;
  } else if (userType === "2") {
    searchObj.driverId = userID;
  }
  console.log(searchObj)
  TripSchema.find(
    { $and: [searchObj],
      $or:[{ tripStatus: "endTrip" },{tripStatus: "accepted"}]
    },
    null,
    { sort: { bookingTime: -1 } },
    (tripErr, tripObj) => {
      //eslint-disable-line
      if (tripErr) {
        const err = new APIError(
          `error while finding trip history for the user  ${tripErr}`,
          httpStatus.INTERNAL_SERVER_ERROR
        );
        return next(err);
      }
      if (tripObj.length !== 0) {
        tripObj.forEach((obj, index) => {
          fetchReturnObj(obj).then(transformedReturnObj => {
            if(transformedReturnObj.tripStatus === "endTrip"){
              historyObjArray.push(transformedReturnObj);
            }
            else if(transformedReturnObj.tripStatus === "accepted"){
              recentObjArray.push(transformedReturnObj);
            }
            if (index === tripObj.length - 1) {
              const returnObj = {
                success: true,
                message: "user trip history",
                history: historyObjArray,
                recent: recentObjArray

              };
              res.send(returnObj);
            }
          });
        });
      } else {
        const returnObj = {
          success: true,
          message: "no history available",
          data: []
        };
        res.send(returnObj);
      }
    }
  );
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

/**
 * Return the trip details of the user.
 * @param req
 * @param res
 * @param next
 * @returns { tripObj }
 */

function updateTrip(req, res, next) {
  console.log(req, "reqreqreqreq");
  //eslint-disable-line
  const userType = req.user.userType;
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

        form.parse(req, (err, fields, files) => {
          const img = get(files, "image.path", "");
          const tripID = fields.tripId;
          cloudinary.v2.uploader.upload(
            img,
            // {
            //   transformation: [
            //     {
            //       effect: 'improve',
            //       gravity: 'face',
            //       height: 100,
            //       width: 100,
            //       crop: 'fill',
            //     },
            //     { quality: 'auto' },
            //   ],
            // },
            (error, results) => {
              if (results) {
                TripSchema.findOneAndUpdateAsync(
                  { _id: fields.tripId },
                  { $set: { receiptUrl: results.url } },
                  { new: 1, runValidators: true }
                )
                  .then(updatedTripObj => {
                    //eslint-disable-line
                    const returnObj = {
                      success: false,
                      message:
                        "unable to update trip object as trip id provided didnt match",
                      data: null,
                      meta: null
                    };
                    if (updatedTripObj) {
                      returnObj.success = true;
                      returnObj.message = "trip object updated";
                      returnObj.data = updatedTripObj;
                      res.send(returnObj);
                    } else {
                      const err = new APIError(
                        "Trip Id did not matched",
                        httpStatus.BAD_REQUEST
                      );
                      return next(err);
                    }
                  })
                  .error(e => {
                    const err = new APIError(
                      `Error occured while updatating trip object ${e}`,
                      httpStatus.INTERNAL_SERVER_ERROR
                    );
                    next(err);
                  });
              }
            }
          );
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
function listing_trip(req, res, next) {
  console.log("simran here")
  const requestObjArray = [];
  const userID = req.user._id; //eslint-disable-line
  const userType = req.user.userType;
  const searchObj = {};
  if (userType === "2") {
    searchObj.driverId = userID;
    console.log(userID);
    console.log("simran simran ")
    TripRequestSchema
    .find({ $and: [searchObj, {
      $or: [{ tripRequestStatus: "request" },{tripRequestStatus: "accepted"}]
    }
       ] },
    null,
    { sort: { requestTime: -1 } })
    .populate('riderId')
    .exec(function (tripErr, tripObj) {
      if (tripErr) {
        const err = new APIError(
          `error while finding trip history for the user  ${tripErr}`,
          httpStatus.INTERNAL_SERVER_ERROR
        );
        return next(err);
      }
      if (tripObj.length !== 0) {

        tripObj.forEach((obj, index) => {
          console.log("this is obj")
          console.log(obj.driverId)
          // var driverId = obj.driverId
          obj.details = obj.driverId;
          fetchReturnObj(obj).then(transformedReturnObj => {
            transformedReturnObj.tripId = transformedReturnObj._id
            var riderInfo = transformedReturnObj.riderId
            transformedReturnObj.riderId =riderInfo._id 
            transformedReturnObj.riderFirstName =riderInfo.fname 
            transformedReturnObj.riderLastNmae =riderInfo.lname 
            transformedReturnObj.riderAddress =riderInfo.address 
            transformedReturnObj.riderCity =riderInfo.city 
            transformedReturnObj.riderState =riderInfo.state 
            transformedReturnObj.riderRountry =riderInfo.country 
            transformedReturnObj.riderProfileUrl =riderInfo.profileUrl 
            transformedReturnObj.riderEmail =riderInfo.email 
            transformedReturnObj.riderPhone =riderInfo.phoneNo 
            transformedReturnObj.riderGpsLoc =riderInfo.gpsLoc 

            // console.log("check from simran============")
            requestObjArray.push(transformedReturnObj);
            if (index === tripObj.length - 1) {
              const returnObj = {
                success: true,
                message: "user trip request",
                data: requestObjArray
              };
              res.send(returnObj);
            }
          });
        });
        
      } else {
        const returnObj = {
          success: true,
          message: "no trip request availiable",
          data: []
        };
        res.send(returnObj);
      }
        // prints "The creator is Aaron"
    })
  } else if (userType === "1") {
    searchObj.riderId = userID;
    console.log(searchObj);
    console.log(userID)
    TripRequestSchema
    .find({ $and: [searchObj, { tripRequestStatus: "request" }] },
    null,
    { sort: { requestTime: -1 } })
    .populate('driverId')
    .exec(function (tripErr, tripObj) {
      if (tripErr) {
        const err = new APIError(
          `error while finding trip history for the user  ${tripErr}`,
          httpStatus.INTERNAL_SERVER_ERROR
        );
        return next(err);
      }
      console.log(tripObj)
      if (tripObj.length !== 0) {

        tripObj.forEach((obj, index) => {
          console.log("this is obj")
          console.log(obj.driverId)
          // var driverId = obj.driverId
          obj.details = obj.driverId;
          fetchReturnObj(obj).then(transformedReturnObj => {

            transformedReturnObj.tripId = transformedReturnObj._id
            var riderInfo = transformedReturnObj.driverId
            transformedReturnObj.driverId =riderInfo._id 
            transformedReturnObj.driverFirstName =riderInfo.fname 
            transformedReturnObj.driverLastNmae =riderInfo.lname 
            transformedReturnObj.driverAddress =riderInfo.address 
            transformedReturnObj.driverCity =riderInfo.city 
            transformedReturnObj.driverState =riderInfo.state 
            transformedReturnObj.driverCountry =riderInfo.country 
            transformedReturnObj.driverProfileUrl =riderInfo.profileUrl 
            transformedReturnObj.driverEmail =riderInfo.email 
            transformedReturnObj.driverPhone =riderInfo.phoneNo 
            transformedReturnObj.driverGpsLoc =riderInfo.gpsLoc 




            requestObjArray.push(transformedReturnObj);
            if (index === tripObj.length - 1) {
              const returnObj = {
                success: true,
                message: "user trip request",
                data: requestObjArray
              };
              res.send(returnObj);
            }
          });
        });
        
      } else {
        const returnObj = {
          success: true,
          message: "no trip request availiable",
          data: []
        };
        res.send(returnObj);
      }
        // prints "The creator is Aaron"
    })

  }
  
}
function updateStatus(req, res, next){

  var tripId = req.body.tripId;
  var tripStatus = req.body.tripStatus;
  console.log(req.body)
  if(req.body.tripStatus === "payment" ){
    
    paymentCtrl.cardPayment(req.body).then(status => {
      console.log(status);
    })
  }
  TripRequestSchema.findOneAndUpdate(
    { _id: tripId },
    { $set: { tripRequestStatus: tripStatus } },
    // { multi: true }
  ).then(result => {
    if(req.body.tripStatus === "payment" ){
      UserSchema.findOneAsync({ _id: result.driverId }).then(userObj => {
        SendNotification(result.riderId, userObj.fname+" charge you payment $10");
      });
    }
    else{
      UserSchema.findOneAsync({ _id: result.driverId }).then(userObj => {
        SendNotification(result.riderId, userObj.fname+" has "+tripStatus +" your request");
      });
    }

    
    // SendNotification(result.riderId, );
    return res.send({
      success: true,
      message: "Changed Status sucessfully",
      data: tripStatus
    });
  });
    

}
export default { getHistory, updateTrip ,listing_trip,updateStatus};
