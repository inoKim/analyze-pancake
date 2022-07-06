import clc from "cli-color";


const _Title = (_context: string): string => clc.bgGreenBright.white.italic(_context)
const _Notice = (_context: string): string => clc.cyan.bold(_context)
const _Log = (_context: string): string => clc.green.bold.italic(_context)

const Deploy = (_context: string) => console.log(`<<DEPLOY>> ${clc.whiteBright.bold.redBright(_context)}`)
const Title = (_context: string) => console.log(_Title(_context))
const Notice = (_context: string) => console.log(_Notice(_context))
const Log = (_context: string) => console.log(_Log(_context))


export default{ _Title, Deploy, Title, Notice, Log }