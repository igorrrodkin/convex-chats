import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
	const [username, setUsername] = useState<string>('');
	const navigate = useNavigate();

	const auth = useMutation(api.queries.createUser);

	const register = async () => {
		if (!username) return alert('Enter valid username');
		const userId = await auth({ name: username });
		console.log(userId, 'userId');

		if (userId) {
			sessionStorage.setItem('userId', userId);
			console.log(userId);
			return navigate('/chats');
		}
	};

	useEffect(() => {
		if (sessionStorage.getItem('userId')) {
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
			<button onClick={register}>Login</button>
		</div>
	);
}
