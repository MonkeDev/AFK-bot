require('dotenv').config();

const { Client } = require('eris');
const fetch = require('node-fetch').default;

const prefix = 'afk!';
const baseUrl = 'https://afk.monkedev.com/api/users';
// const baseUrl = 'http://localhost:8080/api/users';

const bot = new Client(process.env.BotToken, {});
bot.connect();


bot.on('ready', () => {
    console.log(`${bot.user.username} ready!`);
    bot.editStatus('idle', {
        type: 3,
        name: `${prefix}help`
    });
});

const helpMessage = 
`
\`${prefix}lb\` - Point leaderboard
\`${prefix}info [user]\` - Some info on a user
\`${prefix}help\` - This
`
const coolDown = new Set();
bot.on('messageCreate', async (msg) => {
    msg.channel.send = msg.channel.createMessage;

    if(msg.content.startsWith(prefix + 'lb' || prefix + 'leaderboard')) {
        const cooldown = coolDown.has(msg.author.id + '_lb');
        if(cooldown) return;
        else {
            coolDown.add(msg.author.id + '_lb');
            setTimeout(() => {
               coolDown.delete(msg.author.id + '_lb') 
            }, 12 * 1000);
        }

        const res = await (await fetch( baseUrl, {headers: { auth: process.env.AccessToken, lb: true}} )).json();

        let desc = '';
        let count = 1;
        res.forEach(user => {
            desc += `${count}. ${user.username}#${user.disc} @ ${user.points}\n`;
            count++;
        });
        return msg.channel.send({embed: {color: 0xf7c38e, description: desc.slice(0, 2000)}});
    };

    if(msg.content.startsWith(prefix + 'info')) {
        const res = await (await fetch( baseUrl, {headers: { auth: process.env.AccessToken, lb: false}} )).json();
        const user = msg.mentions[0] || msg.author;
        const info = await res.find(x => x.id == user.id);
        if(!info) return msg.channel.send(`:x: No data on ${user.username}#${user.discriminator}`);

        return msg.channel.send({embed: {
            color: 0xf7c38e,
            author: {
                name: user.username,
                icon_url: user.avatarURL
            },
            fields: [
                {
                    name: 'Points',
                    value: info.points
                }
            ]
        }});
    };

    if(msg.content.startsWith(prefix + 'help')) {
        return msg.channel.send(helpMessage);
    };

});