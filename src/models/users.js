import { model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const saltRounds = 10;

const UserSchema = new Schema({
  // this name is purely for decorative purposes, e.g., in a gradebook
  name: { type: String, trim: true },

  // the email is also a username
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true    
  },

  guest: {
    type: Boolean,
    default: false
  },
  
  password: {
    type: String,
    trim: true,
    // not `required: true` because guest users don't have passwords.
  },
});

// because we permit user look-ups based on email
UserSchema.index({"email": 1});

// hash user password before database save
UserSchema.pre('save', function(next){
  if (!this.isModified('password')) {
    return next();
  }

  if (this.password) {
    this.password = bcrypt.hashSync(this.password, saltRounds);
  }

  return next();
});


UserSchema.methods.canView = function(anotherUser) {
  if (this._id.equals(anotherUser._id)) return true;

  return false;
};

UserSchema.methods.canEdit = function(anotherUser) {
  if (this._id.equals(anotherUser._id)) return true;  

  return false;
};

function yes() { return true; }
UserSchema.methods.canCreateCourses = yes;
UserSchema.methods.canViewCourse = yes;

UserSchema.methods.canUpdateCourse = function(course) {
  return course.instructors.indexOf( this.id ) >= 0;
};

UserSchema.methods.canPutProgress = UserSchema.methods.canEdit;

UserSchema.methods.canPostStatement = UserSchema.methods.canEdit;

UserSchema.set('toJSON', {
     transform: function (doc, ret, options) {
         ret.id = ret._id;
         delete ret._id;
         delete ret.__v;
     }
});

export default model('User', UserSchema);
