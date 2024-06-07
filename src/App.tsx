import { Route, Routes } from 'react-router-dom';
import './App.css';
import Chats from './routes/Chats';
import Chat from './routes/Chat';
import LoadPage from './routes/components/LoadPage';
import NewChat from './routes/components/NewChat';
import Loading from './routes/components/Loading';
function App() {
	return (
		<Routes>
			<Route path="/" element={<LoadPage />} />
			<Route path="/loading" element={<Loading />} />

			<Route path="/chats" element={<Chats />} />
			<Route path="/chats/:id" element={<Chat />} />
			<Route path="/chats/new-chat" element={<NewChat />} />
		</Routes>
	);
}

export default App;
