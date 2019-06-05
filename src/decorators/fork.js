import _ from 'lodash';
import { fork } from 'child_process';

export default function fork(...config) {
    let pathStr;
    if(_.isString(config[0]) && config[0].length) {
        pathStr = config[0];
    } else {
        throw new Error('[fork decorator] Path should be a not empty string');
    }

    return (target, name, description) => {
        const openedProcesses = [];

        const closeOpenedProcesses = () => {
            _.forEach(openedProcesses, (proc) => {
                proc.kill('SIGINT');
            });
        }

        const runProcess = (path, args) => {
            const childProcess = fork(path, args);
            openedProcesses.push(childProcess);
            return childProcess;
        }

        return {
            value: {
                create: {
                    module: (path) => (args) => runProcess(path, args),
                    args: [
                        pathStr
                    ]
                },
                destroy: () => closeOpenedProcesses(),
                error: () => closeOpenedProcesses()
            }
        }
    }
}
