import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoadPage() {
	const navigate = useNavigate();
	useEffect(() => {
		if (!localStorage.getItem('userId')) {
			return navigate('/auth');
		} else {
			return navigate('/chats');
		}
	});
	return <div></div>;
}
