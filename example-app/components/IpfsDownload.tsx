import Link from 'next/link';
import React  from 'react';
import { useIPFS } from '../hooks/useIPFS';

interface Props {
  hash: string,
  filename: string,
}

export const IPFSDownload = ({ hash, filename }: Props) => {
  const file = useIPFS(hash, filename);

  const downloadFile = () => {
    fetch(file)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      });
  }
  return (
    <div>
      {file ? (
        <div className="download-component">
          <button className="download-button"  onClick={downloadFile}>Download</button>
        </div>
      ) : (
        <p>Downloading file...</p>
      )}
    </div>
  );
};
