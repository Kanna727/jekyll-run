export function getNumbersInString(str: string): number[]{
    return str.
        trim().
        split(' ').
        filter((value) => {
            return value !== '';
        }).
        filter((value) => {
            return /^\d+$/.test(value.trim());
        }).
        map(Number);
}