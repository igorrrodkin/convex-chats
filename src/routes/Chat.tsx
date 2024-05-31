import { useLocation } from 'react-router-dom';
import { Id } from '../../convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useEffect, useState } from 'react';
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

	useEffect(() => {
		const activeChatById = storeChats?.items.find(
			(chat) => chat._id === chatId
		);
		if (activeChatById) {
			setActiveChat(activeChatById);
		}
	});

	const bodyToTest = {
		userId: activeChat?.name as Id<'users'>,
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
		console.log(activeChat, 'activeChatById');
		await sendMsg(bodyToTest);
		setMessage('');
		console.log(messages);
	};

	const messages = useQuery(api.queries.listMessages, bodyQueryTest);

	return (
		<Layout>
			<div className="messages-wrapper">
				<div className="message-list">
					{messages?.items.page.map((msg) => (
						<div key={msg._id} className={msg.sender === userId ? 'sender-msg' : 'receiver-msg'}>
							<p>{msg.content}</p>
						</div>
					))}
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
