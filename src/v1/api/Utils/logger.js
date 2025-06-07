import pino from 'pino';
import dayjs from 'dayjs';
import pinoPretty from 'pino-pretty';
const options = {
  base: {
    pid: false, 
  },
  prettifier: pinoPretty, 
  colorize: true, 
  customColors: {
    info: 'green',  
    error: 'red',    
    warn: 'yellow',  
  },
  timestamp: () => `,"time":"${dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')}"`, 
};

const log = pino(options);
export default log;
