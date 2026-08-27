"use client";

import { useEffect, useState, useRef } from "react";
import { FileAPI } from "@/lib/api/files";
import { AuthAPI } from "@/lib/api/auth";
import axios from "axios";
import toast from "react-hot-toast";
import { FileText } from "lucide-react";
import styles from "./dashboard.module.css";

interface FileRecord {
  id: string;
  originalName: string;
  sizeBytes: number;
  isPublic: boolean;
}

export default function DashboardPage() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Create a "refresh key" to trigger our effect safely
  const [refreshKey, setRefreshKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. Put the fetch logic strictly inside the effect
  useEffect(() => {
    let isMounted = true; // Prevents state updates if component unmounts

    const loadFiles = async () => {
      try {
        const response = await FileAPI.getDashboardFiles();
        if (isMounted) {
          setFiles(response.data);
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Could not load your files.");
        }
      }
    };

    loadFiles();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, [refreshKey]); // The effect re-runs safely whenever refreshKey changes

  // 3. Simple helper to trigger a re-fetch
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 104857600) {
      toast.error("File size must not exceed 100MB.");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Preparing upload...");

    try {
      const urlResponse = await FileAPI.getUploadUrl({
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      });

      const { uploadUrl, storageKey } = urlResponse.data;

      toast.loading("Uploading to the cloud...", { id: toastId });
      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
      });

      toast.loading("Finalizing upload...", { id: toastId });
      await FileAPI.confirmUpload({
        storageKey,
        originalName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      });

      toast.success("File uploaded successfully.", { id: toastId });

      // 4. Update the refresh key instead of calling fetchFiles directly
      triggerRefresh();
    } catch (error) {
      toast.error("Something went wrong with the upload.", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      const response = await FileAPI.getDownloadUrl(fileId);
      const link = document.createElement("a");
      link.href = response.data.downloadUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error("Could not generate download link.");
    }
  };

  const toggleAccess = async (fileId: string, currentStatus: boolean) => {
    try {
      await FileAPI.toggleAccess(fileId, !currentStatus);
      toast.success(
        currentStatus ? "File is now private." : "File is now public.",
      );

      // 5. Update the refresh key here as well
      triggerRefresh();
    } catch (error) {
      toast.error("Failed to change access status.");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Files</h1>
        <button className={styles.logoutBtn} onClick={AuthAPI.logout}>
          Log Out
        </button>
      </header>

      <section className={styles.uploadCard}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
        <div
          className={styles.dropZone}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <h2>
            {isUploading
              ? "Uploading your file..."
              : "Click here to upload a file"}
          </h2>
          <p>Files up to 100MB are supported</p>
        </div>
      </section>

      <section className={styles.fileList}>
        {files.map((file) => (
          <div key={file.id} className={styles.fileCard}>
            <div className={styles.fileIcon}>
              <FileText size={48} color="#ff8fab" strokeWidth={1.5} />
            </div>
            <div className={styles.fileName}>{file.originalName}</div>
            <div
              style={{ textAlign: "center", fontSize: "0.9rem", color: "#888" }}
            >
              {(file.sizeBytes / 1024 / 1024).toFixed(2)} MB
            </div>

            <div className={styles.controls}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={file.isPublic}
                  onChange={() => toggleAccess(file.id, file.isPublic)}
                />
                Public
              </label>

              <button
                className={styles.downloadBtn}
                onClick={() => handleDownload(file.id)}
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
