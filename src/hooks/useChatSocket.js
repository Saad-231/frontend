import { useEffect, useRef, useCallback, useState } from 'react';
import { getSocket } from '../services/socket';

/**
 * Encapsulates all socket.io chat streaming logic.
 *
 * Returns:
 *  - messages: full message list for the active chat (including the
 *    in-progress streaming assistant message)
 *  - sendMessage(content, attachments)
 *  - stopGeneration()
 *  - isStreaming
 */
export function useChatSocket({ chatId, userId, onChatCreated, onLimitReached, onAssistantDone }) {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingTextRef = useRef('');
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = getSocket();
    const socket = socketRef.current;

    const handleUserMessage = ({ chatId: incomingChatId, message }) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      if (onChatCreated) onChatCreated(incomingChatId);
    };

    const handleToken = ({ token }) => {
      streamingTextRef.current += token;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant' && last.streaming) {
          const updated = [...prev];
          updated[updated.length - 1] = { ...last, content: streamingTextRef.current };
          return updated;
        }
        return [
          ...prev,
          {
            id: 'streaming-temp',
            role: 'assistant',
            type: 'text',
            content: streamingTextRef.current,
            streaming: true,
          },
        ];
      });
    };

    const handleDone = ({ message }) => {
      streamingTextRef.current = '';
      setIsStreaming(false);
      setMessages((prev) => {
        const withoutStreaming = prev.filter((m) => m.id !== 'streaming-temp');
        return [...withoutStreaming, message];
      });
      if (onAssistantDone) onAssistantDone(message);
    };

    const handleError = ({ error }) => {
      streamingTextRef.current = '';
      setIsStreaming(false);
      setMessages((prev) => {
        const withoutStreaming = prev.filter((m) => m.id !== 'streaming-temp');
        return [
          ...withoutStreaming,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            type: 'error',
            content: error || 'Something went wrong.',
          },
        ];
      });
    };

    const handleLimitReached = (payload) => {
      setIsStreaming(false);
      if (onLimitReached) onLimitReached(payload);
    };

    socket.on('chat:user-message', handleUserMessage);
    socket.on('chat:token', handleToken);
    socket.on('chat:done', handleDone);
    socket.on('chat:error', handleError);
    socket.on('chat:limit-reached', handleLimitReached);

    return () => {
      socket.off('chat:user-message', handleUserMessage);
      socket.off('chat:token', handleToken);
      socket.off('chat:done', handleDone);
      socket.off('chat:error', handleError);
      socket.off('chat:limit-reached', handleLimitReached);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChatCreated, onLimitReached, onAssistantDone]);

  const sendMessage = useCallback(
    (content, attachments = []) => {
      if (!content?.trim()) return;
      streamingTextRef.current = '';
      setIsStreaming(true);
      getSocket().emit('chat:send', {
        chatId,
        userId,
        content,
        attachments,
      });
    },
    [chatId, userId]
  );

  const stopGeneration = useCallback(() => {
    getSocket().emit('chat:stop', { chatId });
    setIsStreaming(false);
  }, [chatId]);

  return { messages, setMessages, sendMessage, stopGeneration, isStreaming };
}
