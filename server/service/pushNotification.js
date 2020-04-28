import fetch from 'node-fetch';
import UserSchema from '../models/user';

const url = `https://onesignal.com/api/v1/notifications`;

function sendNotification(userId, notification) {
	UserSchema.findOneAsync({ _id: userId }).then(userObj => {
		console.log(userObj.deviceId)
		console.log("simran")
		if (!userObj) {
			throw new Error('No Such User Exist');
		}
		const App_id =userObj.userType === '2' ?'1ba8a78e-51c8-413d-97cc-2b6f0905818e':'5a6a6c51-f619-409f-acf6-410e1b4f1178'
			// userObj.userType === '1' ? 'df137503-fb26-4180-aebc-ca6835152506' : '96124b53-6eb7-4fdf-bd98-d188b51e28de';
		const Api_key =userObj.userType === '2' ?'NjZkZDg2YjktNjUyNS00Y2E3LWJjZGQtMWQ3Y2U4ZWRlZTBk':'YTZlNGU3YmQtMmE3ZS00YWE5LWEyZTItMDAyODVkNzNhMTlm'
		console.log()
			// userObj.userType === '1'? 'ZDU5ODgzMzUtNDhkYi00N2NhLWEzZjMtYzEzYzg3YjgwOTZm':'N2Q0YWY0OGQtODRkNi00YjQ3LWE2YzMtOGY3Mzg1YmNmMTMz';
		fetch(url, {
			method: 'POST',
			body: JSON.stringify({
				app_id: App_id,
				contents: { en: notification },
				include_player_ids: [userObj.deviceId],//['30ecabfa-3bc7-4c2b-b8a6-a5cb3245515f'], //userObj.deviceId
				data: { source: 'message' }
			}),
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Basic ' + Api_key
			}
		})
			.then(res => res.json())
			.then(data => {
				console.log('RESPONSE', data);
			})
			.catch(err => {
				console.log('ERROR', err);
			});
	});
}
export default sendNotification;
