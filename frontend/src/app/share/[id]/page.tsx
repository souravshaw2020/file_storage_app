// src/app/share/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FileAPI } from "@/lib/api/files";
import { DownloadCloud, AlertCircle, FileText } from "lucide-react";
import axios from "axios"; // <-- Added Axios import
import styles from "./share.module.css";

interface SharedFileData {
  downloadUrl: string;
  originalName: string;
  sizeBytes: number;
}

export default function SharePage() {
  const params = useParams();
  const fileId = params.id as string;

  const [fileData, setFileData] = useState<SharedFileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSharedFile = async () => {
      try {
        const response = await FileAPI.getSharedFile(fileId);
        setFileData(response.data);
      } catch (err) {
        // Use the proper Axios type guard
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 403) {
            setError("This file is private and cannot be accessed.");
          } else if (err.response?.status === 404) {
            setError("File not found or has been deleted.");
          } else {
            setError("An error occurred while loading the file.");
          }
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (fileId) {
      fetchSharedFile();
    }
  }, [fileId]);

  const handleDownload = () => {
    if (!fileData) return;
    const link = document.createElement("a");
    link.href = fileData.downloadUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p className={styles.subtitle}>Loading file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <AlertCircle size={56} color="#fb6f92" strokeWidth={1.5} />
          </div>
          <div className={styles.errorText}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <FileText size={56} color="#ff8fab" strokeWidth={1.5} />
        </div>

        <h1 className={styles.title}>{fileData?.originalName}</h1>
        <p className={styles.subtitle}>
          {fileData ? (fileData.sizeBytes / 1024 / 1024).toFixed(2) : 0} MB
        </p>

        <button className={styles.downloadBtn} onClick={handleDownload}>
          <DownloadCloud size={20} />
          Download File
        </button>
      </div>
    </div>
  );
}
