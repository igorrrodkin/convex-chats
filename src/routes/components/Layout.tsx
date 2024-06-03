import { useQuery } from 'convex/react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Id } from '../../../convex/_generated/dataModel';
import { api } from '../../../convex/_generated/api';
import { useChatsStore } from '../../store/store';
import '../../styles/layout.css';

interface LayoutProps {
	children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	const userId = sessionStorage.getItem('userId');
	const username = sessionStorage.getItem('username');
	const navigate = useNavigate();
	const location = useLocation();
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
		<div className="container">
			<div className="content">
				<div className="sidebar">
					{chats?.items.map((item) => (
						<div
							onClick={() => navigate(`/chats/${item._id}`)}
							key={item._id}
							className={
								activeChat?._id === item._id &&
								!location.pathname.includes('/chats/new-chat')
									? 'chat active-chat '
									: 'chat'
							}
						>
							<NavLink to={`/chats/${item._id}`}>{item.name}</NavLink>
							<p>
								{item.sender === username ? 'You' : item.sender}:{item.content}
							</p>
						</div>
					))}

					<NavLink to={'/chats/new-chat'} className="new-chat-button">
						+ New chat
					</NavLink>
				</div>
				{children}
			</div>
		</div>
	);
}
