const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

// Role authorization configuration
const AUTHORIZED_ROLE_IDS = [
    '952440799570825278', // Your authorized role ID
    // Add more role IDs here if needed
];

// Function to check if user has authorized role
function hasAuthorizedRole(member) {
    return member.roles.cache.some(role => AUTHORIZED_ROLE_IDS.includes(role.id));
}

// Bot ready event
client.once('ready', () => {
    console.log(`✅ ${client.user.tag} is online and ready!`);
    client.user.setActivity('Managing Steam IDs', { type: 'WATCHING' });
});

// Slash command registration
const commands = [
    new SlashCommandBuilder()
        .setName('steamid')
        .setDescription('Send Steam ID correction message')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user who needs to correct their Steam ID')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the message to (optional)')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('accepted')
        .setDescription('Send application acceptance message')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose application was accepted')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the message to (optional)')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('noresponse')
        .setDescription('Send no response warning message')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user who needs to respond')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Number of hours until ticket closes')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the message to (optional)')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Send welcome message and assign roles')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The new member to welcome')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the message to (optional)')
                .setRequired(false))
];

// Handle slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    try {
        switch (commandName) {
            case 'steamid':
                await handleSteamIdCommand(interaction);
                break;
            case 'accepted':
                await handleAcceptedCommand(interaction);
                break;
            case 'noresponse':
                await handleNoResponseCommand(interaction);
                break;
            case 'welcome':
                await handleWelcomeCommand(interaction);
                break;
        }
    } catch (error) {
        console.error('Error executing command:', error);
        const errorMessage = 'There was an error executing this command!';
        
        try {
            if (interaction.deferred) {
                await interaction.editReply({ content: errorMessage });
            } else if (!interaction.replied) {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        } catch (replyError) {
            console.error('Error sending error message:', replyError);
        }
    }
});

// Command handlers
async function handleSteamIdCommand(interaction) {
    // Check if user has authorized role
    if (!hasAuthorizedRole(interaction.member)) {
        return interaction.reply({ 
            content: '❌ You need the appropriate role to use this command.', 
            ephemeral: true 
        });
    }
    
    const targetUser = interaction.options.getUser('user');
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    
    const message = `Hey ${targetUser}, For Q1, that is not searchable as a Steam ID.

Please follow the steps in the url in Q1.`;
    
    try {
        const webhook = await channel.createWebhook({
            name: interaction.member.nickname || interaction.user.displayName || interaction.user.username,
            avatar: interaction.user.displayAvatarURL({ dynamic: true, size: 256 })
        });
        
        await webhook.send({ content: message });
        await webhook.delete();
        await interaction.reply({ content: `✅ Steam ID correction sent to ${targetUser.username} in ${channel}!`, ephemeral: true });
    } catch (error) {
        console.error('Webhook error:', error);
        await channel.send({ content: message });
        await interaction.reply({ content: `✅ Steam ID correction sent to ${targetUser.username} in ${channel}! (via bot)`, ephemeral: true });
    }
}

async function handleAcceptedCommand(interaction) {
    // Check if user has authorized role
    if (!hasAuthorizedRole(interaction.member)) {
        return interaction.reply({ 
            content: '❌ You need the appropriate role to use this command.', 
            ephemeral: true 
        });
    }
    
    const targetUser = interaction.options.getUser('user');
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    
    const message = `Hey ${targetUser},
    
Thanks for applying, we have accepted your application.

Please read through our induction document and let us know once you have completed it by pinging <@&952440799570825278>

https://forms.gle/e5X1FNf2gxCrQweg7`;
    
    try {
        const webhook = await channel.createWebhook({
            name: interaction.member.nickname || interaction.user.displayName || interaction.user.username,
            avatar: interaction.user.displayAvatarURL({ dynamic: true, size: 256 })
        });
        
        await webhook.send({ content: message });
        await webhook.delete();
        await interaction.reply({ content: `✅ Acceptance message sent to ${targetUser.username} in ${channel}!`, ephemeral: true });
    } catch (error) {
        console.error('Webhook error:', error);
        await channel.send({ content: message });
        await interaction.reply({ content: `✅ Acceptance message sent to ${targetUser.username} in ${channel}! (via bot)`, ephemeral: true });
    }
}

async function handleNoResponseCommand(interaction) {
    // Check if user has authorized role
    if (!hasAuthorizedRole(interaction.member)) {
        return interaction.reply({ 
            content: '❌ You need the appropriate role to use this command.', 
            ephemeral: true 
        });
    }
    
    const targetUser = interaction.options.getUser('user');
    const time = interaction.options.getString('time');
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    
    const message = `Hey ${targetUser},
    
Please fill out the above questionnaire so we can start the induction process.

***This ticket will be closed in ${time} hours if there has been no response on this ticket. This will not impact your application process, but you will have to re-raise a new recruitment ticket.***

Regards, 
User Management Team`;
    
    try {
        const webhook = await channel.createWebhook({
            name: interaction.member.nickname || interaction.user.displayName || interaction.user.username,
            avatar: interaction.user.displayAvatarURL({ dynamic: true, size: 256 })
        });
        
        await webhook.send({ content: message });
        await webhook.delete();
        await interaction.reply({ content: `✅ No response warning sent to ${targetUser.username} with ${time} hour deadline in ${channel}!`, ephemeral: true });
    } catch (error) {
        console.error('Webhook error:', error);
        await channel.send({ content: message });
        await interaction.reply({ content: `✅ No response warning sent to ${targetUser.username} with ${time} hour deadline in ${channel}! (via bot)`, ephemeral: true });
    }
}

async function handleWelcomeCommand(interaction) {
    // Check if user has authorized role
    if (!hasAuthorizedRole(interaction.member)) {
        return interaction.reply({ 
            content: '❌ You need the appropriate role to use this command.', 
            ephemeral: true 
        });
    }
    
    // Defer the reply immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const targetUser = interaction.options.getUser('user');
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    
    const welcomeMessage = `Thanks ${targetUser}, 
    
Welcome to Chimera! 🙂 I've assigned you the community role, giving you access to the community side of the Discord.

If you're interested in getting whitelisted on our server (quicker access through queues), consider joining our seed team here: https://discord.com/channels/565502178253471744/927147021452857366 **(THIS IS THE BEST WAY TO GET VIP ON OUR SERVERS)**

For priority access to servers you can also sign up to our patreon, but that's completely optional. Every cent donated through the Chimera community goes back into the community to recoup server hosting costs, hold competitions, issue member of the month rewards etc. and nothing is ever kept for profit.

We're also proud to be the highest rated competitive team in OCE, and we regularly play in tournaments with the best international teams in the world. If you're interested in this style of play, consider putting in a comp application here: https://discord.com/channels/565502178253471744/1026447317903089756

Most of us play HLL with locked squads, but if we see a name with CHMA in their tag request to join, we'll let them in. So feel free to get the tags on and smash some games with us! I'd also encourage you to jump into a voice channel, say g'day, and get involved with the community. We're all super friendly, let me know if you want to tee up a game 🙂

There's a 4 week probation period and we may check-in to see how you're going. You can always reach out to myself or any other CHMA members for help if needed at all. Any questions at this point mate before we close the ticket?`;
    
    try {
        const member = await interaction.guild.members.fetch(targetUser.id);
        
        // Role IDs - Replace these with your actual role IDs
        const communityMemberRoleId = '633051065960628244';
        const recruitRoleId = '635774784084377601';
        const rolesRoleId = '793819588378755082';
        const rankRoleId = '656441481619570718';
        const guestRoleId = '794754820950720553';
        
        console.log(`Before role changes for ${targetUser.username}:`);
        console.log(`Current roles: ${member.roles.cache.map(r => r.name).join(', ')}`);
        
        let roleChangeSuccess = true;
        
        // Add roles one by one with error handling
        try {
            await member.roles.add([communityMemberRoleId, recruitRoleId, rolesRoleId, rankRoleId]);
            console.log('✅ Successfully added roles');
        } catch (roleError) {
            console.error('❌ Error adding roles:', roleError);
            roleChangeSuccess = false;
        }
        
        // Remove guest role
        try {
            await member.roles.remove(guestRoleId);
            console.log('✅ Successfully removed guest role');
        } catch (roleError) {
            console.error('❌ Error removing guest role:', roleError);
            roleChangeSuccess = false;
        }
        
        console.log(`After role changes for ${targetUser.username}:`);
        console.log(`New roles: ${member.roles.cache.map(r => r.name).join(', ')}`);
        
        // Send the welcome message
        try {
            const webhook = await channel.createWebhook({
                name: interaction.member.nickname || interaction.user.displayName || interaction.user.username,
                avatar: interaction.user.displayAvatarURL({ dynamic: true, size: 256 })
            });
            
            await webhook.send({ content: welcomeMessage });
            await webhook.delete();
            
            const successMessage = roleChangeSuccess 
                ? `✅ Welcome message sent to ${targetUser.username} in ${channel}!`
                : `✅ Welcome message sent to ${targetUser.username} in ${channel}! (Note: Some role assignments may have failed)`;
            
            await interaction.editReply({ content: successMessage });
        } catch (webhookError) {
            console.error('Webhook error:', webhookError);
            await channel.send({ content: welcomeMessage });
            
            const successMessage = roleChangeSuccess 
                ? `✅ Welcome message sent to ${targetUser.username} in ${channel}! (via bot)`
                : `✅ Welcome message sent to ${targetUser.username} in ${channel}! (via bot - Note: Some role assignments may have failed)`;
            
            await interaction.editReply({ content: successMessage });
        }
    } catch (error) {
        console.error('Welcome command error:', error);
        await interaction.editReply({ 
            content: `❌ There was an error processing the welcome command for ${targetUser.username}. Please check the logs.` 
        });
    }
}

// Register commands when bot starts
client.on('ready', async () => {
    try {
        console.log('🔄 Refreshing application (/) commands...');
        await client.application.commands.set(commands);
        console.log('✅ Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('❌ Error registering commands:', error);
    }
});

// Error handling
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);