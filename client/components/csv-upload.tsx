import { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CSVUploadProps {
  onFileUpload: (csvData: string[][], fileName: string) => void;
}

export function CSVUpload({ onFileUpload }: CSVUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const parseCSV = (csvText: string): string[][] => {
    const lines = csvText.split("\n");
    return lines
      .filter((line) => line.trim() !== "")
      .map((line) => {
        // Simple CSV parser - handles basic cases
        const result: string[] = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];

          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }

        result.push(current.trim());
        return result;
      });
  };

  const handleFile = useCallback(
    (file: File) => {
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const csvText = e.target?.result as string;
          const csvData = parseCSV(csvText);
          setUploadedFile(file.name);
          onFileUpload(csvData, file.name);
        };
        reader.readAsText(file);
      } else {
        alert("Please upload a CSV file");
      }
    },
    [onFileUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile],
  );

  const clearFile = () => {
    setUploadedFile(null);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {!uploadedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload CSV File
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop your CSV file here, or click to browse
            </p>
            <div className="flex justify-center">
              <Button variant="outline" className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                Choose File
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                {uploadedFile}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFile}
              className="text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
