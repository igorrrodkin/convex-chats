import { useQuery } from 'convex/react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Id } from '../../../convex/_generated/dataModel';
import { api } from '../../../convex/_generated/api';
import { useChatsStore } from '../../store/store';
import '../../styles/layout.css';

export default function Layout({ children }) {
	const userId = sessionStorage.getItem('userId');
	const navigate = useNavigate();
	const bodyToTest = {
		requestUserId: userId as Id<'users'>,
		page: 1,
		perPage: 10,
	};
	const chats = useQuery(api.queries.listChats, bodyToTest);
	const addNewChats = useChatsStore((state) => state.updateChats);
	const activeChat = useChatsStore((state) => state.activeChat);

	useEffect(() => {
		if (!sessionStorage.getItem('userId')) {
			return navigate('/auth');
		}
	});

	useEffect(() => {
		if (chats) {
			addNewChats(chats);
		}
	}, [chats]);

	useEffect(() => {
		if (!sessionStorage.getItem('userId')) {
			return navigate('/auth');
		}
	});

	return (
		<div>
			<div>
				{chats?.items.map((item) => (
					<div
						key={item._id}
						className={activeChat?._id === item._id ? 'active-chat' : 'chat'}
					>
						<NavLink to={`/chats/${item._id}`}>{item.name}</NavLink>
					</div>
				))}
				<button>
					<NavLink to={'/chats/new-chat'}>+ New chat</NavLink>
				</button>
			</div>
			{children}
		</div>
	);
}
