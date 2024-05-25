const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, TextInputBuilder, ModalBuilder, TextInputStyle, Events } = require('discord.js')

module.exports = (client, interaction) => {

    client.Dispatch = async (interaction) => {
    
        const makeConnection = require("../utils/database");
        const db = await makeConnection();




        db.query(`SELECT COUNT(userID) FROM presence_dispatch`, function (error, resultsCountPresent, fields) {
            db.query(`SELECT COUNT(userID) FROM absence_dispatch`, function (error, resultsCountAbsent, fields) {
                db.query(`SELECT COUNT(userID) FROM retard_dispatch`, function (error, resultsCountRetard, fields) {
                    db.query(`SELECT * FROM ceremonie`, function(error, results, fields) {
                        
                        if(results[0].descCeremonie === "0") results[0].descCeremonie = "";

                        const DispatchEmbed = new EmbedBuilder()
                        .setColor("Blue")
                        .setTitle(`${client.config.dispatch} ${results[0].titleCeremonie} ${client.config.dispatch}`)
                        .setDescription(`${results[0].descCeremonie}\n\n__**Réagissez pour indiquer votre présence.**__\n\n> __**Présent :**__ <a:present:1241518769378168842>\n> __**Absent :**__ <a:absent:1241518745101537411>\n\n\nN'oubliez pas de justifier vos absences (ping channel) !\n\n<a:gyro:1241518732073766983> __**RÉACTION OBLIGATOIRE**__`)
                        .setTimestamp()
                        .setFooter({ text: "LSPD • Los Santos Police Department"})
                
                        const DispatchPresent = new ButtonBuilder()
                        .setCustomId("dispatch_present")
                        .setLabel(`✅${resultsCountPresent[0]['COUNT(userID)']}`)
                        .setStyle(ButtonStyle.Success)
                
                        const DispatchAbsent = new ButtonBuilder()
                        .setCustomId("dispatch_absent")
                        .setLabel(`❌${resultsCountAbsent[0]['COUNT(userID)']}`)
                        .setStyle(ButtonStyle.Danger)
                
                        const DispatchRetard = new ButtonBuilder()
                        .setCustomId("dispatch_retard")
                        .setLabel(`🕒${resultsCountRetard[0]['COUNT(userID)'] }`)
                        .setStyle(ButtonStyle.Primary)
                
                
                        const actionRowPresenceDispatch = new ActionRowBuilder().addComponents(DispatchPresent, DispatchAbsent, DispatchRetard)

                        client.channels.cache.get(client.config.channelCeremonieDispatch).messages.fetch(results[0].messageID).then(async (message) => {

                            message.edit({ content: client.config.mentions, embeds: [DispatchEmbed], components: [actionRowPresenceDispatch] })
                        })

                        client.on(Events.InteractionCreate, async (interaction) => {

                            if(interaction.customId === "dispatch_present") {

                                const userreact = interaction.user.id
                                const logsChannel = client.channels.cache.get(client.config.logsChannel)

                                db.query(`SELECT * FROM presence_dispatch WHERE userID = '${userreact}'`, function(error, resultsPresentDispatch, fields) {

                                    if(resultsPresentDispatch == "") {

                                        db.query(`INSERT INTO presence_dispatch (userID) VALUES ('${userreact}')`)
                                        interaction.reply({ content: "> Vous avez indiqué que vous serez présent lors du dispatch.", ephemeral: true })

                                        db.query(`SELECT * FROM ceremonie`, function(error, results, fields) {

                                            DispatchPresent.setLabel(`✅${resultsCountPresent[0]['COUNT(userID)'] ++ + 1}`)

                                            const DispatchEmbed = new EmbedBuilder()
                                            .setColor("Blue")
                                            .setTitle(`${client.config.dispatch} ${results[0].titleCeremonie} ${client.config.dispatch}`)
                                            .setDescription(`${results[0].descCeremonie}\n\n__**Réagissez pour indiquer votre présence.**__\n\n> __**Présent :**__ <a:present:1241518769378168842>\n> __**Absent :**__ <a:absent:1241518745101537411>\n\n\nN'oubliez pas de justifier vos absences (ping channel) !\n\n<a:gyro:1241518732073766983> __**RÉACTION OBLIGATOIRE**__`)
                                            .setTimestamp()
                                            .setFooter({ text: "LSPD • Los Santos Police Department"})

                                            client.channels.cache.get(client.config.channelCeremonieDispatch).messages.fetch(results[0].messageID).then(async (message) => {
                                                await message.edit({ content: client.config.mentions, embeds: [DispatchEmbed], components: [actionRowPresenceDispatch] })
                                                logsChannel.send({ content: `> <@${userreact}> a indiqué qu'il sera présent lors du dispatch.`})
                                            })
                                        })
                                    } else if(resultsPresentDispatch !== "") {
                                        db.query(`DELETE FROM presence_dispatch WHERE userID = '${userreact}'`)
                                        interaction.reply({ content: "> Vous avez annulé votre présence au dispatch.", ephemeral: true })
        
                                        db.query(`SELECT * FROM ceremonie`, function(error, results, fields) {
                                            
                                            DispatchPresent.setLabel(`✅${resultsCountPresent[0]['COUNT(userID)'] -- -1}`)
        
                                            const DispatchEmbed = new EmbedBuilder()
                                            .setColor("Blue")
                                            .setTitle(`${client.config.dispatch} ${results[0].titleCeremonie} ${client.config.dispatch}`)
                                            .setDescription(`${results[0].descCeremonie}\n\n__**Réagissez pour indiquer votre présence.**__\n\n> __**Présent :**__ <a:present:1241518769378168842>\n> __**Absent :**__ <a:absent:1241518745101537411>\n\n\nN'oubliez pas de justifier vos absences (ping channel) !\n\n<a:gyro:1241518732073766983> __**RÉACTION OBLIGATOIRE**__`)
                                            .setTimestamp()
                                            .setFooter({ text: "LSPD • Los Santos Police Department"})
        
                                            client.channels.cache.get(client.config.channelCeremonieDispatch).messages.fetch(results[0].messageID).then(async (message) => {
                                                await message.edit({ content: client.config.mentions, embeds: [DispatchEmbed], components: [actionRowPresenceDispatch] })
                                                logsChannel.send({ content: `> <@${userreact}> a annulé sa présence au dispatch.`})
                                            })
                                        })
                                    }
                                })

                            } else if(interaction.customId === "dispatch_absent") {
                                
                                const userreact = interaction.user.id
                                db.query(`SELECT * FROM presence_dispatch WHERE userID = '${userreact}'`, function(error, results, fields) {
                                    console.log(results)
                                    
                                if(results !== "") return 
                                interaction.reply({ content: "> <a:attention:1241518759429279766> Vous avez déjà indiqué que vous serez présent lors du dispatch.\n> Si vous souhaitez changer votre présence, merci de cliquer sur le bouton de présence pour retirer votre présence actuelle.", ephemeral: true });

                                })
                                db.query(`SELECT * FROM absence_dispatch WHERE userID = '${userreact}'`, function(error, resultsAbsentDispatch, fields) {

                                    if(resultsAbsentDispatch == "") {

                                        //client.absence_dispatch(interaction)

                                        const modalAbsence = new ModalBuilder()

                                        .setCustomId("modal_absence")
                                        .setTitle("🚨 Justification d'absence")

                                        const Grade = new TextInputBuilder()
                                        .setCustomId("grade")
                                        .setPlaceholder("Rookie")
                                        .setLabel("Grade")
                                        .setStyle(TextInputStyle.Short)
                                        .setMaxLength(500)
                                        .setMinLength(1)

                                        const NomPrenom = new TextInputBuilder()
                                        .setCustomId("name")
                                        .setPlaceholder("Yuri Salvaco")
                                        .setLabel("Nom et Prénom")
                                        .setStyle(TextInputStyle.Short)
                                        .setMaxLength(500)

                                        const Temps = new TextInputBuilder()
                                        .setCustomId("time")
                                        .setPlaceholder("24h")
                                        .setLabel("Durée de l'absence")
                                        .setStyle(TextInputStyle.Short)
                                        .setMaxLength(1000)
                                        .setMinLength(1)

                                        const Justification = new TextInputBuilder()
                                        .setCustomId("justification")
                                        .setPlaceholder("Je serais absent car je travaille tard.")
                                        .setLabel("Motif de l'absence")
                                        .setStyle(TextInputStyle.Paragraph)
                                        .setMaxLength(1000)
                                        .setMinLength(1)

                                        const AbsenceActionRow = new ActionRowBuilder()
                                        .addComponents(Grade)
                                        const AbsenceActionRow2 = new ActionRowBuilder()
                                        .addComponents(NomPrenom)
                                        const AbsenceActionRow3= new ActionRowBuilder()
                                        .addComponents(Temps)
                                        const AbsenceActionRow4 = new ActionRowBuilder()
                                        .addComponents(Justification)

                                        modalAbsence.addComponents(AbsenceActionRow, AbsenceActionRow2, AbsenceActionRow3, AbsenceActionRow4)

                                        interaction.showModal(modalAbsence)

                                        client.on("interactionCreate", async (interactio) => {

                                        if(interactio.isModalSubmit()) {
                                            
                                            

                                            const userreact = interactio.user.id

                                        const GradeResponse = interactio.fields.getTextInputValue("grade")
                                        const NameResponse = interactio.fields.getTextInputValue("name")
                                        const TimeResponse = interactio.fields.getTextInputValue("time")
                                        const JustificationResponse = interactio.fields.getTextInputValue("justification")


                                        db.query(`INSERT INTO absence_dispatch (userID, grade, time, motif) VALUES (?, ?, ?, ?)`, [userreact, GradeResponse, TimeResponse, JustificationResponse])
                                        interactio.reply({ content: "> Vous avez voté que vous serez absent pour le dispatch.", ephemeral: true})

                                        db.query(`SELECT COUNT(userID) FROM presence_dispatch`, function (error, resultsCountPresent, fields) {
                                            db.query(`SELECT COUNT(userID) FROM absence_dispatch`, function (error, resultsCountAbsent, fields) {
                                                db.query(`SELECT COUNT(userID) FROM retard_dispatch`, function (error, resultsCountRetard, fields) {
                                                    db.query(`SELECT * FROM ceremonie`, function(error, results, fields) {
                                                
                                                        const DispatchPresent = new ButtonBuilder()
                                                        .setCustomId("dispatch_present")
                                                        .setLabel(`✅${resultsCountPresent[0]['COUNT(userID)']}`)
                                                        .setStyle(ButtonStyle.Success)
                                                
                                                        const DispatchAbsent = new ButtonBuilder()
                                                        .setCustomId("dispatch_absent")
                                                        .setLabel(`❌${resultsCountAbsent[0]['COUNT(userID)'] ++}`)
                                                        .setStyle(ButtonStyle.Danger)
                                                
                                                        const DispatchRetard = new ButtonBuilder()
                                                        .setCustomId("dispatch_retard")
                                                        .setLabel(`🕒${resultsCountRetard[0]['COUNT(userID)'] }`)
                                                        .setStyle(ButtonStyle.Primary)
                                                
                                                
                                                        const actionRowPresenceDispatch = new ActionRowBuilder().addComponents(DispatchPresent, DispatchAbsent, DispatchRetard)


                                                        const DispatchEmbed = new EmbedBuilder()
                                                        .setColor("Blue")
                                                        .setTitle(`${client.config.dispatch} ${results[0].titleCeremonie} ${client.config.dispatch}`)
                                                        .setDescription(`${results[0].descCeremonie}\n\n__**Réagissez pour indiquer votre présence.**__\n\n> __**Présent :**__ <a:present:1241518769378168842>\n> __**Absent :**__ <a:absent:1241518745101537411>\n\n\nN'oubliez pas de justifier vos absences (ping channel) !\n\n<a:gyro:1241518732073766983> __**RÉACTION OBLIGATOIRE**__`)
                                                        .setTimestamp()
                                                        .setFooter({ text: "LSPD • Los Santos Police Department"})

                                                        const embedAbsence = new EmbedBuilder()
                                                        .setColor("Default")
                                                        .setAuthor({ name: interactio.user.username, iconURL: interactio.user.avatarURL()})
                                                        .setTitle("Nouvelle absence")
                                                        .setDescription(`> **Grade:** ${GradeResponse}\n> **Nom et Prénom:** ${NameResponse}\n> **Durée de l'absence:** ${TimeResponse}\n> **Motif de l'absence:** ${JustificationResponse}`)
                                                        .setTimestamp()
                                                        .setFooter({ text: "LSPD • Los Santos Police Department", iconURL: interaction.guild.iconURL()})
                                                        .setThumbnail(interaction.guild.iconURL() )

                                                        const AbsenceChannel = client.channels.cache.get(client.config.absenceChannel)
                                                        const logschannel = client.channels.cache.get(client.config.logsChannel)

                                                        AbsenceChannel.send({ embeds: [embedAbsence]}).then(async (message) => {

                                                        client.channels.cache.get(client.config.channelCeremonieDispatch).messages.fetch(results[0].messageID).then(async (msg) => {
                                                                await msg.edit({ content: client.config.mentions, embeds: [DispatchEmbed], components: [actionRowPresenceDispatch]})
                                                                logschannel.send({ content: `> <@${userreact}> a voté absent pour le dispatch. Justification : ${client.config.lienMsgAbsence + message.id}`})
                                                        
                                                    })
                                                })
                                                
                                                })
                                            })
                                        })
                                                })
                                    

                                    }
                                        })

                                    } else if(resultsAbsentDispatch !== "") {
                                        try {

                                        db.query(`DELETE FROM absence_dispatch WHERE userID = '${userreact}'`)
                                        interaction.reply({ content: "> Vous avez annulé votre absence au dispatch.", ephemeral: true })
        
                                        db.query(`SELECT * FROM ceremonie`, function(error, results, fields) {
                                            
                                            DispatchAbsent.setLabel(`❌${resultsCountAbsent[0]['COUNT(userID)'] --}`)
        
                                            const DispatchEmbed = new EmbedBuilder()
                                            .setColor("Blue")
                                            .setTitle(`${client.config.dispatch} ${results[0].titleCeremonie} ${client.config.dispatch}`)
                                            .setDescription(`${results[0].descCeremonie}\n\n__**Réagissez pour indiquer votre présence.**__\n\n> __**Présent :**__ <a:present:1241518769378168842>\n> __**Absent :**__ <a:absent:1241518745101537411>\n\n\nN'oubliez pas de justifier vos absences (ping channel) !\n\n<a:gyro:1241518732073766983> __**RÉACTION OBLIGATOIRE**__`)
                                            .setTimestamp()
                                            .setFooter({ text: "LSPD • Los Santos Police Department"})
        
                                            client.channels.cache.get(client.config.channelCeremonieDispatch).messages.fetch(results[0].messageID).then(async (message) => {
                                                await message.edit({ content: client.config.mentions, embeds: [DispatchEmbed], components: [actionRowPresenceDispatch] })
                                            })

                                            if (error) {
                                                console.log(error)
                                            }
                                        })
                                    } catch (error) {
                                        console.log(error)
                                    }
                                } 

                                })
                            }
                        })
                    }) 
                })
            })
        })
    }
}
