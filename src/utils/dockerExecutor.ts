import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface ExecutionResult {
  status: 'success' | 'error';
  output?: string;
  message?: string;
}

export const dockerExecutor = {
  runCode: (code: string, language: string, timeLimit: number, memoryLimit: number): Promise<ExecutionResult> => {
    return new Promise((resolve) => {
      const id = uuidv4();
      const tempDir = path.join(__dirname, '..', 'temp', id);
      fs.mkdirSync(tempDir, { recursive: true });

      const fileName = getFileName(language);
      const filePath = path.join(tempDir, fileName);
      fs.writeFileSync(filePath, code);

      const dockerCmd = getDockerCommand(language, filePath, timeLimit, memoryLimit);

      exec(dockerCmd, { timeout: timeLimit + 1000 }, (error, stdout, stderr) => {
        fs.rmSync(tempDir, { recursive: true, force: true });

        if (error) {
          if (error.killed) {
            return resolve({ status: 'error', message: 'Time limit exceeded' });
          }
          return resolve({ status: 'error', message: stderr || error.message });
        }
        return resolve({ status: 'success', output: stdout.trim() });
      });
    });
  }
};

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
  switch (language) {
    case 'javascript':
      return `docker run --rm --memory=${memoryLimit}m --cpus=0.5 --network none -v ${dir}:/code node:alpine node /code/${getFileName(language)}`;
    case 'python':
      return `docker run --rm --memory=${memoryLimit}m --cpus=0.5 --network none -v ${dir}:/code python:3.9-alpine python /code/${getFileName(language)}`;
    case 'java':
      return `docker run --rm --memory=${memoryLimit}m --cpus=0.5 --network none -v ${dir}:/code openjdk:17-alpine sh -c "javac /code/${getFileName(language)} && java -cp /code Solution"`;
    case 'cpp':
      return `docker run --rm --memory=${memoryLimit}m --cpus=0.5 --network none -v ${dir}:/code gcc:alpine sh -c "g++ /code/${getFileName(language)} -o /code/a.out && /code/a.out"`;
    case 'c':
      return `docker run --rm --memory=${memoryLimit}m --cpus=0.5 --network none -v ${dir}:/code gcc:alpine sh -c "gcc /code/${getFileName(language)} -o /code/a.out && /code/a.out"`;
    default:
      throw new Error('Unsupported language');
  }
}
