import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ConvexReactClient } from 'convex/react';
import { Auth0Provider } from '@auth0/auth0-react';
import { ConvexProviderWithAuth0 } from 'convex/react-auth0';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Auth0Provider
			domain={import.meta.env.VITE_AUTH0_DOMAIN}
			clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
			authorizationParams={{
				redirect_uri: 'http://localhost:5174/chats',
			}}
			useRefreshTokens={true}
			cacheLocation="localstorage"
		>
			<ConvexProviderWithAuth0 client={convex}>
				<App />
			</ConvexProviderWithAuth0>
		</Auth0Provider>
	</React.StrictMode>
);
