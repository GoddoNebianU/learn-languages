"use server";

import { createTextPair } from "./controllers/TextPairController";

async function createTextPairAction(formData: FormData) {
  'use server';
  const textPair = {
    text1: formData.get('text1') as string,
    text2: formData.get('text2') as string,
    locale1: formData.get('locale1') as string,
    locale2: formData.get('locale2') as string,
    folderId: parseInt(formData.get('folderId') as string)
  }
  if(textPair.text1 && textPair.text2 && textPair.locale1 && textPair.locale2 && textPair.folderId){
    await createTextPair(
      textPair.locale1,
      textPair.locale2,
      textPair.text1,
      textPair.text2,
      textPair.folderId
    );
  }
}