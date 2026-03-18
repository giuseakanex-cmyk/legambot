let handler = async (m, { conn, text, isROwner, isOwner }) => {
    if (text) {
        if (text.toLowerCase() === 'reset') {
            global.db.data.chats[m.chat].sWelcome = ''
            return m.reply(`ⓘ 𝐈𝐥 𝐛𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐫𝐢𝐩𝐫𝐢𝐬𝐭𝐢𝐧𝐚𝐭𝐨 𝐚𝐥 𝐝𝐞𝐟𝐚𝐮𝐥𝐭.`)
        }
        global.db.data.chats[m.chat].sWelcome = text
        m.reply(`ⓘ 𝐈𝐥 𝐛𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐭𝐨`)
    } else {
        throw `> ⓘ 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐢𝐥 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐝𝐢 𝐛𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨 𝐜𝐡𝐞 𝐝𝐞𝐬𝐢𝐝𝐞𝐫𝐢 𝐚𝐠𝐠𝐢𝐮𝐧𝐠𝐞𝐫𝐞, 𝐮𝐬𝐚:\n> - @user ( menzione )\n> - @group ( nome del gruppo )\n> - @desc ( descrizione del gruppo)\n\n> 💡 *Scrivi* \`.setwelcome reset\` *per tornare a quello base.*`
    }
}
handler.help = ['setwelcome <text>']
handler.tags = ['gruppo']
handler.command = ['setwelcome'] 
handler.admin = true
export default handler


