export type ServiceOutputLookUp = {
  standardForm: string;
  entries: Array<{
    ipa?: string;
    definition: string;
    partOfSpeech?: string;
    example: string;
  }>;
  alreadyExists?: boolean;
};
