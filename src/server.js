// backend.js - A basic setup for auction backend using Node.js and WebSockets
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Create an Express application
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Dummy Auction Data
let auctions = [
  { id: 1, name: 'Antique Vase', currentBid: 100, status: 'Open', winner: null },
  { id: 2, name: 'Vintage Painting', currentBid: 500, status: 'Open', winner: null }
];

// Set up an endpoint to get all auction data
app.get('/api/auctions', (req, res) => {
  res.json(auctions);
});

// Set up WebSocket for live auction updates
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for new bids from users
  socket.on('newBid', (data) => {
    const { auctionId, bidAmount, user } = data;

    // Find the auction and update the bid if the new bid is higher
    let auction = auctions.find((a) => a.id === auctionId);
    if (auction && bidAmount > auction.currentBid) {
      auction.currentBid = bidAmount;
      auction.winner = user;
      io.emit('auctionUpdate', auction); // Broadcast the updated auction to all clients
    }
  });

  // When the user disconnects
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Set up a route to handle auction creation (just for demonstration)
app.post('/api/createAuction', (req, res) => {
  const { name, startingBid } = req.body;
  const newAuction = {
    id: auctions.length + 1,
    name,
    currentBid: startingBid,
    status: 'Open',
    winner: null,
  };
  auctions.push(newAuction);
  res.status(201).json(newAuction);
});

// Start the server on port 3000
server.listen(3000, () => {
  console.log('Backend server is running on http://localhost:3000');
});
