export function inspect(word: string) {
    const goto = (url: string) => {
        window.open(url, '_blank');
    }
    return () => {
        word = word.toLowerCase();
        goto(`https://www.youdao.com/result?word=${word}&lang=en`);
    }
}

export function urlGoto(url: string) {
    window.open(url, '_blank');
}
