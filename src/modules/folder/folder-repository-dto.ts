export interface RepoInputCreateFolder {
  name: string;
  userId: string;
}

export interface RepoInputCreatePair {
  text1: string;
  text2: string;
  language1: string;
  language2: string;
  ipa1?: string;
  ipa2?: string;
  folderId: number;
}

export interface RepoInputUpdatePair {
  text1?: string;
  text2?: string;
  language1?: string;
  language2?: string;
  ipa1?: string;
  ipa2?: string;
}
