import * as Discord from 'discord.js';
import Settings from './Settings';
import SCPWatch from './SCPWatch';

/**
 * Main discord bot class
 */
export default class Bot
{
	/// The bot's settings.
	private settings: Settings;
	/// The bot's token
	private token: string;
	/// The bot client
	private client: Discord.Client;
	// The log watcher.
	private watcher: SCPWatch;

	/**
	 * @brief Init the bot
	 * 
	 * @param token The bot's token
	 * @param settings The bot's settings
	 */
	public constructor(token: string, settings: Settings)
	{
		this.settings = settings;
		this.token = token;

		// Init the bot.
		this.client = new Discord.Client();

		// Handle errors and disconnects.
		this.client.on('disconnect', () => {
			console.log('Bot got disconnected, trying to log back in...');
			this.login();
		});
		this.client.on('error', (err) => {
			console.log('Bot got an error. Error details:');
			console.log(err);
			console.log('Trying to log in again...');
			this.login();
		});
		
		// Once the bot is ready...
		this.client.on('ready', () => {
			// Init the watcher.
			this.watcher = new SCPWatch(settings, this.client);
		});
		
		// Log the bot in.
		this.login();
	}

	/**
	 * @brief Log the bot in.
	 */
	private login()
	{
		this.client.login(this.token)
		.catch(console.error)
		.then(() => {
			console.log(`Successfully logged in!`);
		});
	}
};
