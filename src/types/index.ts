import { Id } from '../../convex/_generated/dataModel';

export type Chats = {
	items: Chat[];
};


export type Chat = {
	name: string;
	_id: Id<'chats'>;
	_creationTime: number;
	lastMessageTime: number | null;
	content: string | null;
	sender: string | null;
};
