import { useState } from 'react';


function App() {
  const [courseId, setCourseId] = useState('math-2305-123');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      //https://gkumnvexpe.execute-api.us-east-1.amazonaws.com/dev/get/superdocs
      const endpoint  = `${import.meta.env.VITE_LAMBDA_ENDPOINT}/superdocs?courseId=${courseId}`
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
      setData(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="border p-2 mr-2 rounded"
          placeholder="Enter Course ID"
        />
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
        >
          {isLoading ? 'Loading...' : 'Fetch Data'}
        </button>
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          Error: {error}
        </div>
      )}

      {data && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[80vh]">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;
