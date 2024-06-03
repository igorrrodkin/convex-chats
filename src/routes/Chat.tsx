import { useLocation } from 'react-router-dom';
import { Id } from '../../convex/_generated/dataModel';
import { useMutation, usePaginatedQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useEffect, useState, useRef } from 'react';
import Layout from './components/Layout';
import { useChatsStore } from '../store/store';
import '../styles/chat.css';

export default function Chats() {
	const [message, setMessage] = useState<string>('');
	const location = useLocation();
	const pathname = location.pathname;
	const chatId = pathname.split('/').pop();
	const storeChats = useChatsStore((state) => state.chats);
	const activeChat = useChatsStore((state) => state.activeChat);
	const setActiveChat = useChatsStore((state) => state.updateActiveChat);
	const userId = sessionStorage.getItem('userId');
	const messagesRef = useRef<HTMLDivElement>(null);

	const messageListRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const activeChatById = storeChats?.items.find(
			(chat) => chat._id === chatId
		);
		if (activeChatById) {
			setActiveChat(activeChatById);
		}
	}, [storeChats, chatId, setActiveChat]);

	const bodyToTest = {
		userName: activeChat?.name as Id<'users'>,
		text: message,
		requestUserId: userId as Id<'users'>,
	};

	const bodyQueryTest = {
		chatId: chatId as Id<'chats'>,
		paginationOpts: {
			cursor: null,
			endCursor: null,
			id: 0,
			maximumBytesRead: 100000,
			maximumRowsRead: 1000,
			numItems: 10,
		},
	};

	const sendMsg = useMutation(api.queries.sendMessage);

	const sendMessage = async () => {
		if (!message) return;
		await sendMsg(bodyToTest);
		setMessage('');
	};

	const { results, status, loadMore } = usePaginatedQuery(
		api.queries.listMessages,
		bodyQueryTest,
		{
			initialNumItems: 15,
		}
	);

	useEffect(() => {
		if (messageListRef.current) {
			messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
		}
	}, [results[0]]);

	useEffect(() => {
		if (
			messageListRef.current &&
			messageListRef.current.scrollTop <= 0 &&
			status === 'CanLoadMore'
		) {
			loadMore(12);
		}
	}, [results[results.length - 1]]);

	useEffect(() => {
		const handleScroll = () => {
			if (
				messageListRef.current &&
				messageListRef.current.scrollTop <= 70 &&
				status === 'CanLoadMore'
			) {
				loadMore(12);
			}
		};

		const messageListElement = messageListRef.current;
		if (messageListElement) {
			messageListElement.addEventListener('scroll', handleScroll);
		}

		return () => {
			if (messageListElement) {
				messageListElement.removeEventListener('scroll', handleScroll);
			}
		};
	}, [status, loadMore]);

	return (
		<Layout>
			<div className="chat-wrapper">
				<div className="messages-wrapper" ref={messageListRef}>
					<div className="message-list" ref={messagesRef}>
						{results.map((msg) => (
							<div
								key={msg._id}
								className={
									msg.sender === userId ? 'sender-msg' : 'receiver-msg'
								}
							>
								<p>{msg.content}</p>
							</div>
						))}
					</div>
				</div>
				<div className="send-message">
					<input
						type="text"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
					/>
					<button onClick={sendMessage} disabled={message.length < 1}>
						Send
					</button>
				</div>
			</div>
		</Layout>
	);
}
