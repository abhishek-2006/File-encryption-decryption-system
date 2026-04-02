import React, { useState, useMemo } from "react";

const FileHistory = ({ files, onDownload, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });

  // 1. Dynamic Search & Filter Logic
  const filteredFiles = useMemo(() => {
    let sortableFiles = [...files];
    
    // Filter by search term
    if (searchTerm) {
      sortableFiles = sortableFiles.filter((f) =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort logic
    sortableFiles.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sortableFiles;
  }, [files, searchTerm, sortConfig]);

  // Handle Sort Toggle
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 px-4">
      
      {/* 2. Top Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            🔍
          </div>
          <input
            type="text"
            placeholder="Search vault items..."
            className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
           <span className="text-[10px] font-black px-3 py-1 text-slate-500 dark:text-slate-400 uppercase tracking-widest self-center">
            {filteredFiles.length} Records
           </span>
        </div>
      </div>

      {/* 3. Main Table Container */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white dark:border-slate-800 overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-400 bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800">
                <th 
                  className="px-8 py-5 cursor-pointer hover:text-indigo-500 transition-colors"
                  onClick={() => requestSort("name")}
                >
                  File Name {sortConfig.key === "name" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="px-8 py-5">Format</th>
                <th 
                  className="px-8 py-5 cursor-pointer hover:text-indigo-500 transition-colors"
                  onClick={() => requestSort("status")}
                >
                  Status {sortConfig.key === "status" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                </th>
                <th 
                  className="px-8 py-5 cursor-pointer hover:text-indigo-500 transition-colors"
                  onClick={() => requestSort("date")}
                >
                  Date {sortConfig.key === "date" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="px-8 py-5 text-right">Vault Controls</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredFiles.map((file, index) => (
                <tr key={index} className="hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500/10 to-fuchsia-500/10 flex items-center justify-center text-indigo-500 text-lg group-hover:rotate-6 transition-transform">
                        {file.status === 'Encrypted' ? '🔒' : '📄'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate max-w-[180px]">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{file.size || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">
                      {file.extension || ".enc"}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
                      file.status === 'Encrypted' 
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' 
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${file.status === 'Encrypted' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                      {file.status}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {file.date}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => onDownload(file)}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm cursor-pointer"
                        title="Download"
                      >
                        📥
                      </button>
                      <button 
                        onClick={() => onDelete(file)}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm cursor-pointer"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 4. Empty State Enhancement */}
        {filteredFiles.length === 0 && (
          <div className="p-24 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl opacity-50 grayscale">
              🗄️
            </div>
            <h4 className="text-lg font-bold text-slate-700 dark:text-slate-200">No records found</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {searchTerm ? "Try adjusting your search filters" : "Start by encrypting your first file in the processor."}
            </p>
            {searchTerm && (
               <button 
                onClick={() => setSearchTerm("")}
                className="mt-6 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline cursor-pointer"
               >
                Clear Search
               </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileHistory;