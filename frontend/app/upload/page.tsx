"use client";

import React, { useState } from "react";

export default function upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [docId, setDocId] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMsg("Please select a PDF file first.");
      return;
    }
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      const json = await res.json();
      setDocId(json.doc_id ?? "");
    } catch (error) {
      setErrorMsg((error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md p-4">
      <h1 className="mb-4 text-2xl font-bold">Upload Financial Document</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="block w-full rounded border border-gray-300 p-2 mb-4"
      />

      <button
        onClick={handleUpload}
        disabled={isUploading || !selectedFile}
        className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isUploading ? "Uploading..." : "Upload PDF"}
      </button>

      {errorMsg && <p className="mt-4 text-red-500">Error: {errorMsg}</p>}

      {docId && (
        <p className="mt-4 text-green-600">
          Successfully uploaded! Document ID: <strong>{docId}</strong>
        </p>
      )}
    </div>
  );
}
