import os from "node:os";
import { colorize } from "./color";
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const platform: NodeJS.Platform = os.platform();
const downloadUrlMap: Record<string, string> = {
  win32: "https://ollama.com/download/OllamaSetup.exe",
  darwin: "https://ollama.com/download/Ollama-darwin.zip",
} 

const allowedPlatforms = Object.keys(downloadUrlMap) ;

export function getOllamaDownloadUrl(): string | null {
    if(allowedPlatforms.includes(platform)){
        return downloadUrlMap[platform]
    }
   else{
    console.error(colorize("Unsupported platform:", "red"), platform);
    return null
   }
}



export const getOllamaPort = async (): Promise<number | null> => {
  try {
    let pidCommand = '';
    let portCommand = '';

    // 根据操作系统选择适当的命令
    if (process.platform === 'win32') {
      pidCommand = 'tasklist /fi "imagename eq ollama.exe" /fo csv /nh';
      portCommand = 'netstat -ano | findstr LISTENING | findstr ';
    } else if (process.platform === 'darwin') {
      pidCommand = 'pgrep -f "ollama serve"';
      portCommand = 'lsof -i -P -n | grep LISTEN | grep ';
    } else {
      console.error('Unsupported platform:', process.platform);
      return null;
    }

    // 查询 ollama serve 的 PID
    const { stdout: pidOutput } = await execPromise(pidCommand);
    const pidMatch = pidOutput.trim().match(/\d+/);
    if (!pidMatch) {
      return null;
    }
    const pid = pidMatch[0];

    // 查询该 PID 对应的端口号
    const { stdout: portOutput } = await execPromise(`${portCommand}${pid}`);
    const portMatch = portOutput.trim().match(/\d+$/);
    console.log("🚀 ~ getOllamaPort ~ portMatch:", portMatch)
    
    if (portMatch) {
      return parseInt(portMatch[0], 10);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error retrieving ollama serve port:', error);
    return null;
  }
};

