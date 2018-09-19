const mongoose = require('mongoose');

const moment = require('moment');

const Schema = mongoose.Schema;

/**
 * Chapter Schema
 */

const ChapterSchema = new Schema({
  id: { type: String, default: '', trim: true, unique: true},
  book_id: { type: String, default: '', trim: true},
  name: { type: String, default: '', trim: true, unique: true},
  content: { type: String, default: '', trim: true},
  create_time  : { type : Date, default : Date.now }
});

/**
 * Validations
 */
ChapterSchema.path('id').required(true, 'id cannot be blank');
ChapterSchema.path('book_id').required(true, 'book_id cannot be blank');
ChapterSchema.path('name').required(true, 'name cannot be blank');
ChapterSchema.path('content').required(true, 'content cannot be blank');

/**
 * Statics
 */


ChapterSchema.statics.add = function(chapter) {
    var params = {
        id: chapter.id,
        book_id: chapter.bookId,
        name: chapter.name,
        content: chapter.content,
    }
    var chapter = new Chapter(params);

    return chapter.save();
};

var Chapter = mongoose.model('Chapter', ChapterSchema);

/**
 * Pre-remove hook
 */

ChapterSchema.pre('remove', function (next) {
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

ChapterSchema.methods = {


};
