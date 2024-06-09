
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseconfig";
import { collection, addDoc, updateDoc, doc, getDoc } from "firebase/firestore";
import "./dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      getDoc(userRef).then((doc) => {
        if (!doc.exists()) {
          addDoc(collection(db, "users"), {
            uid: user.uid,
            displayName: user.displayName,
            rooms: [],
          });
        } else {
          const userData = doc.data();
          if (userData.rooms.length > 0) {
            navigate(`/rooms/${userData.rooms[0]}`);
          }
        }
      });
    }
  }, [navigate]);

  const handleCreateRoom = async () => {
    if (nickname.trim() === "") {
      setError("Room nickname cannot be empty");
      return;
    }
    try {
      const user = auth.currentUser;
      const userRef = doc(db, "users", user.uid);
      const roomRef = await addDoc(collection(db, "rooms"), {
        createdBy: user.uid,
        createdAt: new Date(),
        nickname: nickname,
        members: [user.uid],
      });
      console.log("Room created with ID:", roomRef.id);
      await updateDoc(userRef, {
        rooms: [roomRef.id],
      });
      navigate(`/rooms/${roomRef.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleJoinRoom = async (roomId) => {
    if (roomId.trim() === "") {
      setError("Room ID cannot be empty");
      return;
    }

    try {
      const user = auth.currentUser;
      const userRef = doc(db, "users", user.uid);
      const roomRef = doc(db, "rooms", roomId);

      // Update user's rooms array
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedRooms = [...(userData.rooms || []), roomId];
        await updateDoc(userRef, { rooms: updatedRooms });
      }

      // Update room's members array
      const roomDoc = await getDoc(roomRef);
      if (roomDoc.exists()) {
        const roomData = roomDoc.data();
        const updatedMembers = [...(roomData.members || []), user.uid];
        await updateDoc(roomRef, { members: updatedMembers });
      }

      navigate(`/rooms/${roomId}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <div className="dashboard-inputs">
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter Room Name"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <button onClick={handleCreateRoom}>Create Room</button>
        </div>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter Room ID to Join"
            onKeyPress={(e) => {
              if (e.key === "Enter") handleJoinRoom(e.target.value);
            }}
          />
        </div>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Dashboard;
