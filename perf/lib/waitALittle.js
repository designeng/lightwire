export default function waitALittle() {
    return new Promise(resolve => {
        setImmediate(resolve);
    })
}
