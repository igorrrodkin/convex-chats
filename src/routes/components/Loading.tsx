import { useConvexAuth, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Loading() {
	const createUser = useMutation(api.queries.createUser);
	const { isAuthenticated } = useConvexAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (isAuthenticated) {
			const getIndentity = async () => {
				const res = await createUser();
				localStorage.setItem(res.id, 'userId');
				navigate('/chats');
				return res;
			};
			getIndentity();
		}
	}, [isAuthenticated]);
	return <div></div>;
}
