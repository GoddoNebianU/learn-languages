"use client";

import { useEffect, useState } from "react";
import IPAForm from "./IPAForm";



export default function Home() {


  const [voicesData, setVoicesData] = useState<{
    locale: string,
    short_name: string
  }[] | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/list_of_voices.json')
      .then(res => res.json())
      .then(setVoicesData)
      .catch(() => setVoicesData(null))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div>加载中...</div>;
  if (!voicesData) return <div>加载失败</div>;
  return (
    <div className="flex w-screen justify-center">
      <div className="mt-8 bg-gray-100 shadow-xl rounded-xl p-4 flex items-center flex-col">
        <h1 className="text-5xl mb-4">IPA Reader</h1>
        <IPAForm voicesData={voicesData}></IPAForm>
      </div>
    </div>
  );
}
