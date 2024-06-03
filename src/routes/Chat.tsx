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
		userName: activeChat?.name as Id<'users'>,
		text: message,
		requestUserId: userId as Id<'users'>,
	};

	const bodyQueryTest = {
		chatId: chatId as Id<'chats'>,
	};

	const sendMsg = useMutation(api.queries.sendMessage);

	const sendMessage = async () => {
		if (!message) return;
		await sendMsg(bodyToTest);
		setMessage('');
	};

	const messages = useQuery(
		api.queries.listMessagesWithoutPagination,
		bodyQueryTest
	);

	return (
		<Layout>
			<div className="messages-wrapper">
				<div className="message-list">
					{messages?.map((msg) => (
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
