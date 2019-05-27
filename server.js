var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");
var db = require("./models");

const PORT = process.env.PORT || 3000;

var app = express();

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/fark", { useNewUrlParser: true });

app.get("/", function (req, res) {
  res.render("index");
});
app.get("/scrape", function (req, res) {
  var results = [];
  axios.get('https://www.fark.com').then(function (response) {
    var $ = cheerio.load(response.data);
    $("tr[class^='headlineRow id']").each(function (i, elem) {
      let tmp = $(this).find(".outbound_link");
      let title = $(this).find("a.outbound_link").text();
      let link = $(this).find(".outbound_link").attr("href");
      results.push({
        "number": i,
        "title": title,
        "link": link
      });

    });
    var hbsObject = {
      results: results
    };
    res.render("choose", hbsObject);
  });
});

app.get("/articles", function (req, res) {
  let articles = [];
  let zz = 0;
  db.Article.find({})
    .then(article => {
      zz++;
      article.forEach(function (elem, i) {
        articles.push({
          "number": i,
          "title": elem.title,
          "link": elem.link,
          "id": elem._id
        });
      });
      var hbsObject = {
        articles: articles
      };
      res.render("articles", hbsObject);

    })
    .catch(err => {
      console.log("/article mongo fail");
    });

  app.delete("/delete_article/:id", function (req, res) {
    let delete_id = req.params.id
    db.Article.findByIdAndRemove(delete_id, (err, todo) => {
      if (err) return res.status(500).send(err);
      const response = {
        message: "successfully deleted"//,
      };
      return res.status(200).send(response);
    });

  });
  app.delete("/delete_note/:id", function (req, res) {
    let delete_id = req.params.id
    db.Note.findByIdAndRemove(delete_id, (err, todo) => {
      if (err) return res.status(500).send(err);
      const response = {
        message: "successfully deleted",
      }
      return res.status(200).send(response);
    });

  });
});

app.post("/post_comment", function (req, res) {
  var newNote = new db.Note({
    noteID: req.body.article,
    title: "title",
    body: req.body.comment,
    myID: req.body.article  
  });
  newNote.save();

});
app.get("/get_comments/:id", function (req, res) {
  let articles = [];
  let notes = [];
  let zz = 0;

  db.Note.find({ myID: req.params.id })
    .then(note => {
      zz++;
      note.forEach(function (elem, i) {
        notes.push({
          "number": i,
          "body": elem.body,
          "_id": elem._id,
        });
      });
      var hbsObject = {
        notes: notes
      };
      res.json(hbsObject);
    })
    .catch(err => {
      console.log("/comments mongo fail");
    });
});

app.post("/post_article", function (req, res) {
  db.Article.findOneAndUpdate({ link: req.body.link }, { link: req.body.link, title: req.body.title }, { upsert: true }, function (err, doc) {
    if (err) return res.send(500, { error: err });
    return res.send("succesfully saved");
  });
});

app.get("/articles/:id", function (req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.post("/noparticles/:id", function (req, res) {
  db.Note.create(req.body)
    .then(function (dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});
// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
