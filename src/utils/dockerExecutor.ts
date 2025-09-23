import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface ExecutionResult {
  status: 'success' | 'error' | 'timeout';
  output?: string;
  error?: string;
  executionTime?: number;
  memoryUsed?: number;
  consoleOutput?: string; 
}

export const dockerExecutor = {
  runCode: (code: string, language: string, timeLimit: number, memoryLimit: number): Promise<ExecutionResult> => {
    return new Promise((resolve) => {
      const id = uuidv4();
      const tempDir = path.join(__dirname, '..', 'temp', id);
      
      let resolved = false;
      const startTime = Date.now();
      
      const cleanup = () => {
        try {
          if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
          }
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      };

      const timeoutHandler = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve({
            status: 'timeout',
            error: 'Time limit exceeded - your code took too long to execute',
            executionTime: Date.now() - startTime,
            consoleOutput: ''
          });
        }
      }, timeLimit + 1000); 

      try {
        fs.mkdirSync(tempDir, { recursive: true });
        const fileName = getFileName(language);
        const filePath = path.join(tempDir, fileName);
        fs.writeFileSync(filePath, code);

        const dockerCmd = getDockerCommand(language, filePath, timeLimit, memoryLimit);

        const childProcess = exec(dockerCmd, { 
          timeout: timeLimit + 1000,
          killSignal: 'SIGKILL' 
        }, (error, stdout, stderr) => {
          if (resolved) return; 
          
          resolved = true;
          clearTimeout(timeoutHandler);
          const executionTime = Date.now() - startTime;
          cleanup();

          if (error) {
            if (error.killed || error.signal === 'SIGTERM' || error.signal === 'SIGKILL') {
              return resolve({ 
                status: 'timeout', 
                error: 'Time limit exceeded - your code took too long to execute',
                executionTime,
                consoleOutput: extractConsoleOutput(stdout)
              });
            }
            
            if (stderr && (stderr.includes('Killed') || stderr.includes('memory'))) {
              return resolve({ 
                status: 'error', 
                error: 'Memory limit exceeded',
                executionTime,
                consoleOutput: extractConsoleOutput(stdout)
              });
            }
            
            return resolve({ 
              status: 'error', 
              error: stderr || error.message || 'Execution failed',
              executionTime,
              consoleOutput: extractConsoleOutput(stdout)
            });
          }

         
          if (stderr && 
              !stderr.includes('Pulling from library') && 
              !stderr.includes('Status: Downloaded') &&
              !stderr.includes('Status: Image is up to date')) {
            return resolve({ 
              status: 'error', 
              error: stderr,
              executionTime,
              consoleOutput: extractConsoleOutput(stdout)
            });
          }

          const result = parseExecutionOutput(stdout);
          return resolve({ 
            status: 'success', 
            output: result.programOutput,
            executionTime,
            consoleOutput: result.consoleOutput
          });
        });

        childProcess.on('error', (err) => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutHandler);
          cleanup();
          
          resolve({
            status: 'error',
            error: `Process error: ${err.message}`,
            executionTime: Date.now() - startTime,
            consoleOutput: ''
          });
        });

      } catch (err) {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeoutHandler);
        cleanup();
        
        resolve({ 
          status: 'error', 
          error: err instanceof Error ? err.message : 'Unknown error',
          executionTime: Date.now() - startTime,
          consoleOutput: ''
        });
      }
    });
  }
};


function parseExecutionOutput(stdout: string): { programOutput: string; consoleOutput: string } {
  if (!stdout) return { programOutput: '', consoleOutput: '' };
  
  const consoleOutput = extractConsoleOutput(stdout);
  
  return {
    programOutput: stdout.trim(),
    consoleOutput
  };
}


function extractConsoleOutput(stdout: string): string {
  if (!stdout) return '';
  
  const lines = stdout.split('\n');
  const consoleLogs: string[] = [];
  let currentConsoleBlock: string[] = [];
  let inConsoleBlock = false;
  
  for (const line of lines) {
    if (line.startsWith('CONSOLE:')) {
      
      if (inConsoleBlock && currentConsoleBlock.length > 0) {
   
        consoleLogs.push(currentConsoleBlock.join('\n'));
      }

      inConsoleBlock = true;
      const consoleContent = line.replace('CONSOLE:', '').trim();
      currentConsoleBlock = consoleContent ? [consoleContent] : [];
    } else if (line.startsWith('RESULT:') || line.startsWith('ERROR:') || line === 'TEST_PASSED') {
     
      if (inConsoleBlock && currentConsoleBlock.length > 0) {
        consoleLogs.push(currentConsoleBlock.join('\n'));
        currentConsoleBlock = [];
      }
      inConsoleBlock = false;
    } else if (inConsoleBlock) {
   
      currentConsoleBlock.push(line);
    }
  }
  
 
  if (inConsoleBlock && currentConsoleBlock.length > 0) {
    consoleLogs.push(currentConsoleBlock.join('\n'));
  }
  

  const uniqueLogs = [...new Set(consoleLogs.filter(log => log.trim().length > 0))];
  return uniqueLogs.join('\n\n'); 
}

function getFileName(language: string): string {
  switch (language) {
    case 'javascript': return 'test.js';
    case 'python': return 'test.py';
    case 'java': return 'Solution.java';
    case 'cpp': return 'solution.cpp';
    case 'c': return 'solution.c';
    default: throw new Error('Unsupported language');
  }
}

function getDockerCommand(language: string, filePath: string, timeLimit: number, memoryLimit: number): string {
  const dir = path.dirname(filePath);
  const fileName = path.basename(filePath);
  const timeoutSeconds = Math.max(1, Math.ceil(timeLimit / 1000));
  
  switch (language) {
    case 'javascript':
      return `docker run --rm --memory=${memoryLimit}m --cpus=0.5 --network=none --pids-limit=100 -v "${dir}:/code" node:alpine timeout ${timeoutSeconds} node /code/${fileName}`;
    case 'python':
      return `docker run --rm --memory=${memoryLimit}m --cpus=0.5 --network=none --pids-limit=100 -v "${dir}:/code" python:3.9-alpine timeout ${timeoutSeconds} python /code/${fileName}`;
    case 'java':
      return `docker run --rm --memory=${memoryLimit}m --cpus=0.5 --network=none --pids-limit=100 -v "${dir}:/code" openjdk:17-alpine sh -c "timeout ${timeoutSeconds} sh -c 'javac /code/${fileName} && java -cp /code Solution'"`;
    case 'cpp':
      return `docker run --rm --memory=${memoryLimit}m --cpus=0.5 --network=none --pids-limit=100 -v "${dir}:/code" gcc:alpine sh -c "timeout ${timeoutSeconds} sh -c 'g++ /code/${fileName} -o /code/a.out && /code/a.out'"`;
    case 'c':
      return `docker run --rm --memory=${memoryLimit}m --cpus=0.5 --network=none --pids-limit=100 -v "${dir}:/code" gcc:alpine sh -c "timeout ${timeoutSeconds} sh -c 'gcc /code/${fileName} -o /code/a.out && /code/a.out'"`;
    default:
      throw new Error('Unsupported language');
  }
}