import { useConvexAuth, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

export default function Auth() {
	const [username, setUsername] = useState<string>('');
	const { isLoading } = useConvexAuth();
	const { loginWithRedirect } = useAuth0();
	const navigate = useNavigate();

	const auth = useMutation(api.queries.createUser);

	const register = async () => {
		if (!username) return alert('Enter valid username');
		const userId = await auth({ name: username });

		if (userId) {
			localStorage.setItem('userId', userId);
			localStorage.setItem('username', username);
			await loginWithRedirect();
			// return navigate('/chats');
		}
	};

	useEffect(() => {
		if (localStorage.getItem('userId')) {
			return navigate('/chats');
		}
	});

	return (
		<div>
			<input
				type="text"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
			/>
			<button disabled={isLoading} onClick={register}>
				Login
			</button>
		</div>
	);
}
