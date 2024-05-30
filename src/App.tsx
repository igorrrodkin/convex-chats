import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Auth from './routes/Auth';
import Chats from './routes/Chats';
import Chat from './routes/Chat';
import LoadPage from './routes/components/LoadPage';
import NewChat from './routes/components/NewChat';
function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<LoadPage />} />
				<Route path="/auth" element={<Auth />} />
				<Route path="/chats" element={<Chats />} />
				<Route path="/chats/:id" element={<Chat />} />
				<Route path="/chats/new-chat" element={<NewChat />} />

			</Routes>
		</BrowserRouter>
	);
}

export default App;
