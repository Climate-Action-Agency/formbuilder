export const getUrl = () : URL => {
    return new URL(window.location.href)
}
export const getExampleFromUrl = () : string|null => {
    return getUrl().searchParams.get('example');
}
export const getKeyFromUrl = (key:string) : string|null => {
    return getUrl().searchParams.get(key);
}
