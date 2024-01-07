// AudioUploader.js
import React, { useState } from 'react';
import { storage } from '../firebase'; // Updated import
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

function AudioUploader() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleChange = e => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    const storageRef = ref(storage, `audio/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      snapshot => {
        const prog = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(prog);
      },
      error => {
        console.log(error);
        setError("Upload failed: " + error.message);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUrl(downloadURL);
        });
      }
    );
  };

  return (
    <div>
      <h1>Audio Transcription App</h1>
      <input type="file" onChange={handleChange} />
      <button onClick={handleUpload}>Upload</button>
      {progress > 0 && <progress value={progress} max="100" />}
      {url && <a href={url} target="_blank" rel="noopener noreferrer">Download Link</a>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default AudioUploader;
