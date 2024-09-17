const { default: axios } = require("axios");
const Vote = require("../models/article");

async function getAllArticles(req, res) {
  const sessionId = req.ip;
  try {
    const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
      params: {
        country: "us",
        apiKey: process.env.NEWSAPI_KEY,
      },
    });
    const articles = response.data.articles;
    const votes = await Vote.find({
      articleUrl: { $in: articles.map((a) => a.url) },
    });

    // Map articles with corresponding votes
    const articlesWithVotes = articles.map((article) => {
      const voteRecord = votes.find((v) => v.articleUrl === article.url) || {
        votes: {
          upvotes: 0,
          downvotes: 0,
        },
        voters: [],
      };
      const voteScore = voteRecord.votes.upvotes - voteRecord.votes.downvotes;
      const userVote = voteRecord.voters.find((v) => v.sessionId === sessionId);
      // console.log(voteRecord, userVote);
      return {
        ...article,
        votes: voteRecord.votes,
        voteScore,
        hasUpvoted: userVote ? userVote.voteType === "upvote" : false,
        hasDownvoted: userVote ? userVote.voteType === "downvote" : false,
      };
    });
    articlesWithVotes.sort((a, b) => b.voteScore - a.voteScore);
    res.json(articlesWithVotes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching articles" });
  }
}
async function voteArticle(req, res) {
  const { url, voteType } = req.body;
  const sessionId = req.ip;

  try {
    let voteRecord = await Vote.findOne({ articleUrl: url });

    if (!voteRecord) {
      voteRecord = new Vote({ articleUrl: url });
    }

    // Determine current vote type
    let currentVoteType = null;
    for (let vote of voteRecord.voters) {
      if (vote.sessionId === sessionId) {
        currentVoteType = vote.voteType;
        break;
      }
    }

    if (currentVoteType) {
      // If a vote already exists, adjust counts based on the change
      if (currentVoteType === "upvote") {
        voteRecord.votes.upvotes -= 1;
      } else if (currentVoteType === "downvote") {
        voteRecord.votes.downvotes -= 1;
      }

      // Update to new vote
      if (voteType === "upvote") {
        voteRecord.votes.upvotes += 1;
      } else if (voteType === "downvote") {
        voteRecord.votes.downvotes += 1;
      }

      // Update the vote record
      const voteIndex = voteRecord.voters.findIndex(
        (v) => v.sessionId === sessionId
      );
      voteRecord.voters[voteIndex].voteType = voteType;
    } else {
      // Add a new vote
      if (voteType === "upvote") {
        voteRecord.votes.upvotes += 1;
      } else if (voteType === "downvote") {
        voteRecord.votes.downvotes += 1;
      }

      // Add the new vote
      voteRecord.voters.push({ sessionId, voteType });
    }

    await voteRecord.save();
    res.json({ success: true, votes: voteRecord.votes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error voting on article" });
  }
}
async function handelRedo(req, res) {
  const { url, voteType } = req.body;
  const sessionId = req.ip;

  try {
    let voteRecord = await Vote.findOne({ articleUrl: url });
    const existingVote = voteRecord.voters.find(
      (v) => v.sessionId === sessionId
    );
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        voteRecord.votes[`${existingVote.voteType}s`]--;
        voteRecord.voters = voteRecord.voters.filter(
          (v) => v.sessionId !== sessionId
        );
        await voteRecord.save();
        res.status(200).json({ success: true, votes: voteRecord.votes });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error voting on article" });
  }
}

module.exports = { getAllArticles, voteArticle, handelRedo };
