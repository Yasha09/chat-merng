const {ApolloServer, gql} = require('apollo-server')
const mongoose = require('mongoose')

const {DB_URL}=require('./config/env.json')
const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')

const server = new ApolloServer({
  typeDefs,
  resolvers
})

mongoose.connect(DB_URL,
  {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}
)
  .then(() => {
    console.log('Mongodb connected successfully')
    return server.listen({port: 4000})
  })
  .then(res => {
    console.log(`Server running at ${res.url}`)
  })

