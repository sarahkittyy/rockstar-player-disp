import * as Discord from 'discord.js';
import Settings from './Settings';

/**
 * Main discord bot class
 */
export default class Bot
{
	/// The bot's settings.
	private settings: Settings;
	
	/**
	 * @brief Init the bot
	 * 
	 * @param settings The bot's settings
	 */
	public constructor(settings: Settings)
	{
		this.settings = settings;
		
		// Get the token
		let token: string = settings.token;
	}
};
