const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require ('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim:  true

    },
    age: {
        type: Number
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate(value){
            if (!validator.isEmail(value)){
                throw new Error ('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7
    },
    tokens: [{
        token:{
            type: String,
            required: true
        }
    }],
    profilepic:{
        type: Buffer
    }
},{
    timestamps: true
})

userSchema.virtual('tasks',{
    ref: 'Tasks',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.statics.findByCredentials = async(email,password)=>{
    const user = await User.findOne({email})
    if(!user)
    {throw new Error('Unable to login.')}
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('Unable to login.')
    }
    return user
}

userSchema.methods.generateAuthToken = async function (next) {
    const token = jwt.sign({_id: this._id.toString() }, 'thisismysupersecretkey')
    this.tokens= this.tokens.concat({token})
    this.save()
    return token
}

userSchema.methods.getPublicProfile = function (){
    let userObject = this.toObject()
    delete userObject.password
    delete userObject.tokens
    delete  userObject.profilepic
    return userObject
}

//hash password before saving user
userSchema.pre('save', async function(next) {
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,8)
    }
    next()
})

//remove user tasks when user is deleted
userSchema.pre('delete',async function  (next){
    await Task.deleteMany({owner: this._id})
    next()
})

const User = mongoose.model('User',userSchema)
module.exports = User