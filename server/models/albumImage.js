import mongoose from "mongoose";

const Schema = mongoose.Schema;

const albumImageSchema = new Schema({
  albumId: { type: Schema.Types.ObjectId, ref: "album" },
  imageUrl: { type: String, default: null },
  postedAt: { type: Date, default: Date.now() }
});

export default mongoose.model("albumImage", albumImageSchema);
