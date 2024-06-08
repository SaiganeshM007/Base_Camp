import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../firebaseconfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { format } from "date-fns";
import "./ChoreList.css";

const ChoreList = () => {
  const { roomId } = useParams();
  const [chores, setChores] = useState([]);
  const [newChore, setNewChore] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "rooms", roomId, "chores"),
      (snapshot) => {
        const choreList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChores(choreList);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [roomId]);

  const handleAddChore = async () => {
    if (newChore.trim() === "") {
      setError("Chore cannot be empty");
      return;
    }
    const user = auth.currentUser;
    try {
      const choresCollection = collection(db, "rooms", roomId, "chores");
      await addDoc(choresCollection, {
        text: newChore,
        createdBy: user.uid,
        createdByName: user.displayName,
        createdAt: new Date(),
        done: false,
        doneBy: "",
        doneByName: "",
      });
      setNewChore("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleChore = async (choreId, done) => {
    const user = auth.currentUser;
    try {
      const choreDoc = doc(db, "rooms", roomId, "chores", choreId);
      await updateDoc(choreDoc, {
        done: !done,
        doneBy: done ? "" : user.uid,
        doneByName: done ? "" : user.displayName,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteChore = async (choreId, createdBy) => {
    const user = auth.currentUser;
    if (user.uid !== createdBy) {
      setError("Only the creator can delete this chore");
      return;
    }
    try {
      const choreDoc = doc(db, "rooms", roomId, "chores", choreId);
      await deleteDoc(choreDoc);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Task List</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        value={newChore}
        onChange={(e) => setNewChore(e.target.value)}
        placeholder="Add a new chore"
      />
      <button onClick={handleAddChore}>Add Task</button>
      <ul>
        {chores.map((chore) => (
          <li key={chore.id}>
            <span>{chore.text}</span>
            <span>
              {" "}
              - Created by: {chore.createdByName} at{" "}
              {format(chore.createdAt.toDate(), "yyyy-MM-dd HH:mm")}
            </span>
            {chore.done && <span> - Completed by: {chore.doneByName}</span>}
            <input
              type="checkbox"
              checked={chore.done}
              onChange={() => handleToggleChore(chore.id, chore.done)}
            />
            {auth.currentUser.uid === chore.createdBy && (
              <button
                onClick={() => handleDeleteChore(chore.id, chore.createdBy)}
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChoreList;
