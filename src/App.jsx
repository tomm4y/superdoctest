import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiCopy } from 'react-icons/fi';

function App() {
  const [docs, setDocs] = useState(() => {
    const savedDocs = localStorage.getItem('googleDocs');
    return savedDocs
      ? JSON.parse(savedDocs)
      : [
          {
            id: '1',
            name: 'Example Doc',
            url: 'https://docs.google.com/document/d/1dM-6dpvK46Xy-a3su1VSkUoLOdrg3nyK6mWsXUFUliw/preview?embedded=true',
          },
        ];
  });

  const [activeDocId, setActiveDocId] = useState(() => {
    return docs[0]?.id;
  });

  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [courseId, setCourseId] = useState('math-2305-123');
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem('googleDocs', JSON.stringify(docs));
  }, [docs]);

  const fetchSuperDocs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = `${import.meta.env.VITE_LAMBDA_ENDPOINT}/superdocs?courseId=${courseId}`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      
      if (jsonData.res && jsonData.res.data && jsonData.res.data.length > 0) {
        const newDocs = jsonData.res.data.map((item, index) => ({
          id: index.toString(),
          name: item.M.label.S,
          url: `${item.M.url.S.replace('/edit', '/preview')}?embedded=true`,
          googleDocId: item.M.url.S.match(/\/d\/(.*?)(\/|$)/)?.[1] || ''
        }));

        setDocs(newDocs);
        if (newDocs.length > 0) {
          setActiveDocId(newDocs[0].id);
        }
        setUploadStatus('Documents loaded');
      } else {
        setUploadStatus('No documents found for this course.');
      }
    } catch (error) {
      console.error('Error fetching super docs:', error);
      setError(error.message);
      setUploadStatus(`Error: ${error.message || 'Failed to fetch documents'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDoc = () => {
    if (newDocName && newDocUrl) {
      const docIdMatch = newDocUrl.match(/\/d\/(.*?)(\/|$)/);
      const docId = docIdMatch ? docIdMatch[1] : null;

      if (!docId) {
        alert('Please enter a valid Google Doc URL');
        return;
      }

      const formattedUrl = `https://docs.google.com/document/d/${docId}/preview?embedded=true`;

      const newDoc = {
        id: Date.now().toString(),
        name: newDocName,
        url: formattedUrl,
        googleDocId: docId
      };

      setDocs([...docs, newDoc]);
      setNewDocName('');
      setNewDocUrl('');
      setIsAddingDoc(false);
      setActiveDocId(newDoc.id);
    }
  };

  const handleDeleteDoc = (docId) => {
    const newDocs = docs.filter((doc) => doc.id !== docId);
    setDocs(newDocs);
    if (activeDocId === docId) {
      setActiveDocId(newDocs[0]?.id);
    }
  };

  const handleMakeCopy = () => {
    const activeDoc = docs.find((doc) => doc.id === activeDocId);
    if (activeDoc) {
      const docIdMatch = activeDoc.url.match(/\/d\/(.*?)\/preview/);
      const docId = docIdMatch ? docIdMatch[1] : null;

      if (docId) {
        const copyUrl = `https://docs.google.com/document/d/${docId}/copy`;
        window.open(copyUrl, '_blank');
      }
    }
  };

  const activeDoc = docs.find((doc) => doc.id === activeDocId);

  return (
    <div className="flex h-screen">
      <div className="w-[300px] bg-gray-50 p-5 border-r border-gray-200 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Notes</h2>
        <div className="mb-5">
          <input
            type="text"
            className="w-full p-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            placeholder="Enter Course ID"
          />
          <button 
            className={`w-full p-2 rounded-md text-white transition-colors ${
              isLoading 
                ? 'bg-green-300 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
            onClick={fetchSuperDocs}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Fetch Documents'}
          </button>
        </div>

        {error && (
          <div className="text-red-500 mb-4">
            Error: {error}
          </div>
        )}
        
        <ul className="space-y-2">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className={`p-3 rounded-lg cursor-pointer flex justify-between items-center transition-colors ${
                doc.id === activeDocId
                  ? 'bg-blue-100 border-l-4 border-blue-500'
                  : 'bg-white hover:bg-gray-100'
              }`}
              onClick={() => setActiveDocId(doc.id)}
            >
              <span className="truncate">{doc.name}</span>
              {docs.length > 1 && (
                <button
                  className="text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDoc(doc.id);
                  }}
                >
                  <FiTrash2 />
                </button>
              )}
            </li>
          ))}
        </ul>

        {isAddingDoc ? (
          <div className="mt-4">
            <input
              type="text"
              className="w-full p-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Document Name"
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
            />
            <input
              type="text"
              className="w-full p-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Google Doc URL"
              value={newDocUrl}
              onChange={(e) => setNewDocUrl(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                className="flex-1 p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                onClick={handleAddDoc}
              >
                Save
              </button>
              <button
                className="flex-1 p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                onClick={() => setIsAddingDoc(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="mt-4 p-2 w-full bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            onClick={() => setIsAddingDoc(true)}
          >
            <FiPlus /> Add Document
          </button>
        )}
        
        {uploadStatus && (
          <div className="mt-2 p-2 bg-blue-50 text-blue-900 rounded-md text-sm text-center">
            {uploadStatus}
          </div>
        )}
      </div>

      <div className="flex-1 relative">
        {activeDoc && (
          <>
            <button
              className="absolute top-5 right-5 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 z-10"
              onClick={handleMakeCopy}
            >
              <FiCopy /> Make a copy
            </button>
            <iframe
              src={activeDoc.url}
              title={activeDoc.name}
              className="w-full h-full border-none doc-frame"
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;