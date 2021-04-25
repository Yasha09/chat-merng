const bcrypt = require('bcryptjs')
const {UserInputError, AuthenticationError} = require('apollo-server')
const jwt = require('jsonwebtoken')

const User = require('../models/User');
const {JWT_SECRET} = require('../config/env.json')

module.exports = {
  Query: {
    getUsers: async () => {
      try {
        const users = await User.find({})
        return users
      } catch (err) {
        console.log(err)
      }
    },
    login: async (_, args) => {
      const {username, password} = args;
      const errors = {};


      try {
        // Empty Check
        if (username.trim() === '') errors.username = 'username must not be empty'
        if (password === '') errors.password = 'password must not be empty'
        if (Object.keys(errors).length > 0) {
          throw new UserInputError('bad input', {errors})
        }

        // DB Check if user has
        const user = await User.findOne({username});
        if (!user) {
          errors.username = 'user not found';
          throw new UserInputError('user not found', {errors})
        }

        // Check password
        const correctPassword = await bcrypt.compare(password, user.password)
        if (!correctPassword) {
          errors.password = 'password is incorrect';
          throw new AuthenticationError('password is incorrect')
        }
        const token = jwt.sign({username}, JWT_SECRET, {expiresIn: 60 * 60})
        user.token = token
        return user
      } catch (err) {
        console.log(err);
        throw err
      }
    }
  },

  // Mutation
  Mutation: {
    register: async (_, args,) => {
      let {username, email, password, confirmPassword} = args
      const errors = {}

      try {
        //  TODO Validate input data
        if (username.trim() === '') errors.username = 'username must not ne empty';
        if (email.trim() === '') errors.email = 'email must not ne empty';
        if (password.trim() === '') errors.password = 'password must not ne empty';
        if (confirmPassword.trim() === '') errors.confirmPassword = 'confirmPassword must not ne empty'

        if (password !== confirmPassword) errors.confirmPassword = 'password must match';

        //  TODO Check if username / email exists
        // const userByUsername = await User.findOne({username})
        // const userByEmail = await User.findOne({email})
        //
        // if (userByUsername) errors.username = 'Username is taken'
        // if (userByEmail) errors.username = 'Email is taken'

        if (Object.keys(errors).length > 0) {
          throw errors
        }

        // Hash password
        password = await bcrypt.hash(password, 6)
        // Create user
        const user = new User({
          username,
          email,
          password,
        })
        // Return user
        return await user.save()
      } catch (err) {
        console.log(err)
        if (err.name === "MongoError") {
          errors[Object.keys(err.keyValue)] = `${Object.keys(err.keyValue)} is already taken`
        }
        throw new UserInputError('Bad input', {errors})
      }
    }
  }
}
