const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const express = require('express');
const http = require('http');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const path = require('path');
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();
const httpServer = http.createServer(app);

const schema = makeExecutableSchema({ typeDefs, resolvers });

const server = new ApolloServer({
  schema,
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve static files from React's build directory
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Route all other requests to React's index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

server.start().then(() => {
  app.use('/graphql', expressMiddleware(server));
  httpServer.listen({ port: PORT }, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
});