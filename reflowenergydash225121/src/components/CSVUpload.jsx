import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

function CSVUpload({ onFileUpload, isLoading }) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    setError(null);

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target.result;
      onFileUpload(csvText);
    };
    reader.onerror = () => {
      setError('Error reading file');
      setFileName(null);
    };
    reader.readAsText(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Reflow Energy Dashboard</h1>
          <p className="text-gray-400">Upload your reflow oven data to analyze energy consumption and identify waste</p>
        </div>

        {/* Upload Area */}
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
            ${isDragging
              ? 'border-primary bg-primary/10'
              : 'border-gray-600 hover:border-gray-500 bg-background-card'
            }
            ${isLoading ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-white font-medium">Processing {fileName}...</p>
              <p className="text-gray-400 text-sm mt-1">Analyzing energy data</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-white font-medium mb-1">
                {fileName ? fileName : 'Drop your CSV file here'}
              </p>
              <p className="text-gray-400 text-sm">
                or click to browse
              </p>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Expected Format */}
        <div className="mt-8 p-4 bg-background-card rounded-xl border border-gray-700">
          <h3 className="text-white font-medium mb-2">Expected CSV Format</h3>
          <p className="text-gray-400 text-sm mb-3">
            Your CSV should contain reflow oven telemetry data with these columns:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-500">Logging time</div>
            <div className="text-gray-500">Equipment status</div>
            <div className="text-gray-500">Active power (kW)</div>
            <div className="text-gray-500">Power factor (PF)</div>
            <div className="text-gray-500">ZONE1-10 Temperatures</div>
            <div className="text-gray-500">Number of boards</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default CSVUpload;
