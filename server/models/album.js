import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const AlbumSchema = new Schema({
  photographerId: { type: Schema.Types.ObjectId, ref: 'User' },
  // driverId: { type: Schema.Types.ObjectId, ref: 'User' },
  // tripId: { type: Schema.Types.ObjectId, ref: 'trip' },
  // srcLoc: {
  //   type: [Number],
  //   index: '2d'
  // },
  // destLoc: {
  //   type: [Number],
  //   index: '2d'
  // },
  albumName: { type: String },
  location: { type: String },
  // AlbumIssue: { type: String, default: 'busy' },
  // pickUpAddress: { type: String, default: null },
  // destAddress: { type: String, default: null },
  // latitudeDelta: { type: Number, default: 0.012 },
  // longitudeDelta: { type: Number, default: 0.012 },
  postedAt: { type: Date, default: Date.now },
  eventOn: { type: Date },

});




export default mongoose.model('album', AlbumSchema);
