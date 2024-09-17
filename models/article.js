const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  articleUrl: { type: String, unique: true }, // Link to the article by URL
  votes: {
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
  },
  voters: [
    {
      sessionId: {
        type: String,
        required: true, // Identifier for the session or user
      },
      voteType: {
        type: String,
        enum: ["upvote", "downvote"], // Vote type can only be 'upvote' or 'downvote'
        required: true,
      },
    },
  ], // List of user IDs or session IDs who voted
});

const Vote = mongoose.model("Vote", voteSchema);

module.exports = Vote;
