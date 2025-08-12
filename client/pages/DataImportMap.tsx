import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertTriangle,
  Upload,
  X,
  Settings,
  ChevronDown,
  Send,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface CSVColumn {
  name: string;
  index: number;
  sample: string[];
  type: string;
}

interface MappingRow {
  order: number;
  header: string;
  sample: string;
  caption: string;
  keyField: boolean;
  matchById: boolean;
  id: string;
  confidence?: number;
  suggested?: boolean;
}

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: MappingSuggestion[];
}

interface MappingSuggestion {
  columnIndex: number;
  caption: string;
  confidence: number;
  reasoning: string;
}

const availableCaptions = [
  "Reference",
  "Org Unit",
  "Forename(s)",
  "Surname",
  "Email",
  "Job Title",
  "Manager Name",
  "Phone",
  "Department",
  "Location",
  "Start Date",
  "Employee ID",
  "First Name",
  "Last Name",
  "Full Name",
  "Username",
  "Role",
  "Status",
];

export default function DataImportMap() {
  const [importType, setImportType] = useState("module");
  const [delimiter, setDelimiter] = useState("comma");
  const [operationType, setOperationType] = useState("insert-update");
  const [hasHeader, setHasHeader] = useState(true);
  const [title, setTitle] = useState("Workday Import");
  const [description, setDescription] = useState("Example HR import form");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");

  // File upload and CSV data
  const [csvData, setCSVData] = useState<string[][]>([]);
  const [csvColumns, setCSVColumns] = useState<CSVColumn[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mapping state - Initialize with predefined captions
  const [mappingRows, setMappingRows] = useState<MappingRow[]>([
    {
      id: "row-0",
      order: 0,
      header: "N/A",
      sample: "N/A",
      caption: "Reference",
      keyField: true,
      matchById: true,
    },
    {
      id: "row-1",
      order: 1,
      header: "N/A",
      sample: "N/A",
      caption: "Org Unit",
      keyField: false,
      matchById: false,
    },
    {
      id: "row-2",
      order: 2,
      header: "N/A",
      sample: "N/A",
      caption: "Forename(s)",
      keyField: false,
      matchById: false,
    },
    {
      id: "row-3",
      order: 3,
      header: "N/A",
      sample: "N/A",
      caption: "Surname",
      keyField: false,
      matchById: false,
    },
    {
      id: "row-4",
      order: 4,
      header: "N/A",
      sample: "N/A",
      caption: "Email",
      keyField: false,
      matchById: false,
    },
    {
      id: "row-5",
      order: 5,
      header: "N/A",
      sample: "N/A",
      caption: "Job Title",
      keyField: false,
      matchById: false,
    },
    {
      id: "row-6",
      order: 6,
      header: "N/A",
      sample: "N/A",
      caption: "Manager Name",
      keyField: false,
      matchById: false,
    },
  ]);

  // AI Assistant state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = useCallback(
    (csvText: string): string[][] => {
      const lines = csvText.split("\n").filter((line) => line.trim() !== "");
      const delim = delimiter === "comma" ? "," : "\t";

      return lines.map((line) => {
        const result = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];

          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === delim && !inQuotes) {
            result.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      });
    },
    [delimiter],
  );

  const analyzeCSVData = useCallback(
    (data: string[][]) => {
      if (data.length === 0) return [];

      const headerRow = hasHeader ? data[0] : null;
      const dataRows = hasHeader ? data.slice(1) : data;
      const maxColumns = Math.max(...data.map((row) => row.length));

      const columns: CSVColumn[] = [];

      for (let i = 0; i < maxColumns; i++) {
        const columnData = dataRows.map((row) => row[i] || "").filter(Boolean);
        const sample = columnData.slice(0, 3);

        // Determine column type
        let type = "text";
        if (columnData.every((val) => !isNaN(Number(val)) && val !== "")) {
          type = "number";
        } else if (columnData.some((val) => val.includes("@"))) {
          type = "email";
        } else if (
          columnData.some((val) => /\d{1,2}\/\d{1,2}\/\d{4}/.test(val))
        ) {
          type = "date";
        }

        columns.push({
          name: headerRow
            ? headerRow[i] || `Column ${i + 1}`
            : `Column ${i + 1}`,
          index: i,
          sample,
          type,
        });
      }

      return columns;
    },
    [hasHeader],
  );

  const generateAIMapping = useCallback(
    (columns: CSVColumn[]): MappingSuggestion[] => {
      const suggestions: MappingSuggestion[] = [];
      const existingCaptions = mappingRows
        .map((row) => row.caption)
        .filter(Boolean);

      columns.forEach((column, index) => {
        const columnName = column.name.toLowerCase();
        const sampleData = column.sample.join(" ").toLowerCase();

        let bestMatch = { caption: "", confidence: 0, reasoning: "" };

        // Smart matching logic against existing captions
        for (const caption of existingCaptions) {
          const captionLower = caption.toLowerCase();

          if (
            (captionLower.includes("forename") ||
              captionLower.includes("first")) &&
            (columnName.includes("first") ||
              columnName.includes("forename") ||
              (column.type === "text" &&
                column.sample.some((s) => s.length > 0 && s.length < 20)))
          ) {
            if (bestMatch.confidence < 0.9) {
              bestMatch = {
                caption,
                confidence: 0.9,
                reasoning: "Contains first names",
              };
            }
          } else if (
            (captionLower.includes("surname") ||
              captionLower.includes("last")) &&
            (columnName.includes("last") ||
              columnName.includes("surname") ||
              columnName.includes("family"))
          ) {
            if (bestMatch.confidence < 0.9) {
              bestMatch = {
                caption,
                confidence: 0.9,
                reasoning: "Contains surnames",
              };
            }
          } else if (
            captionLower.includes("email") &&
            (columnName.includes("email") || column.type === "email")
          ) {
            if (bestMatch.confidence < 0.95) {
              bestMatch = {
                caption,
                confidence: 0.95,
                reasoning: "Contains email addresses",
              };
            }
          } else if (
            (captionLower.includes("title") || captionLower.includes("job")) &&
            (columnName.includes("title") ||
              columnName.includes("job") ||
              columnName.includes("position"))
          ) {
            if (bestMatch.confidence < 0.8) {
              bestMatch = {
                caption,
                confidence: 0.8,
                reasoning: "Contains job titles",
              };
            }
          } else if (
            captionLower.includes("manager") &&
            (columnName.includes("manager") ||
              columnName.includes("supervisor"))
          ) {
            if (bestMatch.confidence < 0.8) {
              bestMatch = {
                caption,
                confidence: 0.8,
                reasoning: "Contains manager information",
              };
            }
          } else if (
            (captionLower.includes("reference") ||
              captionLower.includes("id")) &&
            (columnName.includes("id") ||
              columnName.includes("ref") ||
              columnName.includes("reference"))
          ) {
            if (bestMatch.confidence < 0.85) {
              bestMatch = {
                caption,
                confidence: 0.85,
                reasoning: "Contains reference/ID data",
              };
            }
          } else if (
            (captionLower.includes("org") || captionLower.includes("unit")) &&
            (columnName.includes("org") ||
              columnName.includes("unit") ||
              columnName.includes("department"))
          ) {
            if (bestMatch.confidence < 0.8) {
              bestMatch = {
                caption,
                confidence: 0.8,
                reasoning: "Contains organizational data",
              };
            }
          }
        }

        if (bestMatch.confidence > 0.5) {
          suggestions.push({
            columnIndex: index,
            caption: bestMatch.caption,
            confidence: bestMatch.confidence,
            reasoning: bestMatch.reasoning,
          });
        }
      });

      return suggestions;
    },
    [mappingRows],
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file || !file.name.endsWith(".csv")) {
        alert("Please select a valid CSV file");
        return;
      }

      setIsProcessing(true);
      setFileName(file.name);

      try {
        const text = await file.text();
        const parsedData = parseCSV(text);

        if (parsedData.length === 0) {
          alert("The CSV file appears to be empty");
          return;
        }

        setCSVData(parsedData);
        const columns = analyzeCSVData(parsedData);
        setCSVColumns(columns);

        // Generate AI mapping suggestions
        const suggestions = generateAIMapping(columns);

        // Update existing mapping rows with CSV data
        setMappingRows((prev) => {
          const updatedRows = [...prev];

          // First, reset all rows to show no CSV mapping
          updatedRows.forEach((row) => {
            row.header = "N/A";
            row.sample = "N/A";
            row.confidence = undefined;
            row.suggested = false;
          });

          // Then apply suggestions to matching captions
          suggestions.forEach((suggestion) => {
            const targetRow = updatedRows.find(
              (row) => row.caption === suggestion.caption,
            );
            if (targetRow) {
              const column = columns[suggestion.columnIndex];
              targetRow.header = column.name;
              targetRow.sample = column.sample[0] || "N/A";
              targetRow.confidence = suggestion.confidence;
              targetRow.suggested = true;
            }
          });

          return updatedRows;
        });
        setIsFileUploaded(true);

        // Add initial AI message
        const welcomeMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          type: "assistant",
          content: `Thanks! I've scanned your file "${file.name}" with ${columns.length} columns and ${parsedData.length - (hasHeader ? 1 : 0)} rows detected. Let's map it to your configured captions.`,
          timestamp: new Date(),
          suggestions,
        };

        setChatMessages([welcomeMessage]);

        // Add mapping analysis message
        setTimeout(() => {
          const analysisMessage: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            type: "assistant",
            content: generateMappingAnalysis(suggestions, columns),
            timestamp: new Date(),
          };
          setChatMessages((prev) => [...prev, analysisMessage]);
        }, 1000);
      } catch (error) {
        console.error("Error processing file:", error);
        alert(
          "Error processing the CSV file. Please check the format and try again.",
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [parseCSV, analyzeCSVData, generateAIMapping, hasHeader],
  );

  const generateMappingAnalysis = (
    suggestions: MappingSuggestion[],
    columns: CSVColumn[],
  ): string => {
    const configuredCaptions = mappingRows.filter((row) => row.caption).length;
    const mapped = suggestions.length;
    const unmappedCaptions = mappingRows.filter(
      (row) =>
        row.caption && !suggestions.find((s) => s.caption === row.caption),
    );
    const unmappedColumns = columns.filter(
      (_, index) => !suggestions.find((s) => s.columnIndex === index),
    );

    let message = `I've analyzed your CSV against your ${configuredCaptions} configured captions. Here's what I found:\n\n`;

    if (mapped > 0) {
      message += `✅ **Mapped (${mapped}):**\n`;
      suggestions.forEach((suggestion) => {
        const confidence = Math.round(suggestion.confidence * 100);
        const icon = confidence > 80 ? "🎯" : confidence > 60 ? "⚠️" : "❓";
        message += `${icon} ${columns[suggestion.columnIndex].name} → ${suggestion.caption} (${confidence}%)\n`;
      });
      message += "\n";
    }

    if (unmappedCaptions.length > 0) {
      message += `❌ **Unmapped Captions (${unmappedCaptions.length}):**\n`;
      unmappedCaptions.forEach((row) => {
        message += `• ${row.caption}\n`;
      });
      message += "\n";
    }

    if (unmappedColumns.length > 0) {
      message += `📋 **Unmapped CSV Columns (${unmappedColumns.length}):**\n`;
      unmappedColumns.forEach((column) => {
        message += `• ${column.name}\n`;
      });
      message += "\n";
    }

    if (unmappedCaptions.length > 0 || unmappedColumns.length > 0) {
      message += `Would you like me to help map the remaining items? I can suggest matches or you can tell me how to map them.`;
    } else {
      message += `Perfect! All your captions are mapped. You can review the mappings above.`;
    }

    return message;
  };

  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsAssistantTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const response = generateAIResponse(
        currentMessage,
        mappingRows,
        csvColumns,
      );
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        type: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
      setIsAssistantTyping(false);
    }, 1500);
  }, [currentMessage, mappingRows, csvColumns]);

  const generateAIResponse = (
    userInput: string,
    currentMappings: MappingRow[],
    columns: CSVColumn[],
  ): string => {
    const input = userInput.toLowerCase();

    if (
      input.includes("help") ||
      input.includes("what") ||
      input.includes("how")
    ) {
      return "I can help you map your CSV columns to the required fields. You can:\n\n• Ask me to suggest mappings for specific columns\n• Tell me if a mapping looks wrong\n• Ask me to explain why I suggested a particular mapping\n• Request me to map unmapped columns\n\nWhat would you like me to help with?";
    }

    if (input.includes("map") || input.includes("suggest")) {
      const unmapped = currentMappings.filter((row) => !row.caption);
      if (unmapped.length > 0) {
        return `I notice ${unmapped.length} columns still need mapping. Based on the data, here are my suggestions:\n\n${unmapped.map((row) => `• ${row.header} → I'd suggest mapping this to one of: ${availableCaptions.slice(0, 3).join(", ")}`).join("\n")}\n\nWhich would you like me to help with first?`;
      } else {
        return "All your columns are already mapped! The mapping looks complete. Is there anything you'd like me to review or change?";
      }
    }

    if (
      input.includes("confidence") ||
      input.includes("sure") ||
      input.includes("certain")
    ) {
      const confident = currentMappings.filter(
        (row) => row.confidence && row.confidence > 0.8,
      );
      const uncertain = currentMappings.filter(
        (row) => row.confidence && row.confidence <= 0.8,
      );

      let response = `Here's my confidence breakdown:\n\n`;
      if (confident.length > 0) {
        response += `High confidence (80%+):\n${confident.map((row) => `• ${row.header} → ${row.caption}`).join("\n")}\n\n`;
      }
      if (uncertain.length > 0) {
        response += `Lower confidence:\n${uncertain.map((row) => `• ${row.header} → ${row.caption} (${Math.round((row.confidence || 0) * 100)}%)`).join("\n")}\n\n`;
      }

      response += "Would you like me to review any of these mappings?";
      return response;
    }

    return "I understand you'd like help with the mapping. Could you be more specific? For example, you could ask me to:\n\n• 'Help map the remaining columns'\n• 'Why did you map X to Y?'\n• 'What should column Z be mapped to?'\n\nWhat would you like me to assist with?";
  };

  const updateMappingRow = useCallback(
    (rowId: string, field: string, value: any) => {
      setMappingRows((prev) =>
        prev.map((row) =>
          row.id === rowId ? { ...row, [field]: value } : row,
        ),
      );
    },
    [],
  );

  const removeMappingRow = useCallback((rowId: string) => {
    setMappingRows((prev) => prev.filter((row) => row.id !== rowId));
  }, []);

  const addMappingRow = useCallback(() => {
    const newRow: MappingRow = {
      id: `row-${Date.now()}`,
      order: mappingRows.length,
      header: "N/A",
      sample: "N/A",
      caption: "",
      keyField: false,
      matchById: false,
    };
    setMappingRows((prev) => [...prev, newRow]);
  }, [mappingRows.length]);

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Navigation Sidebar */}
      <div className="w-[100px] bg-[#00336E] flex flex-col items-center py-6">
        {/* Logo */}
        <div className="w-[76px] h-[38px] mb-8">
          <svg
            width="76"
            height="38"
            viewBox="0 0 76 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M68.9658 6.15814C70.2996 6.15814 71.3809 5.07013 71.3809 3.728C71.3809 2.38587 70.2996 1.29785 68.9658 1.29785C67.632 1.29785 66.5508 2.38587 66.5508 3.728C66.5508 5.07013 67.632 6.15814 68.9658 6.15814Z"
              fill="white"
            />
            <path
              d="M60.5454 7.62207H55.6641V34.6076H60.5454V7.62207Z"
              fill="white"
            />
            <path
              d="M45.1471 12.0374H41.2344V7.56543H53.9411V12.0374H50.0284V34.551H45.1471V12.0374Z"
              fill="white"
            />
            <path
              d="M33.8092 7.17969C29.3545 7.17969 27.3008 9.45413 27.3008 13.2708V28.8415C27.3008 32.6582 29.3498 34.9327 33.8092 34.9327C38.2686 34.9327 40.3176 32.6582 40.3176 28.8415V13.2708C40.3186 9.45413 38.2649 7.17969 33.8092 7.17969ZM35.4363 29.038C35.4363 29.9649 34.9324 30.4644 33.8092 30.4644C32.686 30.4644 32.1821 29.963 32.1821 29.038V13.078C32.1821 12.1512 32.686 11.6516 33.8092 11.6516C34.9324 11.6516 35.4363 12.1521 35.4363 13.078V29.038Z"
              fill="white"
            />
            <path
              d="M0.0898438 7.61426H10.2884L10.782 12.0862H4.97117V18.0615H9.07666L9.67272 22.5334H4.97117V30.1279H10.9366L11.4768 34.5998H0.0898438V7.61426Z"
              fill="white"
            />
            <path
              d="M12.4991 7.5918L12.4805 8.96165L15.7589 34.62H22.8383L26.1074 8.96165L26.0999 7.5918H21.6508L21.4375 9.45843L19.3689 26.7114H19.232L17.1299 9.45194L16.8849 7.5918H12.4991Z"
              fill="white"
            />
            <path
              d="M75.9104 34.551L71.41 18.4307L74.5971 8.96216L74.6074 7.56543H70.3333L69.9962 8.6906L68.9689 11.3951L67.9434 8.69523L67.528 7.56543H63.3508L63.3434 8.96216L66.5287 18.4307L62.0273 34.551H66.9087L68.9689 25.8305L71.03 34.551H75.9104Z"
              fill="white"
            />
          </svg>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-4">
          {[
            { icon: "🏠", label: "Home", active: true },
            { icon: "📁", label: "Modules" },
            { icon: "✓", label: "Tasks" },
            { icon: "👥", label: "Portal\nQueue" },
            { icon: "📄", label: "Files" },
            { icon: "👁", label: "Insights" },
            { icon: "📊", label: "Reports" },
          ].map((item, index) => (
            <div
              key={index}
              className={`flex flex-col items-center p-3 rounded ${item.active ? "bg-[#00336E]" : ""}`}
            >
              <div className="text-white text-xl mb-1">{item.icon}</div>
              <div className="text-white text-xs text-center leading-tight">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Evotix Core Logo */}
        <div className="mt-auto">
          <div className="text-white text-xs text-center opacity-70">
            <div className="font-bold">EVOTIX</div>
            <div className="text-[10px]">Core</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Menu */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-600 font-medium">Home</span>
            <ChevronDown className="h-4 w-4 text-gray-400 rotate-[-90deg]" />
            <span className="text-blue-600 font-medium">Data Import Map</span>
            <ChevronDown className="h-4 w-4 text-gray-400 rotate-[-90deg]" />
            <span className="text-gray-600">Edit</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-6">
            {/* Org Unit */}
            <div className="flex items-center gap-2">
              <div className="text-gray-600 text-sm">Org Unit</div>
              <div className="text-blue-600 font-semibold text-sm">
                East Kilbride
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <div className="text-gray-600 font-semibold text-sm">
                Michael Scott
              </div>
              <ChevronDown className="h-4 w-4 text-gray-600" />
            </div>

            {/* Settings */}
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              <span className="text-gray-600 font-semibold text-sm">
                Settings
              </span>
              <ChevronDown className="h-4 w-4 text-gray-600" />
            </div>

            {/* Help */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex items-center justify-center">
                <span className="text-gray-600 text-xs font-bold">?</span>
              </div>
              <span className="text-gray-600 font-semibold text-sm">Help</span>
              <ChevronDown className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6">
          <div className="max-w-[988px]">
            <div className="bg-white p-10 rounded">
              {/* Details Section */}
              <Card className="mb-10">
                <div className="relative">
                  <div className="absolute -top-3 left-4 bg-white px-2 flex items-center gap-2">
                    <div className="text-blue-600">
                      <svg
                        width="20"
                        height="14"
                        viewBox="0 0 20 14"
                        fill="none"
                      >
                        <rect
                          width="14"
                          height="5"
                          rx="1"
                          fill="currentColor"
                          transform="rotate(45 0 0)"
                        />
                        <rect
                          width="14"
                          height="5"
                          rx="1"
                          fill="currentColor"
                          transform="rotate(135 6 0)"
                        />
                      </svg>
                    </div>
                    <span className="font-medium text-lg text-gray-800">
                      Details
                    </span>
                  </div>
                  <CardContent className="pt-8 space-y-6">
                    {/* Type of Import */}
                    <div className="flex items-start gap-10">
                      <div className="w-[336px]">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-bold text-gray-700">
                            Type of Import
                          </span>
                          <span className="text-red-600 text-xl font-bold">
                            *
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center cursor-pointer"
                            onClick={() => setImportType("module")}
                          >
                            {importType === "module" && (
                              <div className="w-4 h-4 rounded-full bg-blue-600" />
                            )}
                          </div>
                          <span className="text-gray-700">Module</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center cursor-pointer"
                            onClick={() => setImportType("user")}
                          >
                            {importType === "user" && (
                              <div className="w-4 h-4 rounded-full bg-blue-600" />
                            )}
                          </div>
                          <span className="text-gray-700">User</span>
                        </label>
                      </div>
                    </div>

                    {/* Module */}
                    <div className="flex items-start gap-10">
                      <div className="w-[336px]">
                        <span className="font-bold text-gray-700">Module</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-[280px] h-9 px-2 border border-gray-300 rounded bg-gray-100 flex items-center">
                          <span className="text-gray-700">Person Register</span>
                        </div>
                        <Button className="h-9 px-3 border-3 border-blue-600 bg-transparent text-blue-600">
                          <Settings className="h-5 w-5" />
                          <ChevronDown className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="flex items-start gap-10">
                      <div className="w-[336px]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-700">Title</span>
                          <span className="text-red-600 text-xl font-bold">
                            *
                          </span>
                        </div>
                      </div>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-[280px] h-9"
                      />
                    </div>

                    {/* Description */}
                    <div className="flex items-start gap-10">
                      <div className="w-[336px]">
                        <span className="font-bold text-gray-700">
                          Description
                        </span>
                      </div>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-[303px] h-[120px] p-2 border border-gray-300 rounded resize-none"
                      />
                    </div>
                  </CardContent>
                </div>
              </Card>

              {/* File Format Details */}
              <div className="mb-6">
                <h3 className="font-bold text-lg text-gray-700 mb-6">
                  File Format Details
                </h3>

                {/* Has Header */}
                <div className="flex items-start gap-10 mb-6">
                  <div className="w-[336px]">
                    <span className="font-bold text-gray-700">Has Header</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={hasHeader}
                      onCheckedChange={setHasHeader}
                      className="w-5 h-5"
                    />
                  </div>
                </div>

                {/* Delimiter */}
                <div className="flex items-start gap-10 mb-6">
                  <div className="w-[336px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-700">Delimiter</span>
                      <span className="text-red-600 text-xl font-bold">*</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center cursor-pointer"
                        onClick={() => setDelimiter("comma")}
                      >
                        {delimiter === "comma" && (
                          <div className="w-4 h-4 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <span className="text-gray-700">Comma</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center cursor-pointer"
                        onClick={() => setDelimiter("tab")}
                      >
                        {delimiter === "tab" && (
                          <div className="w-4 h-4 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <span className="text-gray-700">Tab</span>
                    </label>
                  </div>
                </div>

                {/* Import Type */}
                <div className="flex items-start gap-10 mb-6">
                  <div className="w-[336px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-700">
                        Import Type
                      </span>
                      <span className="text-red-600 text-xl font-bold">*</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center cursor-pointer"
                        onClick={() => setOperationType("insert-update")}
                      >
                        {operationType === "insert-update" && (
                          <div className="w-4 h-4 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <span className="text-gray-700">Insert and Update</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center cursor-pointer"
                        onClick={() => setOperationType("insert")}
                      >
                        {operationType === "insert" && (
                          <div className="w-4 h-4 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <span className="text-gray-700">Insert</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center cursor-pointer"
                        onClick={() => setOperationType("update")}
                      >
                        {operationType === "update" && (
                          <div className="w-4 h-4 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <span className="text-gray-700">Update</span>
                    </label>
                  </div>
                </div>

                {/* Date Format */}
                <div className="flex items-start gap-10 mb-6">
                  <div className="w-[336px]">
                    <span className="font-bold text-gray-700">Date Format</span>
                  </div>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger className="w-[280px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Warning Banner */}
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 flex items-center gap-4 mb-6">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <span className="text-yellow-800">
                  All required fields (indicated with *) must be mapped. Record
                  fields must be matched by ID.
                </span>
              </div>

              {/* Data Table - Always show */}
              {
                <div className="border border-gray-300 rounded overflow-hidden mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="w-12 p-2 border-r border-gray-300"></th>
                        <th className="w-16 p-2 border-r border-gray-300 text-left text-sm font-medium text-gray-700">
                          Order
                        </th>
                        <th className="w-20 p-2 border-r border-gray-300 text-left text-sm font-medium text-gray-700">
                          Header
                        </th>
                        <th className="w-24 p-2 border-r border-gray-300 text-left text-sm font-medium text-gray-700">
                          Sample Data
                        </th>
                        <th className="w-60 p-2 border-r border-gray-300 text-left text-sm font-medium text-gray-700">
                          Caption
                        </th>
                        <th className="w-20 p-2 border-r border-gray-300 text-left text-sm font-medium text-gray-700">
                          Key Field
                        </th>
                        <th className="w-24 p-2 border-r border-gray-300 text-left text-sm font-medium text-gray-700">
                          Match By ID
                        </th>
                        <th className="w-28 p-2 text-left text-sm font-medium text-gray-700"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappingRows.map((row, index) => (
                        <tr key={row.id} className="border-t border-gray-300">
                          <td className="p-2 border-r border-gray-300 text-center">
                            <div className="flex flex-col gap-1">
                              <div className="w-5 h-1 bg-gray-600"></div>
                              <div className="w-5 h-1 bg-gray-600"></div>
                              <div className="w-5 h-1 bg-gray-600"></div>
                            </div>
                          </td>
                          <td className="p-2 border-r border-gray-300 text-sm text-gray-800">
                            {row.order}
                          </td>
                          <td className="p-2 border-r border-gray-300 text-sm text-gray-800 relative">
                            {row.header}
                            {row.suggested && (
                              <CheckCircle className="h-4 w-4 text-green-500 absolute top-2 right-2" />
                            )}
                          </td>
                          <td className="p-2 border-r border-gray-300 text-sm text-gray-800">
                            {row.sample}
                          </td>
                          <td className="p-2 border-r border-gray-300">
                            <Select
                              value={row.caption}
                              onValueChange={(value) =>
                                updateMappingRow(row.id, "caption", value)
                              }
                            >
                              <SelectTrigger className="w-full h-8 text-sm">
                                <SelectValue placeholder="Select caption..." />
                              </SelectTrigger>
                              <SelectContent>
                                {availableCaptions.map((caption) => (
                                  <SelectItem key={caption} value={caption}>
                                    {caption}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2 border-r border-gray-300 text-center">
                            <Checkbox
                              checked={row.keyField}
                              onCheckedChange={(checked) =>
                                updateMappingRow(row.id, "keyField", checked)
                              }
                              className="w-5 h-5"
                            />
                          </td>
                          <td className="p-2 border-r border-gray-300 text-center">
                            <Checkbox
                              checked={row.matchById}
                              onCheckedChange={(checked) =>
                                updateMappingRow(row.id, "matchById", checked)
                              }
                              className="w-5 h-5"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 px-3 bg-red-600 hover:bg-red-700"
                              onClick={() => removeMappingRow(row.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              }

              {/* Add Button - Always show */}
              <Button
                className="mb-6 bg-blue-600 hover:bg-blue-700"
                onClick={addMappingRow}
              >
                <span className="text-xl mr-2">+</span>
                Add
              </Button>

              <div className="w-full h-px bg-gray-300 mb-6"></div>

              {/* Data Mapping Assistant */}
              <div className="mb-6">
                <h3 className="font-bold text-lg text-gray-700 mb-6">
                  Data Mapping Assistant
                </h3>

                {!isFileUploaded ? (
                  <div className="flex flex-col items-center py-12 gap-6">
                    <div className="w-25 h-25 text-gray-400">
                      <svg
                        width="100"
                        height="100"
                        viewBox="0 0 100 100"
                        fill="none"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="48"
                          fill="#F2F2F7"
                          stroke="#778088"
                          strokeWidth="2"
                        />
                        <path
                          d="M25 35h50v40H25z"
                          fill="white"
                          stroke="#778088"
                          strokeWidth="2"
                        />
                        <path
                          d="M40 25h20v15H40z"
                          fill="#E8E9ED"
                          stroke="#778088"
                          strokeWidth="2"
                        />
                        <circle
                          cx="30"
                          cy="70"
                          r="15"
                          fill="#E8E9ED"
                          stroke="#778088"
                          strokeWidth="2"
                        />
                        <path
                          d="M25 65h10v10H25z"
                          fill="white"
                          stroke="#778088"
                          strokeWidth="2"
                        />
                        <path
                          d="M32 62v6M29 65h6"
                          stroke="#778088"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>

                    <div className="text-center space-y-3">
                      <h4 className="font-bold text-gray-800">
                        Upload Your CSV Data
                      </h4>
                      <p className="text-sm text-gray-600 max-w-[296px]">
                        Upload your CSV file and I'll help map the columns to
                        your configured captions above. The AI assistant will
                        suggest the best matches.
                      </p>
                    </div>

                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={handleUploadClick}
                      disabled={isProcessing}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isProcessing ? "Processing..." : "Upload File"}
                    </Button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg p-4">
                    {/* File Info */}
                    <div className="flex items-center gap-3 mb-4 p-3 bg-green-50 border border-green-200 rounded">
                      <FileText className="h-5 w-5 text-green-600" />
                      <span className="text-green-800 font-medium">
                        {fileName}
                      </span>
                      <span className="text-green-600 text-sm">
                        ({csvColumns.length} columns,{" "}
                        {csvData.length - (hasHeader ? 1 : 0)} rows)
                      </span>
                    </div>

                    {/* Chat Interface */}
                    <div className="space-y-4">
                      {/* Messages */}
                      <div className="max-h-64 overflow-y-auto space-y-3 p-3 bg-gray-50 rounded">
                        {chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.type === "user"
                                  ? "bg-blue-600 text-white"
                                  : "bg-white border border-gray-200 text-gray-800"
                              }`}
                            >
                              <div className="whitespace-pre-wrap">
                                {message.content}
                              </div>
                            </div>
                          </div>
                        ))}

                        {isAssistantTyping && (
                          <div className="flex justify-start">
                            <div className="bg-white border border-gray-200 text-gray-800 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                  <div
                                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.1s" }}
                                  ></div>
                                  <div
                                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.2s" }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600">
                                  Assistant is typing...
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Input */}
                      <div className="flex gap-2">
                        <Input
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                          placeholder="Type here to speak to the assistant"
                          className="flex-1"
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleSendMessage()
                          }
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!currentMessage.trim() || isAssistantTyping}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
