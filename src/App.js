import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function App() {
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem("chatMessages");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  // Save last 3 Q&A in session storage
  useEffect(() => {
    const lastThreePairs = [];
    let pair = [];

    messages.forEach((msg) => {
      pair.push(msg);
      if (pair.length === 2) {
        lastThreePairs.push(pair);
        pair = [];
      }
    });

    const lastThree = lastThreePairs.slice(-3).flat();
    sessionStorage.setItem("chatMessages", JSON.stringify(lastThree));
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      console.log("Backend response:", data); // 👈 Debug here
      const botMsg = { sender: "bot", text: data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const botMsg = { sender: "bot", text: "_Error contacting the server._" };
      setMessages((prev) => [...prev, botMsg]);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">ChatBot</h1>

      {/* History Toggle */}
      <button
        onClick={() => setShowHistory((prev) => !prev)}
        className="mb-4 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
      >
        {showHistory ? "Hide History" : "Show Last 3 Q&A"}
      </button>

      {showHistory && (
        <div className="bg-gray-800 p-4 rounded-lg mb-4 max-w-2xl w-full">
          <h2 className="text-lg font-semibold mb-2">Last 3 Q&A</h2>
          {JSON.parse(sessionStorage.getItem("chatMessages") || "[]").map(
            (msg, idx) => (
              <div
                key={idx}
                className={`mb-2 ${
                  msg.sender === "user" ? "text-blue-400" : "text-green-400"
                }`}
              >
                <strong>{msg.sender === "user" ? "You" : "Bot"}:</strong>{" "}
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            )
          )}
        </div>
      )}

      {/* Chat Window */}
      <div className="flex flex-col space-y-4 max-w-2xl w-full flex-grow overflow-y-auto mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === "bot" ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.sender === "bot"
                  ? "bg-gray-800 text-white"
                  : "bg-blue-600 text-white"
              }`}
            >
              {msg.sender === "bot" ? (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.text}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="flex max-w-2xl w-full space-x-2">
        <input
          type="text"
          className="flex-grow p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
        >
          Send
        </button>
      </div>
    </div>
  );
}
