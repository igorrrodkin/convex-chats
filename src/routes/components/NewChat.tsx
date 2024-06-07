import { useMutation } from 'convex/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../convex/_generated/api';
import Layout from './Layout';
import { useChatsStore } from '../../store/store';

export default function NewChat() {
	const [message, setMessage] = useState<string>('');
	const [sendTo, setSendTo] = useState<string>('');
	const [newChat, setNewChat] = useState<boolean>(false);

	const navigate = useNavigate();
	const checkChatToSend = useMutation(api.queries.checkChatExistence);

	const storeChats = useChatsStore((state) => state.chats);

	const bodyToTest = {
		userName: sendTo,
		text: message,
	};

	const sendMsg = useMutation(api.queries.sendMessage);

	const sendMessage = async () => {
		if (!message) return;
		const res = await sendMsg(bodyToTest);
		if (res) {
			return navigate(`/chats/${res.chatId}`);
		}
	};

	const checkChat = async () => {
		const checkedChat = await checkChatToSend({
			userName: sendTo,
		});
		const chatExist = storeChats?.items.find(
			(item) => item._id === checkedChat?.chatId
		);
		if (chatExist) return navigate(`/chats/${checkedChat?.chatId}`);
		if (!chatExist) {
			setNewChat(true);
		}
	};

	return (
		<Layout>
			{!newChat && (
				<div>
					<input
						type="text"
						value={sendTo}
						onChange={(e) => setSendTo(e.target.value)}
					/>
					<button onClick={checkChat}>Start</button>
				</div>
			)}
			{newChat && (
				<div>
					<input
						type="text"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
					/>
					<button onClick={sendMessage}>Send</button>
				</div>
			)}
		</Layout>
	);
}
