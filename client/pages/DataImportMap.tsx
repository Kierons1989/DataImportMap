import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Upload, X, Settings, ChevronDown } from "lucide-react";

export default function DataImportMap() {
  const [importType, setImportType] = useState("module");
  const [delimiter, setDelimiter] = useState("comma");
  const [operationType, setOperationType] = useState("insert-update");
  const [hasHeader, setHasHeader] = useState(true);
  const [title, setTitle] = useState("Workday Import");
  const [description, setDescription] = useState("Example HR import form");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");

  const [mappingRows] = useState([
    { order: 0, header: "N/A", sample: "N/A", caption: "Reference", keyField: true, matchById: true },
    { order: 1, header: "N/A", sample: "N/A", caption: "Org Unit", keyField: false, matchById: false },
    { order: 2, header: "N/A", sample: "N/A", caption: "Forename(s) *", keyField: false, matchById: false },
    { order: 3, header: "N/A", sample: "N/A", caption: "Surname *", keyField: false, matchById: false },
    { order: 4, header: "N/A", sample: "N/A", caption: "Email *", keyField: false, matchById: false },
    { order: 5, header: "N/A", sample: "N/A", caption: "Job Title", keyField: false, matchById: false },
    { order: 6, header: "N/A", sample: "N/A", caption: "Manager Name", keyField: false, matchById: false },
  ]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Navigation Sidebar */}
      <div className="w-[100px] bg-[#00336E] flex flex-col items-center py-6">
        {/* Logo */}
        <div className="w-[76px] h-[38px] mb-8">
          <svg width="76" height="38" viewBox="0 0 76 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M68.9658 6.15814C70.2996 6.15814 71.3809 5.07013 71.3809 3.728C71.3809 2.38587 70.2996 1.29785 68.9658 1.29785C67.632 1.29785 66.5508 2.38587 66.5508 3.728C66.5508 5.07013 67.632 6.15814 68.9658 6.15814Z" fill="white"/>
            <path d="M60.5454 7.62207H55.6641V34.6076H60.5454V7.62207Z" fill="white"/>
            <path d="M45.1471 12.0374H41.2344V7.56543H53.9411V12.0374H50.0284V34.551H45.1471V12.0374Z" fill="white"/>
            <path d="M33.8092 7.17969C29.3545 7.17969 27.3008 9.45413 27.3008 13.2708V28.8415C27.3008 32.6582 29.3498 34.9327 33.8092 34.9327C38.2686 34.9327 40.3176 32.6582 40.3176 28.8415V13.2708C40.3186 9.45413 38.2649 7.17969 33.8092 7.17969ZM35.4363 29.038C35.4363 29.9649 34.9324 30.4644 33.8092 30.4644C32.686 30.4644 32.1821 29.963 32.1821 29.038V13.078C32.1821 12.1512 32.686 11.6516 33.8092 11.6516C34.9324 11.6516 35.4363 12.1521 35.4363 13.078V29.038Z" fill="white"/>
            <path d="M0.0898438 7.61426H10.2884L10.782 12.0862H4.97117V18.0615H9.07666L9.67272 22.5334H4.97117V30.1279H10.9366L11.4768 34.5998H0.0898438V7.61426Z" fill="white"/>
            <path d="M12.4991 7.5918L12.4805 8.96165L15.7589 34.62H22.8383L26.1074 8.96165L26.0999 7.5918H21.6508L21.4375 9.45843L19.3689 26.7114H19.232L17.1299 9.45194L16.8849 7.5918H12.4991Z" fill="white"/>
            <path d="M75.9104 34.551L71.41 18.4307L74.5971 8.96216L74.6074 7.56543H70.3333L69.9962 8.6906L68.9689 11.3951L67.9434 8.69523L67.528 7.56543H63.3508L63.3434 8.96216L66.5287 18.4307L62.0273 34.551H66.9087L68.9689 25.8305L71.03 34.551H75.9104Z" fill="white"/>
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
            <div key={index} className={`flex flex-col items-center p-3 rounded ${item.active ? 'bg-[#00336E]' : ''}`}>
              <div className="text-white text-xl mb-1">{item.icon}</div>
              <div className="text-white text-xs text-center leading-tight">{item.label}</div>
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
              <div className="text-blue-600 font-semibold text-sm">East Kilbride</div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <div className="text-gray-600 font-semibold text-sm">Michael Scott</div>
              <ChevronDown className="h-4 w-4 text-gray-600" />
            </div>

            {/* Settings */}
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              <span className="text-gray-600 font-semibold text-sm">Settings</span>
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
                      <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                        <rect width="14" height="5" rx="1" fill="currentColor" transform="rotate(45 0 0)" />
                        <rect width="14" height="5" rx="1" fill="currentColor" transform="rotate(135 6 0)" />
                      </svg>
                    </div>
                    <span className="font-medium text-lg text-gray-800">Details</span>
                  </div>
                  <CardContent className="pt-8 space-y-6">
                    {/* Type of Import */}
                    <div className="flex items-start gap-10">
                      <div className="w-[336px]">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-bold text-gray-700">Type of Import</span>
                          <span className="text-red-600 text-xl font-bold">*</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center">
                            {importType === "module" && <div className="w-4 h-4 rounded-full bg-blue-600" />}
                          </div>
                          <span className="text-gray-700">Module</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center">
                            {importType === "user" && <div className="w-4 h-4 rounded-full bg-blue-600" />}
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
                          <span className="text-red-600 text-xl font-bold">*</span>
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
                        <span className="font-bold text-gray-700">Description</span>
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
                <h3 className="font-bold text-lg text-gray-700 mb-6">File Format Details</h3>

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
                    <label className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center">
                        {delimiter === "comma" && <div className="w-4 h-4 rounded-full bg-blue-600" />}
                      </div>
                      <span className="text-gray-700">Comma</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center">
                        {delimiter === "tab" && <div className="w-4 h-4 rounded-full bg-blue-600" />}
                      </div>
                      <span className="text-gray-700">Tab</span>
                    </label>
                  </div>
                </div>

                {/* Import Type */}
                <div className="flex items-start gap-10 mb-6">
                  <div className="w-[336px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-700">Import Type</span>
                      <span className="text-red-600 text-xl font-bold">*</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center">
                        {operationType === "insert-update" && <div className="w-4 h-4 rounded-full bg-blue-600" />}
                      </div>
                      <span className="text-gray-700">Insert and Update</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center">
                        {operationType === "insert" && <div className="w-4 h-4 rounded-full bg-blue-600" />}
                      </div>
                      <span className="text-gray-700">Insert</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center">
                        {operationType === "update" && <div className="w-4 h-4 rounded-full bg-blue-600" />}
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
                  All required fields (indicated with *) must be mapped. Record fields must be matched by ID.
                </span>
              </div>

              {/* Data Table */}
              <div className="border border-gray-300 rounded overflow-hidden mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="w-12 p-2 border-r border-gray-300"></th>
                      <th className="w-16 p-2 border-r border-gray-300 text-left text-sm font-medium text-gray-700">Order</th>
                      <th className="w-20 p-2 border-r border-gray-300 text-left text-sm font-medium text-gray-700">Header</th>
                      <th className="w-24 p-2 border-r border-gray-300 text-left text-sm font-medium text-gray-700">Sample Data</th>
                      <th className="w-60 p-2 border-r border-gray-300 text-left text-sm font-medium text-gray-700">Caption</th>
                      <th className="w-20 p-2 border-r border-gray-300 text-left text-sm font-medium text-gray-700">Key Field</th>
                      <th className="w-24 p-2 border-r border-gray-300 text-left text-sm font-medium text-gray-700">Match By ID</th>
                      <th className="w-28 p-2 text-left text-sm font-medium text-gray-700"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappingRows.map((row, index) => (
                      <tr key={index} className="border-t border-gray-300">
                        <td className="p-2 border-r border-gray-300 text-center">
                          <div className="flex flex-col gap-1">
                            <div className="w-5 h-1 bg-gray-600"></div>
                            <div className="w-5 h-1 bg-gray-600"></div>
                            <div className="w-5 h-1 bg-gray-600"></div>
                          </div>
                        </td>
                        <td className="p-2 border-r border-gray-300 text-sm text-gray-800">{row.order}</td>
                        <td className="p-2 border-r border-gray-300 text-sm text-gray-800">{row.header}</td>
                        <td className="p-2 border-r border-gray-300 text-sm text-gray-800">{row.sample}</td>
                        <td className="p-2 border-r border-gray-300">
                          <Select defaultValue={row.caption}>
                            <SelectTrigger className="w-full h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={row.caption}>{row.caption}</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2 border-r border-gray-300 text-center">
                          <Checkbox 
                            checked={row.keyField}
                            className="w-5 h-5"
                          />
                        </td>
                        <td className="p-2 border-r border-gray-300 text-center">
                          <Checkbox 
                            checked={row.matchById}
                            className="w-5 h-5"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 px-3 bg-red-600 hover:bg-red-700"
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

              {/* Add Button */}
              <Button className="mb-6 bg-blue-600 hover:bg-blue-700">
                <span className="text-xl mr-2">+</span>
                Add
              </Button>

              <div className="w-full h-px bg-gray-300 mb-6"></div>

              {/* Data Mapping Assistant */}
              <div className="mb-6">
                <h3 className="font-bold text-lg text-gray-700 mb-6">Data Mapping Assistant</h3>

                <div className="flex flex-col items-center py-12 gap-6">
                  <div className="w-25 h-25 text-gray-400">
                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="50" r="48" fill="#F2F2F7" stroke="#778088" strokeWidth="2"/>
                      <path d="M25 35h50v40H25z" fill="white" stroke="#778088" strokeWidth="2"/>
                      <path d="M40 25h20v15H40z" fill="#E8E9ED" stroke="#778088" strokeWidth="2"/>
                      <circle cx="30" cy="70" r="15" fill="#E8E9ED" stroke="#778088" strokeWidth="2"/>
                      <path d="M25 65h10v10H25z" fill="white" stroke="#778088" strokeWidth="2"/>
                      <path d="M32 62v6M29 65h6" stroke="#778088" strokeWidth="2"/>
                    </svg>
                  </div>

                  <div className="text-center space-y-3">
                    <h4 className="font-bold text-gray-800">Upload Your Data</h4>
                    <p className="text-sm text-gray-600 max-w-[296px]">
                      Click below to select a .csv file to upload. We'll analyse the data, structure and mapping options and help you to configure the data correctly
                    </p>
                  </div>

                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
