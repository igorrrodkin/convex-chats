import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoadPage() {
	const { user } = useAuth0();

	const navigate = useNavigate();

	useEffect(() => {
		if (!user?.nickname) {
			return navigate('/');
		} else {
			return navigate('/loading');
		}
	});


	return <div></div>;
}
