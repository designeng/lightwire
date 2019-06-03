import when from 'when';

const Promise = when.promise;

export default function waitALittle() {
    return Promise(resolve => {
        setTimeout(resolve, 1);
    })
}
