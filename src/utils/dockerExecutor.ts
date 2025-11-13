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
      
    
      const containerTempDir = path.join('/temp', id);
      
    
      const hostBasePath = process.env.HOST_TEMP_PATH || '/temp';
      const hostTempDir = path.join(hostBasePath, id);
      
      let resolved = false;
      const startTime = Date.now();
      
      console.log(`[DEBUG] Container temp dir: ${containerTempDir}`);
      console.log(`[DEBUG] Host temp dir for Docker: ${hostTempDir}`);
      
      const cleanup = () => {
        try {
          if (fs.existsSync(containerTempDir)) {
            fs.rmSync(containerTempDir, { recursive: true, force: true });
            console.log(`[DEBUG] Cleaned up: ${containerTempDir}`);
          }
        } catch (cleanupError) {
          console.error('[ERROR] Cleanup error:', cleanupError);
        }
      };

      const timeoutHandler = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          console.log('[DEBUG] Timeout handler triggered');
          resolve({
            status: 'timeout',
            error: 'Time limit exceeded - your code took too long to execute',
            executionTime: Date.now() - startTime,
            consoleOutput: ''
          });
        }
      }, timeLimit + 2000);

      try {
     
        fs.mkdirSync(containerTempDir, { recursive: true });
        
        const fileName = getFileName(language);
        const filePath = path.join(containerTempDir, fileName);
        
      
        fs.writeFileSync(filePath, code);
        console.log(`[DEBUG] File written to: ${filePath}`);
        console.log(`[DEBUG] File exists: ${fs.existsSync(filePath)}`);
        console.log(`[DEBUG] File size: ${fs.statSync(filePath).size} bytes`);

        
        const dockerCmd = getDockerCommand(language, hostTempDir, fileName, timeLimit, memoryLimit);
        console.log(`[DEBUG] Executing docker command: ${dockerCmd}`);

        const childProcess = exec(dockerCmd, { 
          timeout: timeLimit + 2000,
          killSignal: 'SIGKILL',
          maxBuffer: 1024 * 1024 * 10
        }, (error, stdout, stderr) => {
          if (resolved) return; 
          
          resolved = true;
          clearTimeout(timeoutHandler);
          const executionTime = Date.now() - startTime;
          
          console.log(`[DEBUG] Execution completed in ${executionTime}ms`);
          console.log(`[DEBUG] stdout length: ${stdout?.length || 0}`);
          console.log(`[DEBUG] stderr length: ${stderr?.length || 0}`);
          
          cleanup();

          if (error) {
            if (error.killed || error.signal === 'SIGTERM' || error.signal === 'SIGKILL') {
              console.log('[DEBUG] Process was killed (timeout)');
              return resolve({ 
                status: 'timeout', 
                error: 'Time limit exceeded - your code took too long to execute',
                executionTime,
                consoleOutput: extractConsoleOutput(stdout)
              });
            }
            
            if (stderr && (stderr.includes('Killed') || stderr.includes('memory') || stderr.includes('OOM'))) {
              console.log('[DEBUG] Memory limit exceeded');
              return resolve({ 
                status: 'error', 
                error: 'Memory limit exceeded',
                executionTime,
                consoleOutput: extractConsoleOutput(stdout)
              });
            }
            
            console.log('[DEBUG] Execution error:', error.message);
            console.log('[DEBUG] Full stderr:', stderr);
            return resolve({ 
              status: 'error', 
              error: stderr || error.message || 'Execution failed',
              executionTime,
              consoleOutput: extractConsoleOutput(stdout)
            });
          }

          if (stderr) {
            const filteredStderr = stderr
              .split('\n')
              .filter(line => 
                !line.includes('Pulling from library') && 
                !line.includes('Status: Downloaded') &&
                !line.includes('Status: Image is up to date') &&
                !line.includes('Digest:') &&
                !line.includes('already exists') &&
                line.trim().length > 0
              )
              .join('\n');
            
            if (filteredStderr) {
              console.log('[DEBUG] Filtered stderr:', filteredStderr);
              return resolve({ 
                status: 'error', 
                error: filteredStderr,
                executionTime,
                consoleOutput: extractConsoleOutput(stdout)
              });
            }
          }

          const result = parseExecutionOutput(stdout);
          console.log('[DEBUG] Success! Output length:', result.programOutput.length);
          
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
          
          console.log('[ERROR] Process error:', err.message);
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
        
        console.log('[ERROR] Setup error:', err);
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

function getDockerCommand(language: string, hostMountPath: string, fileName: string, timeLimit: number, memoryLimit: number): string {
 
  const timeoutSeconds = Math.ceil(timeLimit / 1000);
  
  const baseOptions = `--rm --memory=${memoryLimit}m --cpus=0.5 --network=none --pids-limit=100`;
  
  switch (language) {
    case 'javascript':
      return `docker run ${baseOptions} -v "${hostMountPath}:/code" node:20-alpine timeout ${timeoutSeconds}s node /code/${fileName}`;
    
    case 'python':
      return `docker run ${baseOptions} -v "${hostMountPath}:/code" python:3.11-alpine timeout ${timeoutSeconds}s python /code/${fileName}`;
    
    case 'java':
      return `docker run ${baseOptions} -v "${hostMountPath}:/code" openjdk:17-alpine sh -c "cd /code && javac ${fileName} && timeout ${timeoutSeconds}s java Solution"`;
    
    case 'cpp':
      return `docker run ${baseOptions} -v "${hostMountPath}:/code" gcc:alpine sh -c "g++ /code/${fileName} -o /code/a.out && timeout ${timeoutSeconds}s /code/a.out"`;
    
    case 'c':
      return `docker run ${baseOptions} -v "${hostMountPath}:/code" gcc:alpine sh -c "gcc /code/${fileName} -o /code/a.out && timeout ${timeoutSeconds}s /code/a.out"`;
    
    default:
      throw new Error('Unsupported language');
  }
}