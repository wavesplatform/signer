export const waitTime = (time: number) =>
    new Promise(resolve => setTimeout(resolve, time));
