const ids = require('/home/ubuntu/discord/config3_logibot.json')
const { MongoClient } = require("mongodb");
const uri = "mongodb://127.0.0.1:27017/";
const monclient = new MongoClient(uri);
const { Client, Intents, MessageEmbed, ContextMenuInteraction, ActionRowBuilder, MessageActionRow, Modal, TextInputComponent } = require('discord.js');
const ObjectId = require('mongodb').ObjectId;
const { token } = require('./config3_logibot.json');
const sanitize = require('mongo-sanitize');
const client = new Client({ partials: ['GUILD_MEMBER', "CHANNEL"], intents: [] });

monclient.connect();
const db1 = monclient.db("wn")


client.once('ready', async () => {
    console.log('Ready!');
});


client.on('interactionCreate', async (interaction) => {

    /////////////////////SUBMIT MODAL PRODUCTION //////////////////
    if (interaction.customId === 'Prod_myModal') {
        await interaction.update({})
        const channel = await client.channels.fetch("1001421948426932224")
        const location = interaction.fields.getTextInputValue('Prod_order_location');
        const items = interaction.fields.getTextInputValue('Prod_order_list');

        const thread = await channel.threads.create({
            name: `🏭 @ ${location}`,
            auto_archive_duration: 1440,
            type: 'GUILD_PUBLIC_THREAD'

        });


        const exampleEmbed = new MessageEmbed()
            .setAuthor({ name: `Requsted by ${interaction.user.username}`, iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png` })
            .setColor('#E67E22')
            .addFields(
                { name: '\u200B', value: '\u200B', inline: false },
                { name: 'DEPOT LOCATION', value: "```" + `${location}` + "```", inline: true },
                { name: 'ITEMS TO PRODUCE', value: "```" + `${items}` + "```", inline: false },
                //🚢 shipping🏭
            )
            .setFooter({ text: interaction.user.id })

        if (client.isReady()) {

            client.channels.cache.get(thread.id).send({
                content: `<@&501079731429703698> <@${interaction.user.id}>`,
                embeds: [exampleEmbed],
                components: [{
                    "type": 1,
                    "components": [
                        {
                            "style": 2,
                            "label": `ON IT`,
                            "custom_id": `join_Prod_order`,
                            "disabled": false,
                            "type": 2
                        },
                        {
                            "style": 3,
                            "label": `COMPLETED`,
                            "custom_id": `complete_order`,
                            "disabled": false,
                            "type": 2
                        },]
                }]
            })
        }
    }



    /////////////////////SUBMIT MODAL SHIP //////////////////
    if (interaction.customId === 'ship_myModal') {
        await interaction.update({})
        const channel = await client.channels.fetch("1001421948426932224")
        const locationFrom = interaction.fields.getTextInputValue('ship_from');
        const locationTo = interaction.fields.getTextInputValue('ship_to');
        const items = interaction.fields.getTextInputValue('ship_what');
        const thread = await channel.threads.create({
            name: `🚢 ⟶ ${locationTo}`,
            auto_archive_duration: 1440,
            type: 'GUILD_PUBLIC_THREAD'

        });




        const exampleEmbed = new MessageEmbed()
            .setAuthor({ name: `Requsted by ${interaction.user.username}`, iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png` })
            .setThumbnail('https://cdn.discordapp.com/attachments/556088536453873664/1004027092243062855/output-onlinepngtools_8.png')
            .setColor('#E67E22')
            .addFields(
                { name: '\u200B', value: '\u200B', inline: false },
                { name: 'FROM DEPOT ', value: "```" + `${locationFrom}` + "```", inline: true },
                { name: '→ TO DEPOT', value: "```" + `${locationTo}` + "```", inline: true },
                { name: 'ITEMS TO SHIP', value: "```" + `${items}` + "```", inline: false },
                //🚢 shipping🏭
            )
            .setFooter({ text: interaction.user.id })
        if (client.isReady()) {

            client.channels.cache.get(thread.id).send({
                content: `<@&501079731429703698> <@${interaction.user.id}>`, //<@&501079731429703698>
                embeds: [exampleEmbed],
                components: [
                    {
                        "type": 1,
                        "components": [
                            {
                                "style": 2,
                                "label": `ON IT`,
                                "custom_id": `join_ship_order`,
                                "disabled": false,
                                "type": 2
                            },
                            {
                                "style": 3,
                                "label": `DELIVERED`,
                                "custom_id": `complte_ship_order`,
                                "disabled": false,
                                "type": 2
                            },
                        ]
                    }
                ]
            })
        }
    }


    if (interaction.isButton()) {

        if (interaction.customId == 'join_Prod_order' || interaction.customId == "join_ship_order") {
            console.log(interaction.message.embeds[0].footer?.text)
            try {
                await interaction.update({})
                let getChannelId = await client.channels.fetch(interaction.channelId)
                getChannelId.send(`<@${interaction.user.id}> signed up for the order`)
            } catch (e) {
                console.log(e)
            }
        }


        if (interaction.customId == "complte_ship_order" || interaction.customId == "complete_order") {
            try {
                await interaction.update({})
                const status = await db1.collection('wars').find({ _id: "WARSTATUS" }).toArray();
                let currentWarNumb = status[0].WARNUMB
                let thread = await client.channels.fetch(interaction.channelId)
                let link = `https://discord.com/channels/467433493261975563/${interaction.channelId}`

                const confirmembed = new MessageEmbed()
                    .setAuthor({ name: `► ${interaction.member.nickname == undefined ? interaction.user.username : interaction.member.nickname} completed order`, iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`, url: link })
                    .setURL(link)
                    .setColor('0x0b8300')

                let logiChannl = await client.channels.fetch("522778594699771905")
                let originAuthor = interaction.message.embeds[0].footer?.text == undefined ? "Order" : `<@${interaction.message.embeds[0].footer?.text}>`

                let findinDB = await db1.collection('LogiOrders').find({ _id: ObjectId("62ece7b68adcd58ca07bd6df") }, { [interaction.user.id]: { "$exists": true } }).toArray();
                let now = Date.now()
                let ordersWarNumb = "orders" + currentWarNumb
                if (findinDB[0][interaction.user.id] != undefined) {
                    if (findinDB[0][interaction.user.id][ordersWarNumb] != undefined) {
                        let getAmount = Number(findinDB[0][interaction.user.id][ordersWarNumb]) + 1
                        if (now - findinDB[0][interaction.user.id].lastClick < 300000) {
                            console.log("true")
                            interaction.reply({
                                content: 'Too early to submit an order, come back in around 5 mins',
                                ephemeral: true,
                            })
                        } else {
                            await db1.collection('LogiOrders').updateOne({ _id: ObjectId("62ece7b68adcd58ca07bd6df") }, { $set: { [interaction.user.id.toString() + `.${ordersWarNumb}`]: getAmount } })
                            logiChannl.send({ content: `${originAuthor}`, embeds: [confirmembed] })
                            await thread.setName(`✅ Order completed by ${interaction.member.nickname == undefined ? interaction.user.username : interaction.member.nickname}`)
                            await new Promise(resolve => setTimeout(resolve, 100))
                            await thread.setArchived(true);
                            const user = client.users.cache.get(interaction.message.embeds[0].footer?.text);
                            try {
                                user.send({ embeds: [confirmembed] })
                            } catch (e) { console.log(e) }
                        }
                    } else {
                        await db1.collection('LogiOrders').updateOne({ _id: ObjectId("62ece7b68adcd58ca07bd6df") }, { $set: { [interaction.user.id]: { lastClick: now, [ordersWarNumb]: 1 } } })
                        logiChannl.send({ content: `${originAuthor}`, embeds: [confirmembed] })
                        await thread.setName(`✅ Order completed by ${interaction.member.nickname == undefined ? interaction.user.username : interaction.member.nickname}`)
                        await new Promise(resolve => setTimeout(resolve, 100))
                        await thread.setArchived(true);
                        const user = client.users.cache.get(interaction.message.embeds[0].footer?.text);
                        try {
                            user.send({ embeds: [confirmembed] })
                        } catch (e) { console.log(e) }
                    }
                } else {
                    await db1.collection('LogiOrders').updateOne({ _id: ObjectId("62ece7b68adcd58ca07bd6df") }, { $set: { [interaction.user.id]: { lastClick: now, [ordersWarNumb]: 1 } } })
                    logiChannl.send({ content: `${originAuthor}`, embeds: [confirmembed] })

                    await thread.setName(`✅ Order completed by ${interaction.member.nickname == undefined ? interaction.user.username : interaction.member.nickname}`)
                    await new Promise(resolve => setTimeout(resolve, 100))
                    thread.setArchived(true);
                    const user = client.users.cache.get(interaction.message.embeds[0].footer?.text);
                    try {
                        user.send({ embeds: [confirmembed] })
                    } catch (e) { console.log(e) }
                }
            } catch (e) { console.log(e) }
        }


        //SHOW MODAL
        if (interaction.customId == "Prod_order") {

            const modal = new Modal()
                .setCustomId('Prod_myModal')
                .setTitle('🏭 Production order');
            const favoriteColorInput = new TextInputComponent()
                .setCustomId('Prod_order_location')
                // The label is the prompt the user sees for this input
                .setLabel("STORAGE LOCATION ")
                // Short means only a single line of text
                .setStyle('SHORT');
            const hobbiesInput = new TextInputComponent()
                .setCustomId('Prod_order_list')
                .setLabel("ITEMS LIST")
                // Paragraph means multiple lines of text.
                .setStyle('PARAGRAPH');
            // An action row only holds one text input,
            // so you need one action row per text input.
            const firstActionRow = new MessageActionRow().addComponents(favoriteColorInput);
            const secondActionRow = new MessageActionRow().addComponents(hobbiesInput);
            // Add inputs to the modal
            modal.addComponents(firstActionRow, secondActionRow);
            // Show the modal to the user
            await interaction.showModal(modal);
        }


        if (interaction.customId == "ship_order") {

            const modal = new Modal()
                .setCustomId('ship_myModal')
                .setTitle('🚢 SHIPPING ORDER');
            const favoriteColorInput = new TextInputComponent()
                .setCustomId('ship_from')
                .setLabel("FROM")
                .setStyle('SHORT');
            const hobbiesInput = new TextInputComponent()
                .setCustomId('ship_to')
                .setLabel("TO ")
                .setStyle('SHORT');
            const listitems = new TextInputComponent()
                .setCustomId('ship_what')
                .setLabel("ITEMS LIST")
                .setStyle('PARAGRAPH');

            const firstActionRow = new MessageActionRow().addComponents(favoriteColorInput);
            const secondActionRow = new MessageActionRow().addComponents(hobbiesInput);
            const thirdActionRow = new MessageActionRow().addComponents(listitems);
            // Add inputs to the modal
            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
            // Show the modal to the user
            await interaction.showModal(modal);
        }
    }

})


client.login(token);