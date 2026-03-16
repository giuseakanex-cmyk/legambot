import fs from 'fs'
import path from 'path'

const RUNTIME_GLOBALS = new Set([
    'fkontak', 'rcanal', 'fake', 'estilo', 'foto', 'nome', 'readMore',
    'canaleRD', 'authsticker', 'packsticker', 'nomepack', 'nomebot',
    'wm', 'autore', 'dev', 'testobot', 'versione', 'errore',
    'sam', 'owner', 'mods', 'prems', 'APIKeys', 'prefix', 'db',
    'DATABASE', 'opts', 'conns', 'conn', 'store', 'timestamp',
    'repobot', 'gruppo', 'canale', 'insta', 'multiplier',
    'defaultPrefix', 'authFile', 'authFileJB', 'creds',
    'IdCanale', 'NomeCanale', 'loadDatabase', 'reloadHandler',
    'plugins', 'groupCache', 'jidCache', 'nameCache',
    'processedCalls', 'activeEvents', 'activeGiveaways',
    'ignoredUsersGlobal', 'ignoredUsersGroup', 'groupSpam',
    'dfail', 'API', 'APIs'
])

const SUSPECT_REFS = [
    { pattern: /\btempdir\s*\(/, name: 'tempdir()', fix: "import { tmpdir } from 'os'" },
]

function hasValidExport(src) {
    return /export\s+default\b/.test(src) ||
           /export\s+(async\s+)?function\s+(before|handler|all|onCall)\b/.test(src) ||
           /export\s*\{[^}]*(before|handler|all)\b[^}]*\}/.test(src)
}

function getPluginType(src) {
    const hasCommand = /\.command\s*=/.test(src)
    const hasBefore = /export\s+(async\s+)?function\s+before\b/.test(src) ||
                      /\.before\s*=\s*(async\s+)?function/.test(src) ||
                      /export\s*\{[^}]*before[^}]*\}/.test(src)
    const hasAll = /\.all\s*=\s*(async\s+)?function/.test(src) ||
                   /export\s+(async\s+)?function\s+all\b/.test(src)
    const hasOnCall = /\.onCall\s*=\s*(async\s+)?function/.test(src)

    if (hasCommand && !hasBefore && !hasAll) return 'command'
    if (hasBefore || hasAll) return 'hook'
    if (hasOnCall) return 'oncall'
    if (hasCommand) return 'command'
    return 'unknown'
}

function stripStringsAndComments(src) {
    return src
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/`[\s\S]*?`/g, '""')
        .replace(/'(?:[^'\\]|\\.)*'/g, '""')
        .replace(/"(?:[^"\\]|\\.)*"/g, '""')
        .replace(/\/(?:[^/\\]|\\.)+\/[gimsuy]*/g, '""')
}

function checkPlugin(file, content) {
    const issues = []
    const type = getPluginType(content)
    const stripped = stripStringsAndComments(content)

    if (!hasValidExport(content)) {
        issues.push({ sev: 'crit', msg: 'Nessun export valido trovato' })
    }

    const loaded = global.plugins?.[file]
    if (!loaded) {
        issues.push({ sev: 'crit', msg: 'Non caricato in memoria (errore import/sintassi)' })
    } else {
        if (type === 'command') {
            if (typeof loaded !== 'function') {
                issues.push({ sev: 'crit', msg: 'Comando non eseguibile (export default non è una funzione)' })
            }
            if (!loaded.command) {
                issues.push({ sev: 'crit', msg: 'handler.command non definito' })
            }
        }
        if (type === 'hook') {
            if (typeof loaded.before !== 'function' && typeof loaded.all !== 'function') {
                issues.push({ sev: 'crit', msg: 'Hook senza before/all valido' })
            }
        }
        if (type === 'oncall') {
            if (typeof loaded.onCall !== 'function') {
                issues.push({ sev: 'crit', msg: 'Plugin onCall senza funzione onCall valida' })
            }
        }
    }

    if (type === 'command' && loaded) {
        if (!loaded.help && !loaded.menu) {
            issues.push({ sev: 'warn', msg: 'Manca handler.help (non apparirà nel menu)' })
        }
        if (!loaded.tags) {
            issues.push({ sev: 'warn', msg: 'Manca handler.tags (non categorizzato)' })
        }
    }

    for (const { pattern, name, fix } of SUSPECT_REFS) {
        if (pattern.test(stripped)) {
            const importCheck = new RegExp(`import\\s+.*\\b${name.replace(/[()]/g, '')}\\b`)
            const declCheck = new RegExp(`(const|let|var)\\s+${name.replace(/[()]/g, '')}\\b`)
            if (!importCheck.test(content) && !declCheck.test(content)) {
                issues.push({ sev: 'crit', msg: `\`${name}\` usato ma mai importato → ${fix}` })
            }
        }
    }

    const openB = (stripped.match(/\{/g) || []).length
    const closeB = (stripped.match(/\}/g) || []).length
    if (openB !== closeB) {
        issues.push({ sev: 'crit', msg: `Graffe sbilanciate: { ×${openB} vs } ×${closeB}` })
    }

    const openP = (stripped.match(/\(/g) || []).length
    const closeP = (stripped.match(/\)/g) || []).length
    if (openP !== closeP) {
        issues.push({ sev: 'crit', msg: `Tonde sbilanciate: ( ×${openP} vs ) ×${closeP}` })
    }

    if (content.length === 0) {
        issues.push({ sev: 'crit', msg: 'File vuoto' })
    }

    if (type === 'command' && loaded && typeof loaded === 'function') {
        const flags = ['sam', 'owner', 'mods', 'premium', 'group', 'admin', 'botAdmin', 'private', 'register']
        const activeFlags = flags.filter(f => loaded[f])
        if (activeFlags.length > 0) {
            const conflictPrivateGroup = loaded.private && loaded.group
            if (conflictPrivateGroup) {
                issues.push({ sev: 'warn', msg: 'Flag conflitto: private + group attivi insieme' })
            }
        }
    }

    return issues
}

let handler = async (m, { conn, text }) => {
    const pluginsFolder = path.join(process.cwd(), 'plugins')

    try {
        if (!fs.existsSync(pluginsFolder)) {
            throw new Error(`Cartella plugins non trovata: ${pluginsFolder}`)
        }

        let statusMsg = await conn.sendMessage(m.chat, {
            text: `> 『 🔍 』 \`Analisi in corso...\`\n\n> \`${global.wm || 'vare ✧ bot'}\``
        }, { quoted: m })

        const files = await fs.promises.readdir(pluginsFolder)
        const jsFiles = files.filter(f => f.endsWith('.js'))
        const loadedKeys = Object.keys(global.plugins || {})
        let results = []
        let critici = 0
        let avvisi = 0
        let sani = 0
        let tipi = { command: 0, hook: 0, oncall: 0, unknown: 0 }

        for (const file of jsFiles) {
            try {
                const filePath = path.join(pluginsFolder, file)
                const stats = await fs.promises.stat(filePath)
                if (!stats.isFile()) continue

                const content = await fs.promises.readFile(filePath, 'utf8')
                const type = getPluginType(content)
                tipi[type] = (tipi[type] || 0) + 1
                const issues = checkPlugin(file, content)

                if (issues.length > 0) {
                    const hasCrit = issues.some(i => i.sev === 'crit')
                    if (hasCrit) critici++
                    else avvisi++
                    results.push({ file, issues, type })
                } else {
                    sani++
                }
            } catch (e) {
                critici++
                results.push({
                    file,
                    issues: [{ sev: 'crit', msg: `Errore lettura: ${e.message}` }],
                    type: '?'
                })
            }
        }

        const notLoaded = jsFiles.filter(f => !loadedKeys.includes(f))

        let r = `> 『 🔍 』 \`Auto-Diagnosi\`\n\n`

        if (results.length === 0) {
            r += `> 『 ✅ 』 \`Tutti i ${jsFiles.length} plugin sono in ordine.\`\n`
        } else {
            const crits = results.filter(x => x.issues.some(i => i.sev === 'crit'))
            const warns = results.filter(x => !x.issues.some(i => i.sev === 'crit'))

            if (crits.length > 0) {
                r += `*┌─ 🔴 Critici (${crits.length})*\n`
                for (const { file, issues } of crits) {
                    r += `*├ 📁* \`${file}\`\n`
                    for (const i of issues) {
                        r += `*│*  ${i.sev === 'crit' ? '🔴' : '🟡'} ${i.msg}\n`
                    }
                }
                r += `*╰─────────*\n\n`
            }

            if (warns.length > 0) {
                r += `*┌─ 🟡 Avvisi (${warns.length})*\n`
                for (const { file, issues } of warns) {
                    r += `*├ 📁* \`${file}\`\n`
                    for (const i of issues) {
                        r += `*│*  🟡 ${i.msg}\n`
                    }
                }
                r += `*╰─────────*\n\n`
            }
        }

        r += `*┌─ 📊 Riepilogo*\n`
        r += `*│* Totali: \`${jsFiles.length}\` · Sani: \`${sani}\` · Errori: \`${critici}\` · Avvisi: \`${avvisi}\`\n`
        r += `*│* Caricati: \`${loadedKeys.length}/${jsFiles.length}\`\n`
        r += `*│* Comandi: \`${tipi.command}\` · Hook: \`${tipi.hook}\` · OnCall: \`${tipi.oncall}\`\n`
        if (notLoaded.length > 0 && notLoaded.length <= 10) {
            r += `*│* Non caricati: ${notLoaded.map(f => `\`${f}\``).join(', ')}\n`
        } else if (notLoaded.length > 10) {
            r += `*│* Non caricati: \`${notLoaded.length}\` plugin\n`
        }
        r += `*╰─────────*\n`

        if (text && text.length >= 5) {
            r += `\n*┌─ 💬 Nota*\n`
            r += `*│* @${m.sender.split('@')[0]}: ${text}\n`
            r += `*╰─────────*\n`
        }

        r += `\n> \`${global.wm || 'vare ✧ bot'}\``

        await conn.sendMessage(m.chat, {
            text: r,
            edit: statusMsg.key,
            mentions: text ? [m.sender] : []
        })

    } catch (e) {
        console.error('[BUGHUNT] Errore critico:', e)
        await conn.sendMessage(m.chat, {
            text: `> 『 ❌ 』 \`Errore\`\n> \`${e.message}\`\n\n> \`${global.wm || 'vare ✧ bot'}\``
        }, { quoted: m }).catch(console.error)
    }
}

handler.help = ['bughunt']
handler.tags = ['creatore']
handler.command = ['bughunt', 'diagnosi']
handler.owner = true

export default handler