import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { corsOptions } from "./options/index.js";
import { connectToDB } from "./services/index.js";
import { Document } from "./models/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to MongoDB
connectToDB();

// Set up socket.io server
const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});


io.on("connection", (socket) => {
  console.log("A user connected");

  let documentRoomID = null, userID = null;

  socket.on("get-document", async ({ documentID, username }) => {
    try {
      let doc = await Document.findById({ _id: documentID });

      if (!doc) {
        socket.emit("error-document-not-found", "Document not found");
        return;
      }
      else {
        doc.lastAccessed = Date.now();
        await doc.save();
        socket.emit("load-document", doc.content);
      }
    } catch (err) {
      console.log("Error getting document: ", err);
    }

    socket.join(documentID);
    documentRoomID = documentID;
    userID = username;

    socket.on("send-changes", (delta) => {
      socket.to(documentID).emit("receive-changes", delta);
    });

    socket.on("save-document", async (content) => {
      let doc = await Document.findById({ _id: documentID });
      doc.content = content;
      doc.modifiedAt = Date.now();
      await doc.save();
    });

    socket.on("send-cursor", (data) => {
      socket.to(documentID).emit("receive-cursor", data);
    });
  });

  socket.on("disconnect", () => {
    socket.to(documentRoomID).emit("delete-cursor", userID);
    console.log("A user disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});