import * as Discord from 'discord.js';
import Settings from './Settings';
import * as fs from 'fs';
import watch from 'node-watch';
import * as path from 'path';
import { String } from 'typescript-string-operations'; 

/**
 * @brief The content in a single line of the logs.
 */
export interface LogContent
{
	date: Date;
	event: string;
	subevent: string;
	data: string;
};

/**
 * @brief Logs SCP round log file changes.
 * Best if used on only a single log file.
 * Logs each line, and after every log stores the date of the last log message.
 * This way, there won't be any logging repeats.
 */
export default class SCPWatch
{
	/// The app settings.
	private settings: Settings;
	/// The bot client, as a member of a guild.
	private client: Discord.GuildMember;
	
	/**
	 * @brief Init the watcher.
	 * 
	 * @param settings The app settings.
	 * @param client The discord client.
	 */
	public constructor(settings: Settings, client: Discord.Client)
	{
		this.settings = settings;
		
		// Find the guild.
		let guild: Discord.Guild | undefined =
			client.guilds.get(this.settings.guildid);
		if(!guild)
		{
			throw new Error('Guild ID not recognized.');
		}
		// Get the client as a guild member
		this.client = guild.members.get(client.user.id);
		if(!this.client) // This shouldn't happen
		{
			throw new Error('Fatal error? Client not a member of the guild with the specified ID? Contact the programmer.');
		}
		
		watch(this.settings.path + this.settings.port.toString(), {
			recursive: true	
		}, (eventType: 'update' | 'remove', filename: string) => {
			// Ignore removal events.
			if(eventType === 'remove')
			{
				return;
			}
			
			// Read the file.
			fs.readFile(filename, (err, data) => {
				if(err) throw err;
				
				// Player count.
				let pcount: number = 0;
				
				// Every line of the log file.
				let contents: string[] = data.toString().split('\n');
				for(let line of contents)
				{
					let content = this.splitLine(line);
					if(!content)
					{
						continue;
					}
					
					// Check if it's a connection update / networking
					if(content.event !== 'Connection update' || content.subevent !== 'Networking')
					{
						continue;
					}
					
					// Events should have keyword 'player' and keywords 'connected' or 'disconnected'
					if(!(/player/gi.test(content.data)))
					{
						continue;
					}
					
					if(/\bconnected\b/gi.test(content.data))
					{
						pcount++;
					}
					else if(/\bdisconnected\b/gi.test(content.data))
					{
						pcount--;
					}
				}
				
				// Set the nickname.
				this.client.setNickname(this.getNickname(pcount))
				.catch(console.error)
				.then(()=>{
					console.log('Log file updated, set name. Player count: ' + pcount.toString());
				});
			});
		});
	}
	
	/**
	 * @brief Gets the bot's nickname given it's ID.
	 */
	private getNickname(pcount: number): string
	{
		return String.Format(this.settings.nickname, pcount, this.settings.maxplayers);
	}
	
	/**
	 * @brief Split a line of the log file into a LogContent object.
	 * 
	 * @param line The line to convert.
	 */
	private splitLine(line: string): LogContent | undefined
	{
		// Split at the | character.
		let sections: string[] = /(.*?)\|(.*?)\|(.*?)\|(.*)$/gm.exec(line);
		if(!sections)
		{
			return undefined;
		}
		sections = sections.slice(1);
		if(sections.length != 4)
		{
			return undefined;
		}
		sections = sections.map((s: string) => s.trim());
		// Get the date from section 0.
		let date: Date = this.getDate(sections[0]);
		// Get the event and subevent
		let event: string = sections[1];
		let subevent: string = sections[2];
		// Get the event data.
		let data: string = sections[3];
		
		// Return the logcontent object.
		return {
			date: date,
			event: event,
			subevent: subevent,
			data: data	
		};
	}
	
	/**
	 * @brief Get the date from a date string from the logs.
	 * 
	 * @param str The string representing the date from the logs.
	 */
	private getDate(str: string): Date
	{
		let res: string[] = 
		/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})\.(\d{3}).*$/g.exec(str).slice(1);
		// Separate date components.
		let year = parseInt(res[0]);
		let month = parseInt(res[1]) - 1;
		let day = parseInt(res[2]);
		let hours = parseInt(res[3]);
		let minutes = parseInt(res[4]);
		let seconds = parseInt(res[5]);
		let milli = parseInt(res[6]);
		return new Date(year, month, day, hours, minutes, seconds, milli);
	}
};