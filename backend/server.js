const express = require("express");
const cors = require("cors"); // Import the cors middleware
const app = express();
const PORT = 3001;

let id = 0;

function generateJson() {
  id += 1;
  const timestamp = new Date().toISOString();
  const cameras = [];
  for (let cameraId = 1; cameraId <= 8; cameraId++) {
    cameras.push({
      cameraId,
      probability: Math.floor(Math.random() * 101),
    });
  }
  return { id, timestamp, cameras };
}

const corsOptions = {
  origin: "http://localhost:3000", // Allow requests only from your frontend's origin
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"], // Specify allowed methods if needed
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 204, // Some legacy browsers (IE11, various SmartTVs) choke on 200
};

app.use(cors(corsOptions));

// SSE endpoint
app.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendData = () => {
    const data = generateJson();
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Send first data immediately
  sendData();

  // Send data every 1 second
  const interval = setInterval(sendData, 1000);

  // Stop sending if client closes connection
  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
