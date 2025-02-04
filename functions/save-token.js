const faunadb = require('faunadb');
const q = faunadb.query;

// Initialize FaunaDB client with your secret key
const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET_KEY
});

exports.handler = async function(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  try {
    // Parse the request body
    const { userId, token } = JSON.parse(event.body);

    if (!userId || !token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId and token are required' })
      };
    }

    // Save or update the token in FaunaDB
    await client.query(
      q.Replace(
        q.Select(
          'ref',
          q.Get(q.Match(q.Index('tokens_by_user'), userId)),
          q.Create(q.Collection('tokens'), { data: { userId, token } })
        ),
        { data: { userId, token } }
      )
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Token saved successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
