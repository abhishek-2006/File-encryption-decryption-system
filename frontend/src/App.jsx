import { useState, useEffect, useRef } from "react";
import { processFile } from "./api";

const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.591 1.59ZM12 18.75a.75.75 0 0 1 .75.75V21.75a.75.75 0 0 1-1.5 0V19.5a.75.75 0 0 1 .75-.75ZM5.106 17.834a.75.75 0 0 0 1.06 1.06l1.591-1.59a.75.75 0 1 0-1.06-1.061l-1.591 1.59ZM3 12a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12ZM6.166 5.106a.75.75 0 0 0-1.06 1.06l1.59 1.591a.75.75 0 1 0 1.061-1.06l-1.59-1.591Z" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" /></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" /></svg>;

function App() {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("Encrypt");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") !== "light");
  
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("fileHistory");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("fileHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleProcess = async (type) => {
    if (!file || !password) {
      alert("Please select a file and enter a key!");
      return;
    }

    setIsProcessing(true);
    setProgress(20);

    try {
      const blob = await processFile(file, password, type);
      setProgress(70);

      let filename = type === "encrypt" ? `encrypted_${file.name}.enc` : `decrypted_${file.name.replace(".enc", "")}`;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      const newEntry = {
        id: Date.now(),
        name: filename,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        status: type === 'encrypt' ? 'Encrypted' : 'Decrypted',
        date: new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        extension: file.name.split('.').pop().toUpperCase()
      };
      setHistory(prev => [newEntry, ...prev]);

      setProgress(100);
      setTimeout(() => {
        setFile(null);
        setPassword("");
        setIsProcessing(false);
        setProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        } 
      }, 500);

    } catch (error) {
      console.error(error);
      alert(error.message || "Error processing file");
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-50 dark:bg-[#020617] transition-colors duration-700 overflow-x-hidden relative selection:bg-indigo-500/30">
      
      {/* --- Ambient Background Glows --- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-500/20 dark:bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-fuchsia-500/20 dark:bg-fuchsia-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      {/* --- Header --- */}
      <header className="w-full max-w-6xl px-8 py-10 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-4 group">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-md opacity-40 group-hover:opacity-80 transition-opacity"></div>
            <div className="relative w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-600 to-fuchsia-600 flex items-center justify-center shadow-xl">
              <img src="/favicon.png" alt="Logo" className="w-7 h-7 invert" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Crypt<span className="bg-linear-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">Vault</span>
            </h1>
          </div>
        </div>
        
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="cursor-pointer p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl hover:scale-110 active:scale-95 transition-all text-slate-600 dark:text-slate-300 group"
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      {/* --- Navigation --- */}
      <nav className="inline-flex p-1.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl mb-12 relative z-20 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl">
        {["Encrypt", "history"].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-10 py-3 rounded-xl text-sm font-black transition-all duration-500 cursor-pointer uppercase tracking-wider ${
              activeTab === tab 
              ? 'bg-linear-to-br from-indigo-600 to-indigo-700 shadow-lg shadow-indigo-500/40 text-white scale-100' 
              : 'text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* --- Main Content Area --- */}
      <main className="w-full max-w-6xl px-8 pb-32 relative z-10 flex justify-center">
        
        {activeTab === "Encrypt" ? (
          <div className="w-full max-w-xl animate-in fade-in zoom-in-95 duration-700">
            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-3xl p-1 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-white dark:border-slate-800/50">
              <div className="bg-white dark:bg-slate-900/40 p-10 rounded-[2.8rem] space-y-10">
                
                {/* Header Section */}
                <div className="text-center space-y-2">
                  <div className="inline-flex p-4 rounded-3xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-2">
                    <LockIcon />
                  </div>
                  <h2 className="text-2xl font-black dark:text-white tracking-tight">Security Terminal</h2>
                  <p className="text-sm text-slate-500 font-medium italic">Ready for payload encryption...</p>
                </div>

                <div className="space-y-8">
                  {/* Enhanced Dropzone */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500 ml-1">Payload Path</label>
                    <div className="relative group/zone">
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        onChange={(e) => setFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`p-10 border-2 border-dashed rounded-[2rem] transition-all duration-500 text-center flex flex-col items-center gap-4 ${
                        file 
                        ? 'border-emerald-500 bg-emerald-500/5' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 group-hover/zone:border-indigo-500 group-hover/zone:bg-indigo-50/50 dark:group-hover/zone:bg-indigo-900/10'
                      }`}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-white dark:bg-slate-900 text-slate-400'}`}>
                          {file ? "📁" : "☁️"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            {file ? file.name : "Select Secure Asset"}
                          </p>
                          <p className="text-xs text-slate-400 font-medium mt-1">{file ? `${(file.size / 1024).toFixed(1)} KB` : "Drag & drop sensitive data"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Password */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500 ml-1">Access Protocol</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                        <LockIcon />
                      </div>
                      <input 
                        type="password" 
                        placeholder="Enter Cryptographic Key..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950/80 pl-12 pr-4 py-5 rounded-2xl border border-slate-100 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white placeholder:text-slate-400 font-medium"
                      />
                    </div>
                  </div>

                  {/* Progress Bar (Conditional) */}
                  {isProcessing && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <div className="flex justify-between text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                        <span>Processing Layer...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-linear-to-r from-indigo-500 to-fuchsia-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-5 pt-4">
                    <button 
                      onClick={() => handleProcess('encrypt')}
                      disabled={isProcessing}
                      className="group relative bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-5 rounded-2xl shadow-2xl hover:-translate-y-1 active:scale-95 transition-all cursor-pointer disabled:opacity-50 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                      <span className="relative z-10">ENCRYPT</span>
                    </button>
                    <button 
                      onClick={() => handleProcess('decrypt')}
                      disabled={isProcessing}
                      className="group relative bg-linear-to-br from-indigo-600 to-indigo-800 text-white font-black py-5 rounded-2xl shadow-xl hover:-translate-y-1 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                       <span className="relative z-10">DECRYPT</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* --- HISTORY PAGE --- */
          <div className="w-full animate-in fade-in slide-in-from-right-10 duration-700">
            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-white dark:border-slate-800 overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-xl dark:text-white">Transaction Logs</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Encrypted history for user: Abhishek</p>
                </div>
                <div className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-5 py-2 rounded-2xl font-black text-xs uppercase tracking-tighter ring-1 ring-indigo-500/20">
                  {history.length} ACTIVE VAULTS
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.25em] text-slate-400 bg-slate-50/50 dark:bg-slate-950/30">
                      <th className="px-10 py-6 font-black">Secure Item</th>
                      <th className="px-10 py-6 font-black">Status</th>
                      <th className="px-10 py-6 font-black">Timestamp</th>
                      <th className="px-10 py-6 font-black text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {history.map((item) => (
                      <tr key={item.id} className="group hover:bg-indigo-500/5 transition-all cursor-default">
                        <td className="px-10 py-7">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-2xl group-hover:rotate-6 transition-transform border border-slate-100 dark:border-slate-700">📄</div>
                            <div>
                              <p className="font-black text-slate-800 dark:text-slate-100 text-base">{item.name}</p>
                              <p className="text-[11px] text-slate-400 font-bold uppercase">{item.size}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-7">
                          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                            item.status === 'Encrypted' 
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' 
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Encrypted' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                            {item.status}
                          </div>
                        </td>
                        <td className="px-10 py-7 text-sm text-slate-500 dark:text-slate-400 font-bold tracking-tight">
                          {item.date}
                        </td>
                        <td className="px-10 py-7 text-right">
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            <button className="p-3 bg-white dark:bg-slate-800 shadow-sm hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-xl transition-all cursor-pointer border border-slate-100 dark:border-slate-700" title="Download">📥</button>
                            <button 
                              onClick={() => setHistory(history.filter(h => h.id !== item.id))}
                              className="p-3 bg-white dark:bg-slate-800 shadow-sm hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all cursor-pointer border border-slate-100 dark:border-slate-700" 
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
            </div>
          </div>
        )}
      </main>

      {/* --- Footer --- */}
      <footer className="mt-auto mb-10 text-center space-y-4">
        <div className="px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 inline-block">
          <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-[0.3em] uppercase">
            Made with ❤️ by 
            <a href="https://abhishekshah-portfolio.vercel.app/" className="text-indigo-500 hover:underline" target="_blank" rel="noopener noreferrer">
              Abhishek Shah
            </a> | © 2026 CryptVault
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;