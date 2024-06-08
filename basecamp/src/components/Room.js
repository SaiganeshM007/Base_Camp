import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, Routes, Route } from "react-router-dom";
import { auth, db } from "../firebaseconfig";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import ChoreList from "./ChoreList";
import Expenses from "./Expenses";
import "./Room.css";

const Room = () => {
  const { roomId } = useParams();
  const [currentUserNickname, setCurrentUserNickname] = useState("");
  const [roomMembers, setRoomMembers] = useState([]);
  const [roomNickname, setRoomNickname] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("No user is currently logged in");

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setCurrentUserNickname(userDoc.data().displayName);
        } else {
          throw new Error("User data not found");
        }

        const roomRef = doc(db, "rooms", roomId);
        const unsubscribe = onSnapshot(roomRef, (roomDoc) => {
          if (!roomDoc.exists()) {
            throw new Error("Room not found");
          }

          const roomData = roomDoc.data();
          const memberIds = roomData.members || [];
          const roomMessages = roomData.messages || [];

          Promise.all(
            memberIds.map(async (memberId) => {
              const memberDoc = await getDoc(doc(db, "users", memberId));
              return memberDoc.exists()
                ? memberDoc.data().displayName
                : "Unknown";
            })
          ).then(setRoomMembers);

          setRoomNickname(roomData.nickname || "Unnamed Room");
          setMessages(roomMessages);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;
    const message = {
      nickname: currentUserNickname,
      text: newMessage,
      timestamp: new Date(),
    };

    try {
      const roomRef = doc(db, "rooms", roomId);
      await updateDoc(roomRef, {
        messages: arrayUnion(message),
      });
      setNewMessage("");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="room-container">
      <div className="sidebar">
        <h2>{roomNickname}</h2>
        <p className="small-text">Room ID: {roomId}</p>
        <p>Current User: {currentUserNickname}</p>
        <h3>Room Members:</h3>
        <ul>
          {roomMembers.map((nickname, index) => (
            <li key={index}>{nickname}</li>
          ))}
        </ul>
        <nav>
          <ul>
            <li>
              <Link to="chorelist">Task List</Link>
            </li>
            <li>
              <Link to="expenses">Debt Tracker</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="content">
        <Routes>
          <Route path="chorelist" element={<ChoreList />} />
          <Route path="expenses" element={<Expenses />} />
          <Route
            path="/"
            element={
              <>
                <h3>Messages:</h3>
                <div className="messages-container">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`message ${
                        message.nickname === currentUserNickname
                          ? "sent"
                          : "received"
                      }`}
                    >
                      <strong>{message.nickname}</strong>: {message.text}
                    </div>
                  ))}
                  <div ref={messagesEndRef}></div>
                </div>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button onClick={handleSendMessage}>Send</button>
              </>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default Room;
