var pid = process.pid;
process.send({ pid });

process.on('SIGINT', () => {
    console.log('CLOSE FORKED PROCESS.....', process.pid);
});
