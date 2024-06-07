import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { api } from '../../../convex/_generated/api';
import { useChatsStore } from '../../store/store';
import '../../styles/layout.css';
import { useAuth0 } from '@auth0/auth0-react';

interface LayoutProps {
	children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	const { user } = useAuth0();
	const navigate = useNavigate();
	const location = useLocation();
	const { logout } = useAuth0();
	const createUser = useMutation(api.queries.createUser);
	const { isAuthenticated } = useConvexAuth();

	const bodyToTest = {
		page: 1,
		perPage: 10,
	};
	const chats = useQuery(api.queries.listChats, bodyToTest);

	const addNewChats = useChatsStore((state) => state.updateChats);
	const activeChat = useChatsStore((state) => state.activeChat);

	useEffect(() => {
		if (chats) {
			addNewChats(chats);
		}
	}, [chats]);

	useEffect(() => {
		if (isAuthenticated) {
			
			const getIndentity = async () => {
				const res = await createUser();
				localStorage.setItem('userId', res.id);
				return res;
			};
			getIndentity();
		}
	}, [isAuthenticated]);

	return (
		<div className="container">
			<p>{user?.nickname}</p>
			<button
				onClick={() => {
					localStorage.clear();
					logout({ logoutParams: { returnTo: window.location.origin } });
				}}
			>
				Logout
			</button>
			<div className="content">
				<div className="sidebar">
					{chats?.items?.map((item) => (
						<div
							onClick={() => navigate(`/chats/${item?._id}`)}
							key={item._id}
							className={
								activeChat?._id === item?._id &&
								!location.pathname.includes('/chats/new-chat')
									? 'chat active-chat '
									: 'chat'
							}
						>
							<NavLink to={`/chats/${item?._id}`}>{item?.name}</NavLink>
							<p>
								{item?.sender === user?.nickname ? 'You' : item?.sender}:
								{item?.content}
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
