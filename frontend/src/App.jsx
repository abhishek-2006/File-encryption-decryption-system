import { useState } from "react";
import { processFile } from "./api";

export default function App() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState(["[SYSTEM]: Awaiting hardware uplink..."]);

  const addLog = (msg) => setTerminalLogs(prev => [`[${new Date().toLocaleTimeString()}]: ${msg}`, ...prev].slice(0, 15));

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const isEncrypted = selected.name.endsWith('.enc');
      addLog(`File detected: ${selected.name}`);
      addLog(`Payload Type: ${isEncrypted ? 'ENCRYPTED STREAM' : 'RAW DATA'}`);
      addLog("Integrity scan complete. Step 01 passed.");
      setStep(2);
    }
  };

  const handleProcess = async () => {
    if (!file || !password) return;
    const isEncrypted = file.name.endsWith('.enc');
    const mode = isEncrypted ? 'decrypt' : 'encrypt';
    
    setIsProcessing(true);
    addLog(`Initiating ${mode}ion sequence...`);
    
    try {
      const blob = await processFile(file, password, mode);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = mode === "encrypt" ? `${file.name}.enc` : file.name.replace(/\.enc$/, "");
      link.click();
      window.URL.revokeObjectURL(url);
      
      addLog(`${mode.toUpperCase()}ION_SUCCESS: Payload released.`);
      
      setTimeout(() => {
        setStep(1);
        setFile(null);
        setPassword("");
      }, 2000);
      
    } catch (err) {
      addLog(`CRITICAL ERROR: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    
    <div className="h-screen w-screen bg-[#050505] text-cyan-500 font-mono flex flex-col overflow-hidden selection:bg-cyan-500 selection:text-black">
      
      {/* Visual Identity - Scaled for Fullscreen Header */}
      <div className="flex-none pt-8 pb-4 text-center">
        <div className="text-4xl font-black tracking-tighter mb-1 glow-text">CRYPTVAULT</div>
        <div className="text-[10px] tracking-[0.3em] opacity-40 uppercase italic">Neural Encryption Interface</div>
      </div>

      {/* MAIN TERMINAL GRID - flex-1 fills remaining vertical space */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-px bg-cyan-900/20 border-y border-cyan-900/30 overflow-hidden relative">
        
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 border-2 border-cyan-900 border-t-cyan-400 rounded-full animate-spin mx-auto mb-6"></div>
              <div className="text-sm font-black tracking-[0.2em] animate-pulse uppercase">Modifying Bitstream...</div>
            </div>
          </div>
        )}

        {/* Stage 1: Sidebar Navigation */}
        <div className="lg:col-span-2 bg-black/40 p-8 flex flex-col justify-center space-y-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex flex-col items-center gap-3 transition-all duration-700 ${step === s ? 'opacity-100' : 'opacity-20'}`}>
              <div className={`w-12 h-12 rounded-full border flex items-center justify-center font-bold text-lg ${step === s ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] bg-cyan-950/30' : 'border-cyan-900'}`}>
                0{s}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-center">
                {s === 1 ? 'Ingestion' : s === 2 ? 'Identity' : 'Release'}
              </div>
            </div>
          ))}
        </div>

        {/* Stage 2: Interaction Terminal - The center "engine" */}
        <div className="lg:col-span-7 flex flex-col justify-center p-12 bg-gradient-to-b from-transparent to-cyan-950/5 relative">
          
          {/* Decorative Corner Brackets */}
          <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-cyan-900/50"></div>
          <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-cyan-900/50"></div>
          <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-cyan-900/50"></div>
          <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-cyan-900/50"></div>

          {step === 1 && (
            <div className="animate-in fade-in zoom-in duration-700 text-center space-y-10">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-500/40">Awaiting Source Packet</div>
              <label className="block p-20 border-2 border-cyan-900/40 bg-black hover:bg-cyan-950/20 cursor-pointer transition-all border-dashed group relative overflow-hidden">
                <input type="file" className="hidden" onChange={handleFileSelect} />
                <span className="relative z-10 text-xl tracking-[0.5em] font-black group-hover:text-white transition-all uppercase">Upload File</span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-cyan-500"></div>
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in slide-in-from-right-10 duration-700 space-y-10 max-w-lg mx-auto w-full">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-500/40 text-center">Authorization Sequence</div>
              <div className="relative">
                <input 
                  autoFocus
                  required
                  type="password"
                  placeholder="ENTER PRIVATE KEY"
                  className="w-full bg-transparent border-b-2 border-cyan-900 p-6 outline-none focus:border-cyan-500 text-3xl tracking-[0.2em] transition-all font-bold text-center"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && setStep(3)}
                />
                {password.length === 0 && (
                  <div className="text-[10px] text-red-500/60 text-center mt-2 animate-pulse tracking-widest">
                    FIELD REQUIRED: SECRET KEY MISSING
                  </div>
                )}
              </div>
              <button 
                onClick={() => password.trim() !== "" ? setStep(3) : addLog("ERROR: Key Required")}
                disabled={password.trim() === ""}
                className="w-full text-xs font-black border-2 border-cyan-500 py-4 hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_25px_rgba(6,182,212,0.2)] tracking-[0.2em]"
              >
                CONFIRM IDENTITY
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in zoom-in-95 duration-700 space-y-12 text-center max-w-xl mx-auto w-full">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-500/40">Ready To Transmit</div>
              
              <div className="p-8 border border-cyan-900 bg-black/60 shadow-inner">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Loaded Asset ID</div>
                <div className="text-lg font-bold truncate tracking-widest uppercase">{file?.name}</div>
              </div>

              <button 
                onClick={handleProcess}
                disabled={isProcessing}
                className={`w-full py-10 border-2 font-black tracking-[0.2em] transition-all text-xl
                  ${file?.name.endsWith('.enc') 
                    ? 'border-emerald-500 text-emerald-500 hover:shadow-[0_0_50px_rgba(16,185,129,0.4)] bg-emerald-950/5' 
                    : 'border-cyan-500 text-cyan-500 hover:shadow-[0_0_50px_rgba(6,182,212,0.4)] bg-cyan-950/5'}`}
              >
                {file?.name.endsWith('.enc') ? 'DECRYPT FILE' : 'ENCRYPT FILE'}
              </button>
              
              <button 
                onClick={() => setStep(1)} 
                className="text-[10px] opacity-30 hover:opacity-100 uppercase tracking-[0.2em] transition-opacity underline decoration-cyan-900"
              >
                Abort Protocol
              </button>
            </div>
          )}
        </div>

        {/* Stage 3: Live Output Streams - Fixed vertical height with scrollable logs */}
        <div className="lg:col-span-3 bg-black/80 flex flex-col overflow-hidden">
          <div className="flex-1 p-8 overflow-hidden flex flex-col">
            <div className="flex-none text-[11px] font-black text-cyan-900 uppercase mb-6 tracking-[0.2em] border-b border-cyan-900/30 pb-2">Telemetry Feed</div>
            
            {/* LOG CONTAINER: overflow-y-auto allows internal scrolling */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
              {terminalLogs.map((log, i) => (
                <div key={i} className="text-[11px] leading-relaxed break-all font-medium border-l-2 border-cyan-900 pl-4 py-2 bg-cyan-950/10 animate-in fade-in slide-in-from-left-2">
                  <span className="opacity-30 text-[9px]">{log.split(']: ')[0]}]:</span>
                  <br />
                  <span className="text-cyan-400/90">{log.split(']: ')[1]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-none p-8 border-t border-cyan-900/30 bg-black">
            <div className="text-[10px] opacity-30 uppercase tracking-[0.2em] mb-3">Node Connectivity</div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                    <div className="text-[11px] font-black tracking-widest uppercase">Encrypted Uplink</div>
                </div>
            </div>
          </div>
        </div>

      </div>

      {/* Fullscreen Footer - Tightened for minimalist look */}
      <footer className="flex-none py-6 text-center">
        <div className="inline-flex items-center gap-6 px-10 py-3 bg-[#0a0a0a] rounded-full border border-cyan-900/40 shadow-2xl group hover:border-cyan-500 transition-all">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] group-hover:text-cyan-400 transition-colors">
              Made with <i className="fas fa-heart text-red-500" /> by
            <a href="https://abhishekshah-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="mx-1 text-cyan-500 transition-colors hover:text-purple-400">
              Abhishek Shah
            </a> 
          </p>
        </div>
      </footer>
    </div>
  );
}