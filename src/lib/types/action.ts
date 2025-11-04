export type ActionInput = {
    ids: string[];
    amounts?: Number[];
};

export type ChanceItem = {
    id: string;
    min: Number;
    max: Number;
    chance?: Number; // Denominator of a fraction, e.g. 1/1000 to be rolled
};

export type ActionOutput = {
    ids: string[];

};

export type Action = {
    name: string;
    inputs: ActionInput;
    outputs: ActionOutput;
    time: Number;
};