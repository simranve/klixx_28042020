/* eslint-disable */
import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";
import path from "path";
import ServerConfig from "../models/serverConfig";
import UserSchema from "../models/user";
import TripRequestSchema from "../models/trip-request";

const EmailTemplate = require("email-templates");

const registerDir = path.resolve(__dirname, "../templates", "register");
const register = new EmailTemplate(path.join(registerDir));

const endtripDir = path.resolve(__dirname, "../templates", "endTrip");
const endTrip = new EmailTemplate(path.join(endtripDir));

const forgotDir = path.resolve(__dirname, "../templates", "forgotPassword");
const forgot = new EmailTemplate(path.join(forgotDir));

const rideAcceptDir = path.resolve(__dirname, "../templates", "rideAccept");
const rideAccept = new EmailTemplate(path.join(rideAcceptDir));

const emailDir = path.resolve(__dirname, "../templates", "emailVerify");
const emailVerify = new EmailTemplate(path.join(emailDir));

var fname = '';
var lname = '';
var userType = '';




function getEmailApiDetails() {
  return new Promise((resolve, reject) => {
    ServerConfig.findOneAsync({ key: "emailConfig" })
      .then(foundDetails => {
        resolve(foundDetails.value);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function sendEmail(userId, responseObj, type) {
  UserSchema.findOneAsync({ _id: userId }).then(userObj => {
    getEmailApiDetails().then(details => {
      console.log(details, "check emailApiDetails");
      const transporter = nodemailer.createTransport(
        smtpTransport({
          host: details.host,
          port: details.port,
          secure: details.secure, // secure:true for port 465, secure:false for port 587
          auth: {
            user: details.username,
            pass: details.password
          }
        })
      );
      const locals = Object.assign({}, { data: responseObj });
      fname = userObj.fname
      lname = userObj.lname

      userType = userObj.userType

      if (type === "emailVerify") {

        const emailVerify = `<html>

        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;" />
            <title>Taxi App</title>
            <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600" rel="stylesheet">
            <style type="text/css">
                * {
                    font-family: 'Open Sans', sans-serif;
                    font-weight: 300;
                }
            </style>
        </head>
        
        <body style="padding:0; margin:0; background: #f4f4f4;">
            <table style="max-width: 700px; width: 100%; border: 0; margin:20px auto;">
                <tr>
                    <td>
                        <table style="border: 1px solid #d7d7d7; width: 100%; max-width: 700px; background: white; position:relative ">
                            <tr>
                                <td style="background: #1B557A; height: auto; vertical-align: middle;">
                                    <div style=" padding: 10px 15px">
                                        <img style="width: 50px; border-radius: 50%;" src="http://res.cloudinary.com/dujorqozx/image/upload/v1587979921/yhrgxsgrhgviutgxsoqc.png"
                                            alt="KlixxApp" />
                                        <span style="display: inline-block; padding-left: 15px; vertical-align: top; color: #f4f4f4; font-size: 20px;"><br
                                        />KlixxApp</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:40px 20px 0px 20px;">
                                    <h1 style="font-weight: 300;">
                                        Hi
                                        `+ fname +` `+ lname +`
                                    </h1>
                                    <div style="font-size:24px;">
                                        <p style="color: #666;">ThankYou for registering with us as
                                            `+userType+`
                                        <p style="color: #666;">Please verify your email address to further secure your KlixxApp Account</p>
                                        <button type="button" style="background-color: #4CAF50; border: none;color: white;padding: 15px 32px; text-decoration: none;display: block; font-size: 16px;margin-left:auto;margin-right: auto;">
                                            <a style="text-decoration: none; color: #fff" href="https://www.klixx.app/"> Verify Your Email</a>
                                        </button>
        
                                        <p style="color: #666;"><br />Enjoy using Klixx App !!</p>
        
                                    </div>
        
                                    <p style="margin:60px 0 40px 0; font-size: 18px;">Thanks<br /> KlixxApp Team</p>
                                    <!-- <h1 style="text-align: center; font-weight: 300; font-size: 50px; margin:0;">
                                        <p style="margin:60px 0 40px 0; font-size: 18px;">
                                          <a href="https://www.klixx.app/" style="color:#ddd">Click here</a><br />
                                          To verify your email</p>
                                      </h1> -->
        
                                </td>
        
                            </tr>
                            <tr>
                                <td>
                                    <div style="background: #1B557A; height: 30px; width: 100%; position: absolute;text-align:center; padding-top: 10px;">
                                        <a href="https://www.klixx.app/" style="color:#ddd">Contact Us</a>
                                    </div>
                                </td>
                            </tr>
        
        
                        </table>
                    </td>
                </tr>
        
            </table>
        </body>
        
        </html>`


        // emailVerify.render(locals, (err, results) => {
          //eslint-disable-line
          // if (err) {
          //   return console.error(err); //eslint-disable-line
          // }
          const mailOptions = {
            from: "photo@klixx.app",//details.username, // sender address
            to: userObj.email, // list of receivers
            subject: "Verify your Account with Klixx App", // Subject line
            // text: results.text, // plain text body
            html: emailVerify // html body
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log("error in emailApi", error);
              return error;
            }
            console.log("result in emailApi", info);
            return info;
          });
        // });
      }

      if (type === "register") {
       
        const registerContent = `<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;" />
    <title>Taxi App</title>
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600" rel="stylesheet">
    <style type="text/css">
        * {
            font-family: 'Open Sans', sans-serif;
            font-weight: 300;
        }
    </style>
</head>
<body style="padding:0; margin:0; background: #f4f4f4;">
    <table style="max-width: 700px; width: 100%; border: 0; margin:20px auto;">
        <tr>
            <td>
                <table style="border: 1px solid #d7d7d7; width: 100%; max-width: 700px; background: white; position:relative ">
                    <tr>
                        <td style="background: #1B557A; height: auto; vertical-align: middle;">
                            <div style=" padding: 10px 15px">
                                <img style="width: 50px; border-radius: 50%;" src="http://res.cloudinary.com/dujorqozx/image/upload/v1587979921/yhrgxsgrhgviutgxsoqc.png" alt="KlixxApp" />
                                <span style="display: inline-block; padding-left: 15px; vertical-align: top; color: #f4f4f4; font-size: 20px;"><br />KlixxApp</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:40px 20px 0px 20px;">
                            <h1 style="font-weight: 300;">
                            Hi `+ fname +` `+ lname +`</h1>
                            <div style="font-size:24px;">
                            <p>ThankYou for registering with us as `+ userType +`<br /><br />
                            Enjoy using Klixx App !!.</p>
                            </div>
                               
                            <p style="margin:60px 0 40px 0; font-size: 18px;">Thanks<br />
                            KlixxApp Team</p>
                            <h1 style="text-align: center; font-weight: 300; font-size: 50px; margin:0;">
                               
                            </h1>
                         
                        </td>
                          
                    </tr>
                    <tr>
                    <td>
                    //  <div style="background: #1B557A; height: 30px; width: 100%; position: absolute;text-align:center; padding-top: 10px;">
                    //   // <a href="https://www.klixx.app/" style="color:#ddd">Contact Us</a>
                    //  </div>
                    </td>
                    </tr>
                  
                 
                </table>
            </td>
        </tr>
        
    </table>
</body>
</html>`
        
          console.log("this is no error")
        registerContent
          const mailOptions = {
            from: "photo@klixx.app",//details.username, // sender address
            to: userObj.email, // list of receivers
            subject: "Your Account with Klixx app is created", // Subject line
            html: registerContent, // plain text body
            // html: results.html // html body
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log("error in emailApi", error);
              return error;
            }
            console.log("result in emailApi", info);
            return info;
          });
        // });
      }
      if (type === "endTrip") {
        const endTrip= `<html>

        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;" />
            <title>Taxi App</title>
            <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600" rel="stylesheet">
            <style type="text/css">
                * {
                    font-family: 'Open Sans', sans-serif;
                    font-weight: 300;
                }
            </style>
        </head>
        
        <body style="padding:0; margin:0; background: #f4f4f4;">
            <table style="max-width: 700px; width: 100%; border: 0; margin:20px auto;">
                <tr>
                    <td>
                        <table style="border: 1px solid #d7d7d7; width: 100%; max-width: 700px; background: white; padding-bottom: 15px; ">
                            <tr>
                                <td style="background: #1B557A; height: auto; vertical-align: middle;">
                                    <div style=" padding:20px 250px">
                                        <img style="width: 50px; border-radius: 50%;" src="http://res.cloudinary.com/dujorqozx/image/upload/v1587979921/yhrgxsgrhgviutgxsoqc.png"
                                            alt="KlixxApp" />
                                        <span style="display: inline-block; padding-left: 15px; vertical-align: top; color: #f4f4f4; font-size: 20px;"><br
                                        />KlixxApp</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:40px 20px 0px 20px;">
                                    <h2 style="font-weight: 300; text-align: center;">Thank you for travelling with us,
                                        
                                    </h2>
                                    <h1 style="text-align: center; font-weight: 300; font-size: 80px; margin:0;">
                                        <span style="font-weight: 300; font-size: 30px;">
                                            $
                                        </span> `+ userObj.tripAmt `
                                    </h1>
        
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 20px " width="100%">
                                   <!--  <h3 style="font-size: 21px; margin:0;"> Bill details</h3>
                                     <table style="width: 100%; border: solid 1px #ddd;" cellpadding="10" width="100%" cellspacing="0">
                                        <tr style="background: #eee;">
                                            <td>Ride fare</td>
                                            <td style="font-weight: 500; text-align: right; padding-right: 20px;">20 Rs</td>
                                        </tr>
                                        <tr>
                                            <td>Taxes </td>
                                            <td style="font-weight: 500; text-align: right; padding-right: 20px;">5 Rs</td>
                                        </tr>
                                        <tr style="background: #eee;">
                                            <td>Total fare</td>
                                            <td style="font-weight: 500; text-align: right; padding-right: 20px;">25 Rs</td>
                                        </tr>
        
                                    </table>  -->
                                    <table width="100%;" style="padding: 20px 0; color: green;">
                                        <tr>
                                            <td>
                                                Driver Name:
                                                <span style="font-weight: 600;">`+userObj.fname +``+ userObj.lname+`</span>
                                            </td>
                                            <td style="text-align: right;">
                                                Contact Details:
                                                <span style="font-weight: 600;">`+ userObj.driver.phoneNo+` </span>
                                            </td>
                                        </tr>
                                          <tr>
                                            <td>
                                                Client Name:
                                                <span style="font-weight: 600;">`+ userObj.rider.fname + ` `+ userObj.rider.lname +`</span>
                                            </td>
                                            <td style="text-align: right;">
                                                Contact Details:
                                                <span style="font-weight: 600;">`+ userObj.rider.phoneNo +`</span>
                                            </td>
                                        </tr>
                                    </table>
                                    <div style="border-top:solid 1px #ddd; border-bottom: solid 1px #ddd; padding: 20px 0;">
                                        <h3 style="font-weight: 500; margin: 0 0 5px 0;">
                                            Booking
                                            <span style="color: #1B557A; font-weight: 600; margin:5px 0; font-size: 16px; display: inline-block; margin-left: 10px;">Time:`+ userObj.bookingTime +`</span>
                                        </h3>
                                        <address style="color: #666;">
                                            Full address:  `+ userObj.pickUpAddress +` 
                                        </address>
        
                                        <h3 style="font-weight: 500; margin: 20px 0 5px 0;">
                                            Drop
                                            <span style="color: #1B557A; font-weight: 600; margin:5px 0; font-size: 16px; display: inline-block; margin-left: 10px;">Time: `+ userObj.tripEndTime +`</span>
                                        </h3>
                                        <address style="color: #666;">
                                            Full address: `+ userObj.destAddress +`
                                        </address>
                                    </div>
                                    <table width="100%" style="text-align: center; margin-top:20px;">
                                        <tr>
                                            <th width="50%" style="font-weight: 500; font-size: 16px;">Payment Mode</th>
                                            <th width="50%" style="font-weight: 500; font-size: 16px;">Total Amount</th>
                                        </tr>
                                        <tr style="color: green; margin:5px 0; font-size: 26px;">
                                            <td>Card</td>
                                            <td>$`+ userObj.tripAmt +`</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        
        </html>`
        // endTrip.render(locals, (err, results) => {
          if (err) {
            return console.error(err);
          }
          const mailOptions = {
            from: "photo@klixx.app",//details.username, // sender address
            to: userObj.email, // list of receivers
            subject: "Details with Klixx App", // Subject line
            text: results.text, // plain text body
            html: results.html // html body
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log("error in emailApi", error);
              return error;
            }
            console.log("result in emailApi", info);
            return info;
          });
        // });
      }
      if (type === "forgot") {
        forgot.render(locals, (err, results) => {
          if (err) {
            return console.error(err);
          }
          const mailOptions = {
            from: "photo@klixx.app",//details.username, // sender address
            to: userObj.email, // list of receivers
            subject: "Your Account Password with Klixx App", // Subject line
            text: results.text, // plain text body
            html: results.html // html body
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log("error in emailApi", error);
              return error;
            }
            console.log("result in emailApi", info);
            return info;
          });
        });
      }
      if (type === "rideAccept") {
        rideAccept.render(locals, (err, results) => {
          if (err) {
            return console.error(err);
          }
          const mailOptions = {
            from: "photo@klixx.app",//details.username, // sender address
            to: userObj.email, // list of receivers
            subject: "Klixx App Driver Details", // Subject line
            text: results.text, // plain text body
            html: results.html // html body
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log("error in emailApi", error);
              return error;
            }
            console.log("result in emailApi", info);
            return info;
          });
        });
      }



      if (type === "requestTripForPhotoGrapher") {
        // forgot.render(locals, (err, results) => {
          // if (err) {
          //   return console.error(err);
          // }
          // var searchObj ={};
          // searchObj.driverId = responseObj.riderId;
          var DriverInfor = UserSchema.findOneAsync({ _id: responseObj.riderId })
          .then(foundUser => {
            if (foundUser !== null) {
              console.log(foundUser);
              console.log("foundUser");
              const requestTripForPhotoGrapher = `<html>
          <head>
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
              <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;" />
              <title>Taxi App</title>
              <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600" rel="stylesheet">
              <style type="text/css">
                  * {
                      font-family: 'Open Sans', sans-serif;
                      font-weight: 300;
                  }
              </style>
          </head>
          <body style="padding:0; margin:0; background: #f4f4f4;">
              <table style="max-width: 700px; width: 100%; border: 0; margin:20px auto;">
                  <tr>
                      <td>
                          <table style="border: 1px solid #d7d7d7; width: 100%; max-width: 700px; background: white; position:relative ">
                              <tr>
                                  <td style="background: #1B557A; height: auto; vertical-align: middle;">
                                      <div style=" padding: 10px 15px">
                                          <img style="width: 50px; border-radius: 50%;" src="http://res.cloudinary.com/dujorqozx/image/upload/v1587979921/yhrgxsgrhgviutgxsoqc.png" alt="KlixxApp" />
                                          <span style="display: inline-block; padding-left: 15px; vertical-align: top; color: #f4f4f4; font-size: 20px;"><br />KlixxApp</span>
                                      </div>
                                  </td>
                              </tr>
                              <tr>
                                  <td style="padding:40px 20px 0px 20px;">
                                      <h1 style="font-weight: 300;">
                                      Hi `+ fname +` `+ lname +`</h1>
                                      <div style="font-size:24px;">
                                        <p> Photo Session Location - `+responseObj.pickUpAddress+` </p>
                                        
                                        <p> Payment Mode - Card </p>
                                        <p> Client Name - `+foundUser.fname+` `+foundUser.lname+` </p>
                                        
                                      
                                      </div>
                                         
                                      <p style="margin:60px 0 40px 0; font-size: 18px;">Thanks<br />
                                      KlixxApp Team</p>
                                      <h1 style="text-align: center; font-weight: 300; font-size: 50px; margin:0;">
                                         
                                      </h1>
                                   
                                  </td>
                                    
                              </tr>
                              <tr>
                              <td>
                               <div style="background: #1B557A; height: 30px; width: 100%; position: absolute;text-align:center; padding-top: 10px;">
                                <a href="https://www.klixx.app/" style="color:#ddd">Contact Us</a>
                               </div>
                              </td>
                              </tr>
                            
                           
                          </table>
                      </td>
                  </tr>
                  
              </table>
          </body>
          </html>`

          const mailOptions = {
            from: "photo@klixx.app",//details.username, // sender address
            to: userObj.email, // list of receivers
            subject: "Photo Session Request", // Subject line
            // text: results.text, // plain text body
            html: requestTripForPhotoGrapher // html body
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log("error in emailApi", error);
              return error;
            }
            console.log("result in emailApi", info);
            return info;
          });
              // return res.send(returnObj);
            } 
          })
          // console.log(DriverInfor)
          
        // });
      }



    });
  });
}
export default sendEmail;
