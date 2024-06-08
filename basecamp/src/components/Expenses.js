import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../firebaseconfig";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { format } from "date-fns";
import "./expenses.css";

const Expenses = () => {
  const { roomId } = useParams();
  const [posts, setPosts] = useState([]);
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "rooms", roomId, "expenses"),
      (snapshot) => {
        const postList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postList);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  const createPost = async () => {
    if (
      personName.trim() === "" ||
      amount.trim() === "" ||
      reason.trim() === ""
    ) {
      setError("All fields are required");
      return;
    }

    try {
      const user = auth.currentUser;
      const postCollection = collection(db, "rooms", roomId, "expenses");
      await addDoc(postCollection, {
        personName,
        amount,
        reason,
        createdBy: user.uid,
        createdByName: user.displayName,
        createdAt: new Date(),
      });
      setPersonName("");
      setAmount("");
      setReason("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const deletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, "rooms", roomId, "expenses", postId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="debt-tracker-container">
      <h2>Debt Tracker</h2>
      <div className="debt-tracker-form">
        <input
          type="text"
          placeholder="Person's Name"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          type="text"
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <button onClick={createPost}>Add Post</button>
      </div>
      {error && <p className="debt-tracker-error">{error}</p>}
      <ul className="debt-tracker-list">
        {posts.map((post) => (
          <li key={post.id}>
            <div>
              <span>
                <strong>Person:</strong> {post.personName}
              </span>
              <span>
                <strong>Amount:</strong> {post.amount}
              </span>
              <span>
                <strong>Reason:</strong> {post.reason}
              </span>
              <span>
                <strong>Created by:</strong> {post.createdByName}
              </span>
              <span>
                <strong>Date:</strong>{" "}
                {format(post.createdAt.toDate(), "yyyy-MM-dd HH:mm")}
              </span>
            </div>
            {auth.currentUser.uid === post.createdBy && (
              <button onClick={() => deletePost(post.id)}>Delete</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Expenses;
