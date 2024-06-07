import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import {
	Authenticated,
	ConvexReactClient,
	Unauthenticated,
} from 'convex/react';
import { ConvexProviderWithAuth0 } from 'convex/react-auth0';
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter } from 'react-router-dom';
import Auth from './routes/Auth';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<BrowserRouter>
			<Auth0Provider
				domain={import.meta.env.VITE_AUTH0_DOMAIN}
				clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
				authorizationParams={{
					redirect_uri: `${window.location.origin}`,
				}}
				useRefreshTokens={true}
				cacheLocation="localstorage"
			>
				<ConvexProviderWithAuth0 client={convex}>
					<Authenticated>
						<App />
					</Authenticated>
					<Unauthenticated>
						<Auth />
					</Unauthenticated>
				</ConvexProviderWithAuth0>
			</Auth0Provider>
		</BrowserRouter>
	</React.StrictMode>
);
