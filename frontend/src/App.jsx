import { useState } from "react";
import { processFile } from "./api";

export default function App() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState(["[SYSTEM]: Awaiting hardware uplink..."]);

  const addLog = (msg) => setTerminalLogs(prev => [`[${new Date().toLocaleTimeString()}]: ${msg}`, ...prev].slice(0, 5));

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const isEncrypted = selected.name.endsWith('.enc');
      addLog(`File detected: ${selected.name}`);
      addLog(`Payload Type: ${isEncrypted ? 'ENCRYPTED_STREAM' : 'RAW_DATA'}`);
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
      if (mode === "encrypt") {
        link.download = `${file.name}.enc`;
      } else {
        link.download = file.name.replace(/\.enc$/, "");
      }
      link.click();
      window.URL.revokeObjectURL(url);
      
      addLog(`${mode.toUpperCase()}ION_SUCCESS: Payload released.`);
      
      // Auto-reset after successful operation
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
    <div className="min-h-screen bg-[#050505] text-cyan-500 font-mono p-4 md:p-12 flex flex-col items-center selection:bg-cyan-500 selection:text-black">
      
      {/* Visual Identity */}
      <div className="mb-12 text-center">
        <div className="text-5xl font-black tracking-tighter mb-2 glow-text">CRYPTVAULT</div>
        <div className="text-[10px] tracking-[0.3em] opacity-50 uppercase italic">Neural Encryption Interface</div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-1 bg-[#0a0a0a] border border-cyan-900/30 rounded-sm shadow-2xl overflow-hidden relative">
        
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center border border-cyan-500/50">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-cyan-900 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-xs font-black tracking-[0.3em] animate-pulse uppercase">Modifying Bitstream...</div>
            </div>
          </div>
        )}

        {/* Stage 1: Sidebar Navigation */}
        <div className="lg:col-span-3 border-r border-cyan-900/30 bg-black/40 p-8 space-y-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex items-center gap-5 transition-all duration-500 ${step === s ? 'opacity-100 translate-x-2' : 'opacity-20'}`}>
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm ${step === s ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] bg-cyan-950/30' : 'border-cyan-900'}`}>
                0{s}
              </div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em]">
                {s === 1 ? 'Ingestion' : s === 2 ? 'Identity' : 'Release'}
              </div>
            </div>
          ))}
        </div>

        {/* Stage 2: Interaction Terminal */}
        <div className="lg:col-span-6 p-12 min-h-[450px] flex flex-col justify-center border-r border-cyan-900/30 bg-gradient-to-b from-transparent to-cyan-950/5">
          {step === 1 && (
            <div className="animate-in fade-in duration-700 text-center space-y-8">
              <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-500/60">Awaiting Data Packet</div>
              <label className="block p-16 border border-cyan-900/40 bg-black hover:bg-cyan-950/20 cursor-pointer transition-all border-dashed group relative overflow-hidden">
                <input type="file" className="hidden" onChange={handleFileSelect} />
                <span className="relative z-10 group-hover:tracking-[0.4em] transition-all font-black">LOAD PAYLOAD</span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-cyan-500"></div>
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in slide-in-from-right-10 duration-700 space-y-8">
              <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-500/60">Authorization Required</div>
              <div className="relative">
                <input 
                  autoFocus
                  type="password"
                  placeholder="PROMPT PRIVATE KEY"
                  className="w-full bg-transparent border-b-2 border-cyan-900 p-5 outline-none focus:border-cyan-500 text-2xl tracking-[0.3em] transition-all font-bold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && setStep(3)}
                />
              </div>
              <button 
                onClick={() => setStep(3)}
                className="text-[11px] font-black border-2 border-cyan-500 px-8 py-3 hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              >
                AUTHORIZE
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in zoom-in-95 duration-700 space-y-10 text-center">
              <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-500/60">Execution Phase</div>
              
              <div className="p-6 border border-cyan-900 bg-black/40">
                <div className="text-[9px] uppercase tracking-widest text-zinc-500 mb-2">Selected Asset</div>
                <div className="text-sm font-bold truncate tracking-widest uppercase">{file?.name}</div>
              </div>

              <button 
                onClick={handleProcess}
                disabled={isProcessing}
                className={`w-full py-8 border-2 font-black tracking-[0.4em] transition-all relative overflow-hidden group
                  ${file?.name.endsWith('.enc') 
                    ? 'border-emerald-500 text-emerald-500 hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]' 
                    : 'border-cyan-500 text-cyan-500 hover:shadow-[0_0_40px_rgba(6,182,212,0.3)]'}`}
              >
                <span className="relative z-10">
                  {file?.name.endsWith('.enc') ? 'DECRYPT FILE' : 'ENCRYPT FILE'}
                </span>
              </button>
              
              <button 
                onClick={() => setStep(1)} 
                className="text-[10px] opacity-40 hover:opacity-100 uppercase tracking-[0.4em] transition-opacity underline decoration-cyan-900"
              >
                Abort Protocol
              </button>
            </div>
          )}
        </div>

        {/* Stage 3: Live Output Streams */}
        <div className="lg:col-span-3 p-8 bg-black/80 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-black text-cyan-900 uppercase mb-6 tracking-[0.2em] border-b border-cyan-900/30 pb-2">Telemetry Log</div>
            <div className="space-y-4">
              {terminalLogs.map((log, i) => (
                <div key={i} className="text-[10px] leading-relaxed break-all font-medium border-l border-cyan-900 pl-3 py-1 bg-cyan-950/5">
                  <span className="opacity-40">{log.split(']: ')[0]}]:</span>
                  <br />
                  <span className="text-cyan-400">{log.split(']: ')[1]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-8 border-t border-cyan-900/30">
            <div className="text-[10px] opacity-40 uppercase tracking-widest">Uplink Identity</div>
            <div className="flex items-center gap-3 mt-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
              <div className="text-[11px] font-black tracking-widest">AUTH ACTIVE</div>
            </div>
          </div>
        </div>

      </div>

      <footer className="mt-16 text-center space-y-4">
        <div className="inline-flex items-center gap-4 px-8 py-3 bg-[#0a0a0a] rounded-full border border-cyan-900/40 shadow-xl group hover:border-cyan-500 transition-all">
          <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] group-hover:text-cyan-500 transition-colors">
            Made with ❤️ by
            <a href="https://abhishekshah-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="mx-1 hover:underline">
              Abhishek Shah
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}