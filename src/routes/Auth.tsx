import { useConvexAuth } from 'convex/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

export default function Auth() {
	const { isLoading } = useConvexAuth();
	const { loginWithRedirect } = useAuth0();
	const { user } = useAuth0();

	const navigate = useNavigate();

	useEffect(() => {
		if (user?.email) {
			return navigate('/loading');
		}
	});

	return (
		<div>
			<button disabled={isLoading} onClick={() => loginWithRedirect()}>
				Login
			</button>
		</div>
	);
}
