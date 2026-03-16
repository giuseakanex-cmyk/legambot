// plugin fatto da deadly

let handler = async (m, { conn }) => {
    let user = m.sender
    if (!global.db.data.users[user]) global.db.data.users[user] = {}
    let u = global.db.data.users[user]
    if (!u.euro) u.euro = 0

    // lavori casuali
    const jobs = [
        {nome:'🍔 Cameriere', paga: randomNum(50,100)},
        {nome:'💻 Freelance', paga: randomNum(100,200)},
        {nome:'🧹 Pulizie', paga: randomNum(30,60)},
        {nome:'🚗 Corriere', paga: randomNum(80,160)},
        {nome:'🛠️ Manovale', paga: randomNum(60,120)}
    ]

    const job = random(jobs)
    u.euro += job.paga
    
    await conn.reply(m.chat,
        `💼 Hai lavorato come *${job.nome}*\n` +
        `Hai guadagnato *${job.paga} €*!\n\n` +
        `💶 Totale contanti: ${u.euro} €`, m)
}

handler.command = /^work|lavora$/i
export default handler

function random(arr) { return arr[Math.floor(Math.random()*arr.length)] }
function randomNum(min,max){ return Math.floor(Math.random() * (max - min + 1)) + min }
