const mongoose = require('mongoose');

const moment = require('moment');

const Schema = mongoose.Schema;

/**
 * Book Schema
 */

const BookSchema = new Schema({
  id: {type: String, default: '', trim: true, unique: true},
  name: { type: String, default: '', trim: true, unique: true},
  create_time  : { type : Date, default : Date.now }
});

/**
 * Validations
 */
BookSchema.path('id').required(true, 'id cannot be blank');
BookSchema.path('name').required(true, 'name cannot be blank');

/**
 * Statics
 */

BookSchema.statics.add = function(book) {
    var params = {
        id: book.id,
        name: book.name,
    }
    var book = new Book(params);

    return book.save();
};

var Book = mongoose.model('Book', BookSchema);

/**
 * Pre-remove hook
 */

BookSchema.pre('remove', function (next) {
  // const imager = new Imager(imagerConfig, 'S3');
  // const files = this.image.files;

  // if there are files associated with the item, remove from the cloud too
  // imager.remove(files, function (err) {
  //   if (err) return next(err);
  // }, 'article');

  next();
});

/**
 * Methods
 */

BookSchema.methods = {


};
