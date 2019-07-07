import Bot from './Bot';
import * as fs from 'fs';
import Settings from './Settings';

// Load the settings
const settings: Settings = JSON.parse(fs.readFileSync('config.json').toString());
// Load the token.
const token: string = fs.readFileSync('private/token.txt').toString();
// Init the bot client
const client: Bot = new Bot(token, settings);
