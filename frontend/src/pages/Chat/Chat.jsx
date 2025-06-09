import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "./Chat.css";
import chaticon from "../../assets/chaticon.png";
import { assets } from "../../assets/assets";

const getInitialChatKey = () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      const identifier = parsedUser.mobileNumber || parsedUser._id || parsedUser.name;
      return `chatMessages_${identifier}`;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return "chatMessages_default";
    }
  }
  return "chatMessages_default";
};
//Socket
const socket = io("https://customer-desk-backend.onrender.com");

const Chat = () => {
  const navigate = useNavigate();
  const [chatKey] = useState(getInitialChatKey());
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [agentConnected, setAgentConnected] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const ticketIdRef = useRef(ticketId);
  const [userName, setUserName] = useState("User");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const messagesEndRef = useRef(null);
  const [conversationState, setConversationState] = useState("initial");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth <= 768);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    ticketIdRef.current = ticketId;
  }, [ticketId]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserName(parsedUser.name || "User");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const storedMessages = localStorage.getItem(chatKey);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      const defaultMsg = [{ sender: "bot", text: "Welcome! How can I assist you today?" }];
      setMessages(defaultMsg);
      localStorage.setItem(chatKey, JSON.stringify(defaultMsg));
    }
  }, [chatKey]);

  useEffect(() => {
    const persistable = messages.filter((msg) => typeof msg.text === "string");
    localStorage.setItem(chatKey, JSON.stringify(persistable));
  }, [messages, chatKey]);

  useEffect(() => {
    const identifier = chatKey.split("_")[1];
    const storedTicketId = localStorage.getItem(`ticketId_${identifier}`);
    console.log("Stored Ticket ID:", storedTicketId);
    if (storedTicketId && storedTicketId !== "undefined" && storedTicketId !== "null") {
      setTicketId(storedTicketId);
      ticketIdRef.current = storedTicketId;
      console.log("[JOIN ROOM] Emitting joinRoom with strdId:", storedTicketId);
      socket.emit("joinRoom", { roomId: storedTicketId });
      setAgentConnected(true);
    }
  }, [chatKey]);

  // Join room whenever ticketId changes and is valid
  useEffect(() => {
    if (ticketId && ticketId !== "undefined" && ticketId !== "null") {
      ticketIdRef.current = ticketId;
      console.log("[JOIN ROOM] Emitting joinRoom with ticketId:", ticketId);
      socket.emit("joinRoom", { roomId: ticketId });
    }
  }, [ticketId]);

  useEffect(() => {
    socket.on("connect", () => {
      if (ticketIdRef.current) {
        console.log("[JOIN ROOM] Emitting joinRoom with curId:", ticketIdRef.current);
        socket.emit("joinRoom", { roomId: ticketIdRef.current });
      }
    });
    return () => socket.off("connect");
  }, []);

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      if (data.roomId === ticketIdRef.current && data.sender !== "user") {
        setMessages((prev) => [
          ...prev,
          { sender: data.sender, text: data.message },
        ]);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [chatKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const updateMessages = (newMessage) => {
    setMessages((prev) => {
      const updated = [...prev, newMessage];
      const persistable = updated.filter((msg) => typeof msg.text === "string");
      localStorage.setItem(chatKey, JSON.stringify(persistable));
      return updated;
    });
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const msgToSend = input.trim();
    const userInput = msgToSend.toLowerCase();
    setInput("");

    const newMessage = { sender: "user", text: msgToSend };
    updateMessages(newMessage);

    if (userInput === "solved") {
      updateMessages({ sender: "bot", text: "Thank you, have a good day!" });
      updateMessages({ sender: "system", text: "Live chat ended. Start a new issue to reopen support." });
      setConversationState("post_solved");
      setAgentConnected(false);
      const identifier = chatKey.split("_")[1];
      localStorage.removeItem(`ticketId_${identifier}`);
      setTicketId(null);
      return;
    }

    if (agentConnected && ticketId) {
      socket.emit("sendMessage", { roomId: ticketId, sender: "user", message: msgToSend});
      return;
    }

    if (["hi", "hello", "hlo"].includes(userInput)) {
      updateMessages({ sender: "bot", text: `Hello ${userName}! How can I assist you today?` });
    } else if (userInput === "issues") {
      showOptions();
    } else if (conversationState === "post_solved" || !agentConnected || !ticketId) {
      setTimeout(() => {
        updateMessages({ sender: "bot", text: "Do you need further assistance?" });
        setTimeout(showOptions, 1000);
      }, 500);
    } else {
      setTimeout(() => {
        updateMessages({ sender: "bot", text: "Thank you for your message. We'll get back to you shortly." });
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const showOptions = () => {
    updateMessages({
      sender: "bot",
      text: (
        <div>
          To help you better, please select one of the following options:
          <div className="options">
            <button onClick={() => handleOptionClick("Order displaced")}>Order displaced</button>
            <button onClick={() => handleOptionClick("Delivery partner")}>Delivery partner</button>
            <button onClick={() => handleOptionClick("Payment issue")}>Payment issue</button>
          </div>
        </div>
      ),
    });
  };

  const handleOptionClick = async (option) => {
    updateMessages({ sender: "user", text: option });
    await createTicketFromChatbot(option);
  };

  const connectAgent = (ticketRoom) => {
    setAgentConnected(true);
    if (ticketRoom) {
      console.log("[JOIN ROOM] Emitting joinRoom with roomId:", ticketRoom);
      socket.emit("joinRoom", { roomId: ticketRoom }); // Always join as ticketId string
    }
    updateMessages({
      sender: "support",
      text: "Please stay in the chat while we connect you to our live agent.",
    });
  };

  const createTicketFromChatbot = async (issue) => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        updateMessages({ sender: "bot", text: "User data not found. Please log in again." });
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const { mobileNumber } = parsedUser;

      const response = await fetch("https://admin-92vt.onrender.com/api/tickets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issue, mobileNumber }),
      });

      if (!response.ok) throw new Error("Failed to create ticket");

      const data = await response.json();
      const generatedTicketId = data?.ticket?.ticketId;

      if (generatedTicketId) {
        setTicketId(generatedTicketId);
        const identifier = chatKey.split("_")[1];
        localStorage.setItem(`ticketId_${identifier}`, generatedTicketId);
        updateMessages({
          sender: "bot",
          text: `Your ticket ID is ${generatedTicketId}. Please wait while we process your request.`,
        });
        console.log("[JOIN ROOM] Emitting joinRoom with gId:", generatedTicketId);
        socket.emit("joinRoom", { roomId: generatedTicketId }); // Always join as ticketId string
        setTimeout(() => {
           connectAgent(generatedTicketId);
        }, 2000);
        setConversationState("active_ticket");
      } else {
        updateMessages({ sender: "bot", text: "Ticket created but ID missing. Please try again." });
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      updateMessages({ sender: "bot", text: "Something went wrong while creating ticket." });
    }
  };

  const navigateHome = () => {
    navigate("/");
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleClose = () => {
    setIsChatVisible(false);
  };

  return (
    <div>
      {isMinimized ? (
        <img src={chaticon} alt="Chat Icon" className="chat-icon" onClick={() => setIsMinimized(false)} />
      ) : (
        isChatVisible && (
          <div className={`chat-page-wrapper ${isMobile ? "fullscreen" : ""}`}>
            <div className="chat-container">
              <div className="chat-header">
                NoVeg Chat Support
                <button className="minimize-btn" onClick={handleMinimize}>⎯</button>
                <button className="chat-close-btn" onClick={handleClose}>X</button>
              </div>
              <div className="chat-messages">
                {messages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.sender}`}>
                    {typeof msg.text === "string" ? msg.text : msg.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input-container">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button onClick={handleSend} className="send-btn">
                  <img src={assets.send_btn_icon} alt="Send" />
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Chat;
