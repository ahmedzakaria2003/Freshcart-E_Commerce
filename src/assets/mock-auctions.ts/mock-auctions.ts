export const MOCK_AUCTIONS = [
  {
    id: 1,
    name: "Canary Bird",
    category: "Birds",
    currentBid: 102.90,
    imageUrl: "https://cdn.pixabay.com/photo/2016/10/02/22/17/red-start-1711683_960_720.jpg",  
    location: "United States, New York",
    endTime: "2024-09-20T17:00:00Z",
    bids: [
      { bidderName: "Alice", amount: 95.00, timestamp: "2024-09-18T12:30:00Z" },
      { bidderName: "Bob", amount: 100.00, timestamp: "2024-09-19T15:45:00Z" }
    ]
  },
  {
    id: 2,
    name: "Porsche 911 Turbo",
    category: "Cars",
    currentBid: 50200.00,
    imageUrl: "https://cdn.pixabay.com/photo/2013/07/13/10/22/car-157851_960_720.png",  
    location: "Germany, Stuttgart",
    endTime: "2024-09-22T14:00:00Z",
    bids: [
      { bidderName: "David", amount: 48000.00, timestamp: "2024-09-19T08:00:00Z" }
    ]
  },
  {
    id: 3,
    name: "Vintage Leather Chair",
    category: "Furniture",
    currentBid: 230.50,
    imageUrl: "https://cdn.pixabay.com/photo/2016/11/19/15/36/chair-1837071_960_720.jpg", 
    location: "Italy, Milan",
    endTime: "2024-09-25T10:00:00Z",
    bids: [
      { bidderName: "Emma", amount: 200.00, timestamp: "2024-09-22T14:20:00Z" }
    ]
  },
  {
    id: 4,
    name: "Rolex Submariner",
    category: "Accessories",
    currentBid: 1500.00,
    imageUrl: "https://cdn.pixabay.com/photo/2016/07/27/12/54/watch-1548438_960_720.jpg", 
    endTime: "2024-09-28T15:00:00Z",
    bids: [
      { bidderName: "Noah", amount: 1200.00, timestamp: "2024-09-24T09:30:00Z" }
    ]
  },
  {
    id: 5,
    name: "iPhone 14 Pro Max",
    category: "Electronics",
    currentBid: 999.00,
    imageUrl: "https://cdn.pixabay.com/photo/2020/04/07/17/37/iphone-5017657_960_720.jpg",
    location: "United States, California",
    endTime: "2024-10-01T20:00:00Z",
    bids: [
      { bidderName: "Sophia", amount: 950.00, timestamp: "2024-09-29T11:15:00Z" }
    ]
  }
];
