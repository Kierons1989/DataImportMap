import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CSVUpload } from "@/components/csv-upload";
import { TableCaptions } from "@/components/table-captions";
import { AIChat } from "@/components/ai-chat";
import { MappingDisplay } from "@/components/mapping-display";
import {
  mockCSVData,
  suggestedCaptions,
  getSuggestedCaptionsForData,
} from "@/lib/mock-data";
import { FileSpreadsheet, MessageSquare, Settings, Eye } from "lucide-react";

export default function CSVMappingPrototype() {
  const [csvData, setCSVData] = useState<string[][]>([]);
  const [fileName, setFileName] = useState("");
  const [captions, setCaptions] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("upload");

  const csvColumns = csvData.length > 0 ? csvData[0] : [];

  const handleFileUpload = (data: string[][], name: string) => {
    setCSVData(data);
    setFileName(name);
    setMappings({}); // Reset mappings when new file is uploaded

    // Auto-suggest captions based on CSV column names
    const suggested = getSuggestedCaptionsForData(data[0]);
    if (captions.length === 0) {
      setCaptions(suggested.slice(0, Math.min(data[0].length, 6)));
    }

    // Auto-advance to captions tab
    setActiveTab("captions");
  };

  const handleCaptionsChange = (newCaptions: string[]) => {
    setCaptions(newCaptions);
  };

  const handleMappingUpdate = (csvColumn: string, caption: string) => {
    setMappings((prev) => ({
      ...prev,
      [csvColumn]: caption,
    }));
  };

  const handleMappingRemove = (csvColumn: string) => {
    setMappings((prev) => {
      const newMappings = { ...prev };
      delete newMappings[csvColumn];
      return newMappings;
    });
  };

  const loadSampleData = (datasetKey: keyof typeof mockCSVData) => {
    const dataset = mockCSVData[datasetKey];
    handleFileUpload(dataset.data, dataset.filename);
  };

  const getTabProgress = () => {
    const hasCSV = csvData.length > 0;
    const hasCaptions = captions.length > 0;
    const hasMappings = Object.keys(mappings).length > 0;

    return {
      upload: hasCSV,
      captions: hasCaptions,
      mapping: hasMappings,
      complete:
        hasCSV &&
        hasCaptions &&
        Object.keys(mappings).length === csvColumns.length,
    };
  };

  const progress = getTabProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            CSV Column Mapping Prototype
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload a CSV file, define table captions, and let our AI assistant
            help you map columns to create your perfect data table.
          </p>
        </div>

        {/* Quick Demo Section */}
        {csvData.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Try with Sample Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(mockCSVData).map(([key, dataset]) => (
                <Button
                  key={key}
                  variant="outline"
                  onClick={() =>
                    loadSampleData(key as keyof typeof mockCSVData)
                  }
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                >
                  <FileSpreadsheet className="h-6 w-6" />
                  <span className="font-medium capitalize">{key}</span>
                  <span className="text-xs text-gray-500">
                    {dataset.filename}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span>Upload CSV</span>
              {progress.upload && (
                <div className="w-2 h-2 bg-green-500 rounded-full ml-1" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="captions"
              className="flex items-center space-x-2"
              disabled={!progress.upload}
            >
              <Settings className="h-4 w-4" />
              <span>Set Captions</span>
              {progress.captions && (
                <div className="w-2 h-2 bg-green-500 rounded-full ml-1" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="mapping"
              className="flex items-center space-x-2"
              disabled={!progress.captions}
            >
              <MessageSquare className="h-4 w-4" />
              <span>AI Mapping</span>
              {progress.mapping && (
                <div className="w-2 h-2 bg-green-500 rounded-full ml-1" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="flex items-center space-x-2"
              disabled={!progress.mapping}
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
              {progress.complete && (
                <div className="w-2 h-2 bg-green-500 rounded-full ml-1" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="upload" className="space-y-6">
            <CSVUpload onFileUpload={handleFileUpload} />

            {csvData.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">CSV Preview</h3>
                <div className="text-sm text-gray-600 mb-4">
                  File: <span className="font-medium">{fileName}</span> •
                  Columns:{" "}
                  <span className="font-medium">{csvColumns.length}</span> •
                  Rows:{" "}
                  <span className="font-medium">{csvData.length - 1}</span>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {csvColumns.map((column, index) => (
                            <th
                              key={index}
                              className="px-3 py-2 text-left font-medium text-gray-700 border-r last:border-r-0"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.slice(1, 4).map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-t">
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="px-3 py-2 border-r last:border-r-0"
                              >
                                {cell || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvData.length > 4 && (
                    <div className="px-3 py-2 bg-gray-50 text-xs text-gray-600 border-t">
                      Showing 3 of {csvData.length - 1} rows
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setActiveTab("captions")}>
                    Next: Set Captions →
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="captions" className="space-y-6">
            <TableCaptions
              captions={captions}
              onCaptionsChange={handleCaptionsChange}
            />
            {captions.length > 0 && (
              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("mapping")}>
                  Next: AI Mapping →
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="mapping"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div className="space-y-6">
              <AIChat
                csvColumns={csvColumns}
                captions={captions}
                currentMappings={mappings}
                onMappingUpdate={handleMappingUpdate}
                onMappingRemove={handleMappingRemove}
              />
            </div>
            <div className="space-y-6">
              <MappingDisplay
                csvColumns={csvColumns}
                captions={captions}
                mappings={mappings}
                csvData={csvData}
                onMappingUpdate={handleMappingUpdate}
                onMappingRemove={handleMappingRemove}
              />
              {Object.keys(mappings).length > 0 && (
                <div className="flex justify-end">
                  <Button onClick={() => setActiveTab("preview")}>
                    View Preview →
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <MappingDisplay
              csvColumns={csvColumns}
              captions={captions}
              mappings={mappings}
              csvData={csvData}
              onMappingUpdate={handleMappingUpdate}
              onMappingRemove={handleMappingRemove}
            />

            {progress.complete && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="text-green-800 text-lg font-semibold mb-2">
                  🎉 Mapping Complete!
                </div>
                <p className="text-green-700">
                  All {csvColumns.length} columns have been successfully mapped
                  to your captions. Your data is ready for use!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
