[1, 2, 3].forEach((num) => {
    // 콘솔 한번 찍히려면 매번 3초씩 걸린다.
    // 이 함수의 콜백 함수는 동기적으로 호출된다.
    imCallbackFn(() => console.log(num), 3000);
});
function imCallbackFn(callback) {
    let start = Date.now();
    let now = start;
    while (now - start < 3000) {
        now = Date.now();
    }
    callback();
}
