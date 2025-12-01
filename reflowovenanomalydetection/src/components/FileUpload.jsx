import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';

function FileUpload({ onComplete }) {
  const { loadData, isLoading, error } = useStore();
  const [dragActive, setDragActive] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFile = async (file) => {
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setUploadResult({ success: false, error: 'Please upload a CSV file' });
      return;
    }

    setUploadResult(null);
    const result = await loadData(file);
    setUploadResult(result);

    if (result.success) {
      setTimeout(() => {
        onComplete?.();
      }, 1500);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer?.files?.[0];
    processFile(file);
  }, []);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-primary-500 bg-primary-500/10'
            : 'border-dark-600 hover:border-dark-500'
        } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        <div className="space-y-4">
          {isLoading ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center"
            >
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
              <p className="text-dark-200">Processing data...</p>
              <p className="text-sm text-dark-400">This may take a moment for large files</p>
            </motion.div>
          ) : uploadResult?.success ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <CheckCircle className="w-12 h-12 text-success-500 mb-4" />
              <p className="text-success-400 font-medium">Data loaded successfully!</p>
              <p className="text-sm text-dark-400">
                {uploadResult.recordCount?.toLocaleString()} records processed
              </p>
            </motion.div>
          ) : uploadResult?.error || error ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <AlertCircle className="w-12 h-12 text-danger-500 mb-4" />
              <p className="text-danger-400 font-medium">Upload failed</p>
              <p className="text-sm text-dark-400">{uploadResult?.error || error}</p>
            </motion.div>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-dark-800 flex items-center justify-center">
                <Upload className="w-8 h-8 text-dark-400" />
              </div>
              <div>
                <p className="text-dark-200 font-medium">
                  Drag and drop your CSV file here
                </p>
                <p className="text-sm text-dark-400 mt-1">
                  or click to browse
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-dark-800/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-dark-200 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Expected File Format
        </h4>
        <ul className="text-xs text-dark-400 space-y-1">
          <li>CSV file with reflow oven sensor data</li>
          <li>Required columns: Logging time, Zone temperatures (1-10), Power metrics</li>
          <li>Optional: O2 concentration, Flow rate, Alarm count</li>
        </ul>
      </div>
    </div>
  );
}

export default FileUpload;
