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
    const userId = event.queryStringParameters.userId;
    
    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId is required' })
      };
    }

    // Query FaunaDB for the token
    const result = await client.query(
      q.Get(q.Match(q.Index('tokens_by_user'), userId))
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ token: result.data.token })
    };
  } catch (error) {
    // If the token is not found, return null (this is not an error)
    if (error.name === 'NotFound') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ token: null })
      };
    }

    // For other errors, return 500
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
