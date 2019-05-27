const axios = require("axios")
const cheerio = require("cheerio");
const express = require("express");
const router = express.Router();


router.get("/", function(req, res) {
    console.log("getroot");
    res.render("");
}); 





router.get("/scrape", function(req, res) {
  var results = [];
  axios.get('https://www.fark.com').then(function(response) {
    var $ = cheerio.load(response.data);
   
    $("tr[class^='headlineRow id']").each(function (i, elem) {
      let tmp = $(this).find(".outbound_link");
      var title = $(this).find("a.outbound_link").text();
      var link =  $(this).find(".outbound_link").attr("href");
      results.push( { 
        "number" : i,
        "title" : title,
        "link": link
      });  
    });

      console.log("results:" + results);
      var hbsObject = {
        results: results
      };
      res.render("choose", hbsObject);
  });
});


router.post("/post/:link", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      console.log("upserting" req.params.link )
      return db.Article.findOneAndUpdate({ link : req.params.link }, { link: "dbNote._id" }, { upsert: true, new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

});

// Export routes for server.js to use.
module.exports = router;
