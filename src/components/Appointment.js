import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase'; // Ensure you have configured Firestore and Firebase Storage
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { format } from 'date-fns'; 

const PAGE_SIZE = 5; // Number of patients per page

function Appointment() {
  const [patients, setPatients] = useState([]);
  const [displayedPatients, setDisplayedPatients] = useState([]);
  const [newPatientName, setNewPatientName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  // States for audio upload
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    fetchPatients();
  }, [searchTerm]);

  const fetchPatients = async () => {
    let q = query(collection(db, "patients"));
    if (searchTerm) {
      q = query(collection(db, "patients"), where("name", "==", searchTerm));
    }
    const querySnapshot = await getDocs(q);
    const patientsData = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      date: doc.data().date ? format(doc.data().date.toDate(), 'PPP') : 'No date'
    }));

    setPatients(patientsData);
    setDisplayedPatients(patientsData.slice(0, PAGE_SIZE));
  };

  const handleTranscribe = async () => {
  if (audioUrl) {
    try {
      const response = await fetch('http://127.0.0.1:5000/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioUrl: audioUrl }),
      });
      const data = await response.json();
      console.log(data); // Transcribed text
    } catch (error) {
      console.error('Error during transcription:', error);
    }
  }
};
  const handleUploadPatient = async () => {
    if (newPatientName.trim() === '') return;

    try {
      const docRef = await addDoc(collection(db, "patients"), {
        name: newPatientName,
        date: new Date() // Firestore Timestamp
      });
      setNewPatientName('');
      fetchPatients(); // Refresh the list
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0); // Reset to the first page on search
  };

  const goToNextPage = () => {
    setCurrentPage((prevCurrentPage) => {
      const nextPage = prevCurrentPage + 1;
      setDisplayedPatients(patients.slice(nextPage * PAGE_SIZE, (nextPage + 1) * PAGE_SIZE));
      return nextPage;
    });
  };

  const goToPreviousPage = () => {
    setCurrentPage((prevCurrentPage) => {
      const prevPage = prevCurrentPage - 1;
      setDisplayedPatients(patients.slice(prevPage * PAGE_SIZE, prevPage * PAGE_SIZE + PAGE_SIZE));
      return prevPage;
    });
  };
 // Functions for handling audio file changes and uploads
  const handleFileChange = e => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = () => {
    if (!file) {
      setUploadError("Please select a file first");
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
        setUploadError("Upload failed: " + error.message);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setAudioUrl(downloadURL);
        });
      }
    );
  };
//Audio project
 return (
  <div>
    <h1>Select an appointment to get started:</h1>
    
    {/* Patient Name Input and Upload */}
    <input
      type="text"
      value={newPatientName}
      onChange={(e) => setNewPatientName(e.target.value)}
      placeholder="Enter patient name"
    />
    <button onClick={handleUploadPatient}>Upload Patient</button>

    {/* Search Form */}
    <form onSubmit={handleSearch}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search patients..."
      />
      <button type="submit">Search</button>
    </form>

    {/* Patients Table */}
    <h2>Patients List</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Patient Name</th>
          <th>Summary</th>
          <th>Play Audio</th>
          <th>Transcript</th>
          <th>Clinic Note</th>
        </tr>
      </thead>
      <tbody>
        {displayedPatients.map((patient) => (
          <tr key={patient.id}>
            <td>{patient.date}</td>
            <td>{patient.name}</td>
            <td><button>View Summary</button></td>
            <td><button>Play Audio</button></td>
            <td><button>View Transcript</button></td>
            <td><button>View Clinical Note</button></td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Pagination Controls */}
    <button onClick={goToPreviousPage} disabled={currentPage === 0}>Previous</button>
    <button onClick={goToNextPage} disabled={(currentPage + 1) * PAGE_SIZE >= patients.length}>Next</button>

    {/* Audio Upload Section */}
    <h2>Upload Patient Audio</h2>
    <input type="file" onChange={handleFileChange} />
    <button onClick={handleFileUpload}>Upload Audio</button>
    {progress > 0 && <progress value={progress} max="100" />}
    {audioUrl && <a href={audioUrl} target="_blank" rel="noopener noreferrer">Download Link</a>}
    {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
    
    <hr/>
      <button onClick={handleTranscribe}>Transcribe Audio</button>
   
  
  </div>
);

}


export default Appointment;
