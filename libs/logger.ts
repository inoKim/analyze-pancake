import clc from "cli-color";


const _Title = (_context: string): string => clc.bgGreenBright.white.italic(_context)
const _Notice = (_context: string): string => clc.cyan.bold(_context)
const _Log = (_context: string): string => clc.blue.italic(_context)

export const Deploy = (_context: string) => console.log(`<<DEPLOY>> ${clc.whiteBright.bold.redBright(_context)}`)
// export const Deploy = (_context: string) => {}
export const Title = (_context: string) => console.log(_Title(_context))
export const Notice = (_context: string) => console.log(_Notice(_context))
export const Log = (_context: string) => console.log(_Log(_context))

export const  TitleEx= (_context: string):string => {return _Title(_context)}
