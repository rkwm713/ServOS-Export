import fetch from 'node-fetch';

export const handler = async function (event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    try {
        if (!event.body) {
            throw new Error('Request body is missing');
        }
        
        const { boardId, token } = JSON.parse(event.body);
        if (!boardId || !token) {
            throw new Error('boardId and token are required');
        }

        const apiKey = process.env.TRELLO_API_KEY;

        const listsURL = `https://api.trello.com/1/boards/${boardId}/lists?fields=name,id&key=${apiKey}&token=${token}`;
        const cardsURL = `https://api.trello.com/1/boards/${boardId}/cards?fields=name,idList,labels,idMembers&key=${apiKey}&token=${token}`;

        const [lists, cards] = await Promise.all([
            fetch(listsURL).then(res => res.json()),
            fetch(cardsURL).then(res => res.json())
        ]);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ lists, cards })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
