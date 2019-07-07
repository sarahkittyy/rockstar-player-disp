export default interface Settings
{
	port: number; // The server's port to monitor.
	path: string; // The base path to all SCP servers.
	nickname: string; // The nickname to update with the player count.
	//^ Updated by replacing {} with the current player count.
	guildid: string; // The guild's ID.
};
