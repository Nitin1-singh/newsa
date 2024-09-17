const express = require("express");
const router = express.Router();
const {
  getAllArticles,
  voteArticle,
  handelRedo,
} = require("../controllers/articleController");
router.post("/getArticle", getAllArticles);
router.post("/vote", voteArticle);
router.post("/redoVote", handelRedo);

module.exports = router;
