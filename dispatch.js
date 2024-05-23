const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, TextInputBuilder, ModalBuilder, TextInputStyle, Events } = require('discord.js')


module.exports = (client, interaction) => {

    client.Dispatch = async () => {

        client.config = require("../config.json");

        const makeConnection = require("../utils/database");
        const db = await makeConnection();

        const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("🔨 Choississez le type de message.")
        .setDescription("Choisissez si vous souhaitez créer un message de dispatch ou créer un message de cérémonie.")
        .setFooter({ text: "LSPD • Los Santos Police Department"})

        const CeremonieButton = new ButtonBuilder()
        .setCustomId("button_ceremonie")
        .setLabel("🎖️Cérémonie")
        .setStyle(ButtonStyle.Primary)

        const DispatchButton = new ButtonBuilder()
        .setCustomId("button_dispatch")
        .setLabel("🚨Dispatch")
        .setStyle(ButtonStyle.Secondary)

        const actionRow = new ActionRowBuilder()
        .addComponents(CeremonieButton, DispatchButton)

        client.channels.cache.get("1241526405322506331").messages.fetch("1241717047650684970").then(msg => {

        msg.edit({ embeds: [embed], components: [actionRow] }).then(async (msg) => {
        
        const filter = (m) => m.customId === "button_ceremonie" || "button_dispatch";
        const collector = await msg.channel.createMessageComponentCollector({ filter });

        collector.on("collect", async (interaction) => {
        
            await msg.edit({ embeds: [embed], components: [actionRow] })




            // Modal Ceremonie
            const ModalCeremonie = new ModalBuilder()
            .setCustomId("modal_ceremonie")
            .setTitle("🎖️ Création d'un message de cérémonie")

            const TitleCeremonie = new TextInputBuilder()
            .setCustomId("title_ceremonie")
            .setPlaceholder("Cérémonie le 01/01 à 21h30")
            .setLabel("Titre de la cérémonie")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(500)
            .setMinLength(1)

            const DescriptionCeremonie = new TextInputBuilder()
            .setCustomId("description_ceremonie")
            .setPlaceholder("Pensez à vous équiper de votre tenue de cérémonie.")
            .setLabel("Message à faire passer au agent.")
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(500)
            .setMinLength(1)

            const CeremonieActionRow = new ActionRowBuilder()
            .addComponents(TitleCeremonie)

            const CeremonieActionRow2 = new ActionRowBuilder()
            .addComponents(DescriptionCeremonie)
            
            ModalCeremonie.addComponents(CeremonieActionRow, CeremonieActionRow2)



            // Modal Dispatch
            const ModalDispatch = new ModalBuilder()
            .setCustomId("modal_dispatch")
            .setTitle("🚨 Création d'un message de dispatch")

            const TitleDispatch = new TextInputBuilder()
            .setCustomId("title_dispatch")
            .setPlaceholder("Dispatch du 01/01 à 21h30")
            .setLabel("Titre du dispatch")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(500)
            .setMinLength(1)

            const DescriptionDispatch = new TextInputBuilder()
            .setCustomId("description_dispatch")
            .setPlaceholder("Pensez à vous équiper de votre tenue de service.")
            .setLabel("Message à faire passer au agent.")
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(500)
            .setMinLength(1)

            const DispatchActionRow = new ActionRowBuilder()
            .addComponents(TitleDispatch)
            const DispatchActionRow2 = new ActionRowBuilder()
            .addComponents(DescriptionDispatch)
        
            ModalDispatch.addComponents(DispatchActionRow, DispatchActionRow2)





            if(interaction.customId === "button_ceremonie") {
                
                interaction.showModal(ModalCeremonie)
            } else if(interaction.customId === "button_dispatch") {
                
                interaction.showModal(ModalDispatch)
            }

        })

        client.on(Events.InteractionCreate, async (interaction) => {
            if(interaction.isModalSubmit()) {



                    if(interaction.customId === "modal_ceremonie") {


                        let titleC = interaction.fields.getTextInputValue("title_ceremonie")
                        let descriptionC = interaction.fields.getTextInputValue("description_ceremonie")

                        if(descriptionC === "0") descriptionC = "";

                        db.query(`SELECT COUNT(userID) FROM presence_ceremonie`, function (error, resultsCountPresent, fields) {
                            db.query(`SELECT COUNT(userID) FROM absence_ceremonie`, function (error, resultsCountAbsent, fields) {
                                db.query(`SELECT COUNT(userID) FROM retard_ceremonie`, function (error, resultsCountRetard, fields) {
                                    db.query(`SELECT * FROM ceremonie`, function(error, results, fields) { 

                                        const CeremonieEmbed = new EmbedBuilder()
                                        .setColor("Blue")
                                        .setTitle(`${client.config.ceremonie} ${titleC} ${client.config.ceremonie}`)
                                        .setDescription(`${descriptionC}\n\n__**Réagissez pour indiquer votre présence.**__\n\n> __**${resultsCountPresent[0]['COUNT(userID)']} Présent :**__ <a:present:1241518769378168842>\n> __**Absent :**__ <a:absent:1241518745101537411>\n\n\nN'oubliez pas de justifier vos absences (ping channel) !\n\n<a:gyro:1241518732073766983> __**RÉACTION OBLIGATOIRE**__`)
                                        .setTimestamp()
                                        .setFooter({ text: "LSPD • Los Santos Police Department"})

                                        const CeremoniePresent = new ButtonBuilder()
                                        .setCustomId("ceremonie_present")
                                        .setLabel(`✅${resultsCountPresent[0]['COUNT(userID)']}`)
                                        .setStyle(ButtonStyle.Success)

                                        const CeremonieAbsent = new ButtonBuilder()
                                        .setCustomId("ceremonie_absent")
                                        .setLabel(`❌${resultsCountAbsent[0]['COUNT(userID)']}`)
                                        .setStyle(ButtonStyle.Danger)

                                        const CeremonieRetard = new ButtonBuilder()
                                        .setCustomId("ceremonie_retard")
                                        .setLabel(`🕒${resultsCountRetard[0]['COUNT(userID)']}`)
                                        .setStyle(ButtonStyle.Primary)


                                        const actionRowPresenceCeremonie = new ActionRowBuilder().addComponents(CeremoniePresent, CeremonieAbsent, CeremonieRetard)

                                        interaction.reply({ content: "L'annonce de cérémonie à été envoyé.", ephemeral: true})

                                        const ChannelToSendMsgCeremonie = client.channels.cache.get(client.config.channelCeremonieDispatch)

                                        ChannelToSendMsgCeremonie.send({ content: client.config.mentions, embeds: [CeremonieEmbed], components: [actionRowPresenceCeremonie]}).then((message) => {


                                            if(results[0].channelID !== client.config.channelCeremonieDispatch) {

                                                
                                                
                                                db.query(`INSERT INTO ceremonie (userID, channelID, messageID, titleCeremonie, descCeremonie) VALUES ('${interaction.user.id}', '${client.config.channelCeremonieDispatch}', '${message.id}', '${titleC}', '${descriptionC}')`, function (error, results, fields) {
                                                    if(error) {
                                                        console.log(error)
                                                    }
                                                })
                                            } else 
                                            if(results[0].channelID === client.config.channelCeremonieDispatch) {

                                                ChannelToSendMsgCeremonie.messages.fetch(results[0].messageID).then((msg) => msg.delete())
                                                
                                                db.query(`UPDATE ceremonie SET userID = '${interaction.user.id}', channelID = '${client.config.channelCeremonieDispatch}', messageID = '${message.id}', titleCeremonie = '${titleC}', descCeremonie = '${descriptionC}' WHERE id=1`, function (error, results, fields) {
                                                    if(error) {
                                                        console.log(error)
                                                    }
                                                })
                                            }
                                        })
                                        
                                        // db.query(`INSERT INTO presence_ceremonie (title, description) VALUES ('${title}', '${description}')`, function (error, results, fields) {
                                        //     if(error) {
                                        //         console.log(error)
                                        //     } else {
                                        //         interaction.update({ content: "Message de cérémonie créé avec succès.", components: [] })
                                        //     }
                                        // })
                                                })
                                            })
                                        })
                                    })

                                    }
                                    
                                    
                                    
                                    
                                    else if(interaction.customId === "modal_dispatch") {


                                        const titleD = interaction.fields.getTextInputValue("title_dispatch")
                                        const descriptionD = interaction.fields.getTextInputValue("description_dispatch")

                                        if(descriptionD === "0") descriptionD = "";

                                        db.query(`SELECT COUNT(userID) FROM presence_dispatch`, function (error, resultsCountPresent, fields) {
                                            db.query(`SELECT COUNT(userID) FROM absence_dispatch`, function (error, resultsCountAbsent, fields) {
                                                db.query(`SELECT COUNT(userID) FROM retard_dispatch`, function (error, resultsCountRetard, fields) {
                                                    db.query(`SELECT * FROM ceremonie`, function(error, results, fields) { 

                                                        if(resultsCountPresent[0]['COUNT(userID)'] == "1") resultsCountPresent[0]['COUNT(userID)'] == "0"
                
                                                        const DispatchEmbed = new EmbedBuilder()
                                                        .setColor("Blue")
                                                        .setTitle(`${client.config.dispatch} ${titleD} ${client.config.dispatch}`)
                                                        .setDescription(`${descriptionD}\n\n__**Réagissez pour indiquer votre présence.**__\n\n> __**Présent :**__ <a:present:1241518769378168842>\n> __**Absent :**__ <a:absent:1241518745101537411>\n\n\nN'oubliez pas de justifier vos absences (ping channel) !\n\n<a:gyro:1241518732073766983> __**RÉACTION OBLIGATOIRE**__`)
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
                
                                                        interaction.reply({ content: "L'annonce de dispatch à été envoyé.", ephemeral: true})

                                                        const ChannelToSendMsgCeremonie = client.channels.cache.get(client.config.channelCeremonieDispatch)
                
                                                        ChannelToSendMsgCeremonie.send({ content: client.config.mentions, embeds: [DispatchEmbed], components: [actionRowPresenceDispatch]}).then(async (message) => {
                
                                                        if(results[0].channelID !== client.config.channelCeremonieDispatch) {

                                                               

                                                                db.query(`INSERT INTO dispatch (userID, channelID, messageID, titleDispatch, descDispatch) VALUES ('${interaction.user.id}', '${client.config.channelCeremonieDispatch}', '${message.id}', '${titleD}', '${descriptionD}')`)
                                                            } else 
                                                            if(results[0].channelID === client.config.channelCeremonieDispatch) {
                                                                

                                                            
                                                                
                                                                ChannelToSendMsgCeremonie.messages.fetch(results[0].messageID).then(msg => msg.delete())


                                                                db.query(`UPDATE ceremonie SET userID = ${interaction.user.id} WHERE id=1`)
                                                                db.query(`UPDATE ceremonie SET channelID = ${client.config.channelCeremonieDispatch} WHERE id=1`)
                                                                db.query(`UPDATE ceremonie SET messageID = ${message.id} WHERE id=1`)
                                                                db.query(`UPDATE ceremonie SET titleCeremonie = ${titleD} WHERE id=1`)
                                                                db.query(`UPDATE ceremonie SET descCeremonie = ${descriptionD} WHERE id=1`)

                                                                
                                                            }

                                                            const filterPresence = (t) => t.customId === "dispatch_present" || "dispatch_absent" || "dispatch_retard"
                                                            const collector = await message.channel.createMessageComponentCollector({ filter: filterPresence})

                                                            collector.on("collect", async (p) => {
                                                                
                                                                
                                                                if(p.customId === "dispatch_present") {

                                                                    const userreact = p.user.id
                                                                    const logschannel = client.channels.cache.get(client.config.logsChannel)

                                                                    

                                                                    db.query(`SELECT * FROM presence_dispatch WHERE userID = ${userreact}`, function(error, resultsPresentDispatch, fields) {

                                                                        if(resultsPresentDispatch == "") {

                                                                            db.query(`INSERT INTO presence_dispatch (userID) VALUES ('${userreact}')`)
                                                                            p.reply({ content: "> Vous avez réagis présent.", ephemeral: true})

                                                                            
                                                                                db.query(`SELECT * FROM ceremonie`, function(error, results, fields) {
                                                                                   

                                                                                    DispatchPresent.setLabel(`✅${resultsCountPresent[0]['COUNT(userID)'] ++ +1}`)

                                                                                    const DispatchEmbed2 = new EmbedBuilder()
                                                                                    .setColor("Blue")
                                                                                    .setTitle(`${client.config.dispatch} ${titleD} ${client.config.dispatch}`)
                                                                                    .setDescription(`${descriptionD}\n\n__**Réagissez pour indiquer votre présence.**__\n\n> __**Présent :**__ <a:present:1241518769378168842>\n> __**Absent :**__ <a:absent:1241518745101537411>\n\n\nN'oubliez pas de justifier vos absences (ping channel) !\n\n<a:gyro:1241518732073766983> __**RÉACTION OBLIGATOIRE**__`)
                                                                                    .setTimestamp()
                                                                                    .setFooter({ text: "LSPD • Los Santos Police Department"})


                                                                                    client.channels.cache.get(client.config.channelCeremonieDispatch).messages.fetch(results[0].messageID).then(async (msg) => {
                                                                                            await msg.edit({ content: client.config.mentions, embeds: [DispatchEmbed2], components: [actionRowPresenceDispatch]})
                                                                                            logschannel.send({ content: `> <@${userreact}> a voté présent pour le dispatch.`})
                                                                                  
                                                                                })
                                                                            
                                                                            })

                                                                        } else if(resultsPresentDispatch !== "") {

                                                                           db.query(`DELETE FROM presence_dispatch WHERE userID = ${userreact}`)
                                                                           p.reply({ content: "> Vous avez annulé votre présence au dispatch.", ephemeral: true})

                                                                           db.query(`SELECT * FROM ceremonie`, function(error, results, fields) {
                                                                            
                                                                            DispatchPresent.setLabel(`✅${resultsCountPresent[0]['COUNT(userID)'] -- -1}`)


                                                                            const DispatchEmbed3 = new EmbedBuilder()
                                                                            .setColor("Blue")
                                                                            .setTitle(`${client.config.dispatch} ${titleD} ${client.config.dispatch}`)
                                                                            .setDescription(`${descriptionD}\n\n__**Réagissez pour indiquer votre présence.**__\n\n> __**Présent :**__ <a:present:1241518769378168842>\n> __**Absent :**__ <a:absent:1241518745101537411>\n\n\nN'oubliez pas de justifier vos absences (ping channel) !\n\n<a:gyro:1241518732073766983> __**RÉACTION OBLIGATOIRE**__`)
                                                                            .setTimestamp()
                                                                            .setFooter({ text: "LSPD • Los Santos Police Department"})
                                                                            
                                                                            client.channels.cache.get(client.config.channelCeremonieDispatch).messages.fetch(results[0].messageID).then(async (msg) => {
                                                                                await msg.edit({ content: client.config.mentions, embeds: [DispatchEmbed3], components: [actionRowPresenceDispatch]})
                                                                                logschannel.send({ content: `> <@${userreact}> a annulé sa présence au le dispatch.`})
                                                                      
                                                                    })
                                                                        })

                                                                        }
                                                                    })
                                                                }
                                                                else if(p.customId === "dispatch_absent") {

                                                                    
                                                                    const userreact = p.user.id
                                                                    const logschannel = client.channels.cache.get(client.config.logsChannel)

                                                                    

                                                                    db.query(`SELECT * FROM absence_dispatch WHERE userID = ${userreact}`, function(error, resultsPresentDispatch, fields) {

                                                                        if(resultsPresentDispatch == "") {

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

                                                                            p.showModal(modalAbsence)

                                                                            if(p.isModalSubmit()) {

                                                                            const GradeResponse = interaction.fields.getTextInputValue("grade")
                                                                            const NameResponse = interaction.fields.getTextInputValue("name")
                                                                            const TimeResponse = interaction.fields.getTextInputValue("time")
                                                                            const JustificationResponse = interaction.fields.getTextInputValue("justification")


                                                                            db.query(`INSERT INTO absence_dispatch (userID) VALUES ('${userreact}')`)
                                                                            p.reply({ content: "> Vous avez voté que vous serez absent pour le dispatch.", ephemeral: true})

                                                                            
                                                                                db.query(`SELECT * FROM ceremonie`, function(error, results, fields) {
                                                                                   

                                                                                    DispatchAbsent.setLabel(`❌${resultsCountAbsent[0]['COUNT(userID)'] ++ +1}`)

                                                                                    const DispatchEmbed = new EmbedBuilder()
                                                                                    .setColor("Blue")
                                                                                    .setTitle(`${client.config.dispatch} ${titleD} ${client.config.dispatch}`)
                                                                                    .setDescription(`${descriptionD}\n\n__**Réagissez pour indiquer votre présence.**__\n\n> __**Présent :**__ <a:present:1241518769378168842>\n> __**Absent :**__ <a:absent:1241518745101537411>\n\n\nN'oubliez pas de justifier vos absences (ping channel) !\n\n<a:gyro:1241518732073766983> __**RÉACTION OBLIGATOIRE**__`)
                                                                                    .setTimestamp()
                                                                                    .setFooter({ text: "LSPD • Los Santos Police Department"})

                                                                                    const embedAbsence = new EmbedBuilder()
                                                                                    .setColor("Blue")
                                                                                    .setAuthor({ name: p.user.username })
                                                                                    .setTitle("Nouvelle absence")
                                                                                    .setDescription({ content: `> **Grade:** ${GradeResponse}\n> **Nom et Prénom:** ${NameResponse}\n> **Durée de l'absence:** ${TimeResponse}\n> **Motif de l'absence:** ${JustificationResponse}`})

                                                                                    client.channels.cache.get(client.config.absenceChannel).send({ content: `> <@${userreact}> a voté absent pour le dispatch.`})

                                                                                    client.channels.cache.get(client.config.channelCeremonieDispatch).messages.fetch(results[0].messageID).then(async (msg) => {
                                                                                            await msg.edit({ content: client.config.mentions, embeds: [DispatchEmbed], components: [actionRowPresenceDispatch]})
                                                                                            logschannel.send({ content: `> <@${userreact}> a voté absent pour le dispatch.`})
                                                                                  
                                                                                })
                                                                            
                                                                            })

                                                                        }

                                                                        } else if(resultsPresentDispatch !== "") {

                                                                           db.query(`DELETE FROM absence_dispatch WHERE userID = ${userreact}`)
                                                                           p.reply({ content: "> Vous avez annulé votre présence au dispatch.", ephemeral: true})

                                                                           db.query(`SELECT * FROM ceremonie`, function(error, results, fields) {
                                                                            
                                                                            DispatchPresent.setLabel(`✅${resultsCountPresent[0]['COUNT(userID)'] -- -1}`)


                                                                            const DispatchEmbed3 = new EmbedBuilder()
                                                                            .setColor("Blue")
                                                                            .setTitle(`${client.config.dispatch} ${titleD} ${client.config.dispatch}`)
                                                                            .setDescription(`${descriptionD}\n\n__**Réagissez pour indiquer votre présence.**__\n\n> __**Présent :**__ <a:present:1241518769378168842>\n> __**Absent :**__ <a:absent:1241518745101537411>\n\n\nN'oubliez pas de justifier vos absences (ping channel) !\n\n<a:gyro:1241518732073766983> __**RÉACTION OBLIGATOIRE**__`)
                                                                            .setTimestamp()
                                                                            .setFooter({ text: "LSPD • Los Santos Police Department"})
                                                                            
                                                                            client.channels.cache.get(client.config.channelCeremonieDispatch).messages.fetch(results[0].messageID).then(async (msg) => {
                                                                                await msg.edit({ content: client.config.mentions, embeds: [DispatchEmbed3], components: [actionRowPresenceDispatch]})
                                                                                logschannel.send({ content: `> <@${userreact}> a annulé sa présence au le dispatch.`})
                                                                      
                                                                    })
                                                                        })

                                                                        }
                                                                    })
                                                                
                                                            }
                                                        
                                                            })
                                                        })
                                                        
                                                        // db.query(`INSERT INTO presence_ceremonie (title, description) VALUES ('${title}', '${description}')`, function (error, results, fields) {
                                                        //     if(error) {
                                                        //         console.log(error)
                                                        //     } else {
                                                        //         interaction.update({ content: "Message de cérémonie créé avec succès.", components: [] })
                                                        //     }
                                                        // })
                                                                })
                                                            })
                                                        })
                                                    })
                
                                            
                                }
                        } // IsModalSubmit
                    }) // Fin de l'interaction create




                }) // Fin du msg.edit
            }) // Fin du fetch du message
        }
}
