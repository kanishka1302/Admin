import React, { useContext } from "react";
import { StoreContext } from "../../Context/StoreContext";
import "./UserInfo.css";

const UserInfo = () => {
  const { user } = useContext(StoreContext); // Access user data from context

  if (!user) {
    return (
      <div className="userinfo">
        <h1>User Information</h1>
        <p>User data is not available. Please register or log in.</p>
      </div>
    );
  }

  return (
    <div className="userinfo">
      <h1>User Information</h1>
      <p><strong>Name:</strong> {user.name || "N/A"}</p>
      <p><strong>Email ID:</strong> {user.email || "N/A"}</p>
      <p><strong>Mobile No:</strong> {user.mobileNumber || "N/A"}</p>
      <button className="edit-button">Edit Information</button>
    </div>
  );
};

export default UserInfo;
