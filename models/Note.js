var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new NoteSchema object
// This is similar to a Sequelize model
var NoteSchema = new Schema({
  // `title` is of type String
  _articleID: {
    type: Schema.Types.ObjectId,
    ref: "Article"
},
  title: String,
  // `body` is of type String
  body: String,
  myID : String,
});

// This creates our model from the above schema, using mongoose's model method
var Note = mongoose.model("Note", NoteSchema);
console.log('note mongoose');
// Export the Note model
module.exports = Note;
