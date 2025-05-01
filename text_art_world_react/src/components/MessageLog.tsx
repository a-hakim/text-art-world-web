import React, { useEffect, useRef } from 'react';

// Define sender types (can be imported from context if preferred)
type MessageSender = 'player' | 'enemy' | 'system';

interface GameMessage {
  step: number;
  text: string;
  sender: MessageSender;
}

interface MessageLogProps {
  messages: GameMessage[]; // Update prop type
}

const MessageLog: React.FC<MessageLogProps> = ({ messages }) => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/50 shadow-inner aspect-video overflow-y-auto flex flex-col space-y-3">
      {messages.map((msg) => {
        let bubbleClasses = 'px-4 py-2 rounded-lg max-w-xs md:max-w-md lg:max-w-lg break-words ';
        let containerClasses = 'flex ';

        switch (msg.sender) {
          case 'player':
            bubbleClasses += 'bg-amber-600 text-white rounded-br-none';
            containerClasses += 'justify-end'; // Align right
            break;
          case 'enemy':
            bubbleClasses += 'bg-red-600 text-white rounded-bl-none';
            containerClasses += 'justify-start'; // Align left
            break;
          case 'system':
          default:
            bubbleClasses += 'bg-slate-600 text-slate-200 text-center text-xs italic py-1';
            containerClasses += 'justify-center'; // Align center
            break;
        }

        return (
          <div key={msg.step} className={containerClasses}>
            <div className={bubbleClasses}>
              {/* Optionally hide step number: <span className="text-slate-500 mr-2">[{msg.step}]</span> */}
              {msg.text}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageLog;
