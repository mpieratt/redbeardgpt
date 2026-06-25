import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';

function App() {
  // --- STATE ---
  // Group 1: CapEx
  const [gpuCost, setGpuCost] = useState<number>(1600);
  const [systemCost, setSystemCost] = useState<number>(1400);

  // Group 2: OpEx
  const [electricityRate, setElectricityRate] = useState<number>(0.09);
  const [loadWatts, setLoadWatts] = useState<number>(450);
  const [idleWatts, setIdleWatts] = useState<number>(100);

  // Group 3: Market Rates
  const [rentalRate, setRentalRate] = useState<number>(0.35);
  const [occupancyA, setOccupancyA] = useState<number>(80);
  const [occupancyB, setOccupancyB] = useState<number>(60);
  const [rentalWindowB, setRentalWindowB] = useState<number>(8);

  // Group 4: Daytime Revenue & Savings
  const [subscriptions, setSubscriptions] = useState<number>(10);
  const [savings, setSavings] = useState<number>(20);

  // Group 5: Hardware & Model Targets
  const [systemVram, setSystemVram] = useState<number>(24);
  const [modelSize, setModelSize] = useState<number>(32);
  const [quantization, setQuantization] = useState<number>(0.5); // Default: 4-bit (0.5 bytes)

  // --- CALCULATIONS ---
  // Monthly multiplier
  const DAYS_PER_MONTH = 30.4;

  const totalCapEx = gpuCost + systemCost;
  const totalDaytimeOffset = subscriptions + savings;

  const calculateScenario = (rentalHoursAvailable: number, occupancy: number) => {
    const dailyRentalHours = rentalHoursAvailable * (occupancy / 100);
    const dailyIdleHours = 24 - dailyRentalHours;
    const dailyGrossRevenue = dailyRentalHours * rentalRate;
    const dailyPowerCost = (((dailyRentalHours * loadWatts) + (dailyIdleHours * idleWatts)) / 1000) * electricityRate;

    const monthlyGrossRevenue = dailyGrossRevenue * DAYS_PER_MONTH;
    const monthlyPowerCost = dailyPowerCost * DAYS_PER_MONTH;
    const monthlyNetProfit = monthlyGrossRevenue - monthlyPowerCost + totalDaytimeOffset;

    let paybackMonths = -1;
    if (monthlyNetProfit > 0) {
      paybackMonths = totalCapEx / monthlyNetProfit;
    }

    const fiveYearRoi = ((monthlyNetProfit * 60) - totalCapEx) / totalCapEx * 100;

    return {
      monthlyGrossRevenue,
      monthlyPowerCost,
      monthlyNetProfit,
      paybackMonths,
      fiveYearRoi,
    };
  };

  const scenarioA = useMemo(() => calculateScenario(24, occupancyA), [occupancyA, rentalRate, loadWatts, idleWatts, electricityRate, totalCapEx, totalDaytimeOffset]);
  const scenarioB = useMemo(() => calculateScenario(rentalWindowB, occupancyB), [rentalWindowB, occupancyB, rentalRate, loadWatts, idleWatts, electricityRate, totalCapEx, totalDaytimeOffset]);

  // VRAM Logic
  const rawWeightsVram = modelSize * quantization;
  const estimatedVram = rawWeightsVram * 1.20;
  const isFeasible = estimatedVram <= systemVram;

  const getSuggestedModels = (vram: number) => {
    if (vram < 16) return ["Gemma 3 8B", "Llama 3 8B"];
    if (vram < 24) return ["Gemma 3 27B", "Qwen 3 14B", "Mistral Small 24B"];
    if (vram < 48) return ["Qwen 3 32B", "Command R 35B"];
    if (vram < 80) return ["Llama 3.3 70B", "Qwen 2.5 72B"];
    return ["DeepSeek V3", "Llama 4 Scout", "Qwen 3 235B"];
  };
  const suggestedModels = getSuggestedModels(systemVram);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">RedBeardGPT Node ROI Calculator</h1>
        <p className="text-slate-400 mt-2">Economic model for local GPU clusters & hybrid rental nodes.</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column (Inputs) */}
        <div className="space-y-6">
          
          {/* CapEx */}
          <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
            <h2 className="text-xl font-semibold mb-4 text-emerald-400">Capital Expenditure (CapEx)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">GPU Cost ($)</label>
                <div className="flex gap-4 items-center">
                  <input type="range" min="200" max="4000" step="50" value={gpuCost} onChange={(e) => setGpuCost(Number(e.target.value))} className="w-full accent-emerald-500" />
                  <input type="number" value={gpuCost} onChange={(e) => setGpuCost(Number(e.target.value))} className="w-24 px-3 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">System Components Cost ($)</label>
                <div className="flex gap-4 items-center">
                  <input type="range" min="200" max="3000" step="50" value={systemCost} onChange={(e) => setSystemCost(Number(e.target.value))} className="w-full accent-emerald-500" />
                  <input type="number" value={systemCost} onChange={(e) => setSystemCost(Number(e.target.value))} className="w-24 px-3 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100" />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Total CapEx:</span>
                  <span className="text-emerald-400">${totalCapEx.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* OpEx */}
          <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
            <h2 className="text-xl font-semibold mb-4 text-emerald-400">Operational Expenditure (OpEx)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Electricity Rate ($/kWh)</label>
                <div className="flex gap-4 items-center">
                  <input type="range" min="0.05" max="0.50" step="0.01" value={electricityRate} onChange={(e) => setElectricityRate(Number(e.target.value))} className="w-full accent-emerald-500" />
                  <input type="number" step="0.01" value={electricityRate} onChange={(e) => setElectricityRate(Number(e.target.value))} className="w-24 px-3 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Power Draw Under Load (Watts)</label>
                <div className="flex gap-4 items-center">
                  <input type="range" min="100" max="1000" step="10" value={loadWatts} onChange={(e) => setLoadWatts(Number(e.target.value))} className="w-full accent-emerald-500" />
                  <input type="number" value={loadWatts} onChange={(e) => setLoadWatts(Number(e.target.value))} className="w-24 px-3 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Power Draw at Idle (Watts)</label>
                <div className="flex gap-4 items-center">
                  <input type="range" min="50" max="300" step="10" value={idleWatts} onChange={(e) => setIdleWatts(Number(e.target.value))} className="w-full accent-emerald-500" />
                  <input type="number" value={idleWatts} onChange={(e) => setIdleWatts(Number(e.target.value))} className="w-24 px-3 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100" />
                </div>
              </div>
            </div>
          </div>

          {/* Compute Rental Market Rates */}
          <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
            <h2 className="text-xl font-semibold mb-4 text-emerald-400">Compute Rental Market Rates</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Expected Net Rental Rate ($/hour)</label>
                <div className="flex gap-4 items-center">
                  <input type="range" min="0.10" max="2.00" step="0.05" value={rentalRate} onChange={(e) => setRentalRate(Number(e.target.value))} className="w-full accent-emerald-500" />
                  <input type="number" step="0.05" value={rentalRate} onChange={(e) => setRentalRate(Number(e.target.value))} className="w-24 px-3 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Scenario A (24/7) Occupancy (%)</label>
                <div className="flex gap-4 items-center">
                  <input type="range" min="0" max="100" step="5" value={occupancyA} onChange={(e) => setOccupancyA(Number(e.target.value))} className="w-full accent-emerald-500" />
                  <input type="number" value={occupancyA} onChange={(e) => setOccupancyA(Number(e.target.value))} className="w-24 px-3 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Scenario B (Hybrid) Occupancy (%)</label>
                <div className="flex gap-4 items-center">
                  <input type="range" min="0" max="100" step="5" value={occupancyB} onChange={(e) => setOccupancyB(Number(e.target.value))} className="w-full accent-emerald-500" />
                  <input type="number" value={occupancyB} onChange={(e) => setOccupancyB(Number(e.target.value))} className="w-24 px-3 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Scenario B Rental Window (Hours/Day)</label>
                <div className="flex gap-4 items-center">
                  <input type="range" min="1" max="24" step="1" value={rentalWindowB} onChange={(e) => setRentalWindowB(Number(e.target.value))} className="w-full accent-emerald-500" />
                  <input type="number" value={rentalWindowB} onChange={(e) => setRentalWindowB(Number(e.target.value))} className="w-24 px-3 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100" />
                </div>
              </div>
            </div>
          </div>

          {/* Daytime Revenue & Savings */}
          <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
            <h2 className="text-xl font-semibold mb-4 text-emerald-400">Daytime Revenue & Savings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Friends & Family Subs ($/month)</label>
                <div className="flex gap-4 items-center">
                  <input type="range" min="0" max="100" step="5" value={subscriptions} onChange={(e) => setSubscriptions(Number(e.target.value))} className="w-full accent-emerald-500" />
                  <input type="number" value={subscriptions} onChange={(e) => setSubscriptions(Number(e.target.value))} className="w-24 px-3 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Replaced AI Sub Savings ($/month)</label>
                <div className="flex gap-4 items-center">
                  <input type="range" min="0" max="100" step="5" value={savings} onChange={(e) => setSavings(Number(e.target.value))} className="w-full accent-emerald-500" />
                  <input type="number" value={savings} onChange={(e) => setSavings(Number(e.target.value))} className="w-24 px-3 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100" />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Total Daytime Monthly Offset:</span>
                  <span className="text-emerald-400">${totalDaytimeOffset.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hardware & Model Targets */}
          <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
            <h2 className="text-xl font-semibold mb-4 text-emerald-400">Hardware & Model Targets</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Total System VRAM (GB)</label>
                <div className="flex gap-4 items-center">
                  <input type="range" min="8" max="192" step="4" value={systemVram} onChange={(e) => setSystemVram(Number(e.target.value))} className="w-full accent-emerald-500" />
                  <input type="number" value={systemVram} onChange={(e) => setSystemVram(Number(e.target.value))} className="w-24 px-3 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Target Model Size (Billion Params)</label>
                <div className="flex gap-4 items-center">
                  <input type="range" min="7" max="400" step="1" value={modelSize} onChange={(e) => setModelSize(Number(e.target.value))} className="w-full accent-emerald-500" />
                  <input type="number" value={modelSize} onChange={(e) => setModelSize(Number(e.target.value))} className="w-24 px-3 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Quantization Level</label>
                <select 
                  value={quantization} 
                  onChange={(e) => setQuantization(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value={2}>FP16 / Uncompressed (2 bytes/param)</option>
                  <option value={1}>8-bit / INT8 (1 byte/param)</option>
                  <option value={0.5}>4-bit / INT4 (0.5 bytes/param)</option>
                </select>
              </div>
            </div>
          </div>

        </div>
        {/* Right Column (Outputs) */}
        <div className="space-y-6">
          
          {/* Capability Radar */}
          <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
            <h2 className="text-xl font-semibold mb-4 text-emerald-400">Node Capabilities</h2>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">VRAM Usage: {estimatedVram.toFixed(1)}GB / {systemVram}GB</span>
                <span className={isFeasible ? "text-emerald-400" : "text-red-400"}>
                  {((estimatedVram / systemVram) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${isFeasible ? 'bg-emerald-500' : 'bg-red-500'}`} 
                  style={{ width: `${Math.min((estimatedVram / systemVram) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {!isFeasible && (
              <div className="flex items-start gap-3 p-3 bg-red-950/50 border border-red-900/50 rounded text-red-400 text-sm mb-4">
                <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>Insufficient VRAM: Node cannot host this model. Reduce parameters or increase quantization compression.</p>
              </div>
            )}
            
            {isFeasible && (
              <div className="flex items-start gap-3 p-3 bg-emerald-950/30 border border-emerald-900/50 rounded text-emerald-400 text-sm mb-4">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <p>Model fits comfortably within VRAM constraints.</p>
              </div>
            )}

            <div>
              <p className="text-sm text-slate-400 mb-2">Recommended Top Open Source Models for this Node (4-bit):</p>
              <div className="flex flex-wrap gap-2">
                {suggestedModels.map(model => (
                  <span key={model} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700">
                    {model}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Scenario A */}
            <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
              <h3 className="text-lg font-semibold text-slate-200 mb-4 border-b border-slate-800 pb-2">Dedicated 24/7 Hosting</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gross Revenue:</span>
                  <span className="text-slate-200">${scenarioA.monthlyGrossRevenue.toFixed(2)}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Electricity Bill:</span>
                  <span className="text-red-400">-${scenarioA.monthlyPowerCost.toFixed(2)}/mo</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 font-medium text-base">
                  <span className="text-slate-300">Net Profit:</span>
                  <span className={scenarioA.monthlyNetProfit >= 0 ? "text-emerald-400" : "text-red-500"}>
                    ${scenarioA.monthlyNetProfit.toFixed(2)}/mo
                  </span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Break-even:</span>
                    <span className="text-slate-200">
                      {scenarioA.paybackMonths > 0 
                        ? `${(scenarioA.paybackMonths / 12).toFixed(1)} Years (${scenarioA.paybackMonths.toFixed(1)} Mo)` 
                        : "Never"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">5-Year ROI:</span>
                    <span className={scenarioA.fiveYearRoi >= 0 ? "text-emerald-400" : "text-red-500"}>
                      {scenarioA.fiveYearRoi.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario B */}
            <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
              <h3 className="text-lg font-semibold text-slate-200 mb-4 border-b border-slate-800 pb-2">Hybrid Nightly</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gross Revenue:</span>
                  <span className="text-slate-200">${scenarioB.monthlyGrossRevenue.toFixed(2)}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Electricity Bill:</span>
                  <span className="text-red-400">-${scenarioB.monthlyPowerCost.toFixed(2)}/mo</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 font-medium text-base">
                  <span className="text-slate-300">Net Profit:</span>
                  <span className={scenarioB.monthlyNetProfit >= 0 ? "text-emerald-400" : "text-red-500"}>
                    ${scenarioB.monthlyNetProfit.toFixed(2)}/mo
                  </span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Break-even:</span>
                    <span className="text-slate-200">
                      {scenarioB.paybackMonths > 0 
                        ? `${(scenarioB.paybackMonths / 12).toFixed(1)} Years (${scenarioB.paybackMonths.toFixed(1)} Mo)` 
                        : "Never"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">5-Year ROI:</span>
                    <span className={scenarioB.fiveYearRoi >= 0 ? "text-emerald-400" : "text-red-500"}>
                      {scenarioB.fiveYearRoi.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Warnings */}
          {(scenarioA.monthlyNetProfit < 0 || scenarioB.monthlyNetProfit < 0) && (
            <div className="flex items-start gap-3 p-4 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>Critical: Operating at a loss. Electricity cost exceeds gross rental revenue. Optimize power draw or check utility rates.</p>
            </div>
          )}
          
          {(scenarioA.paybackMonths > 36 || scenarioB.paybackMonths > 36) && (
            <div className="flex items-start gap-3 p-4 bg-orange-950/30 border border-orange-900/50 rounded-lg text-orange-400 text-sm">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <p>Warning: High hardware obsolescence risk. The payback period exceeds 3 years. Consider lowering CapEx or upgrading to 24/7 hosting.</p>
            </div>
          )}

          {/* Payback Chart */}
          <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 h-[400px] flex flex-col">
            <h2 className="text-xl font-semibold mb-6 text-emerald-400">Cumulative Cash Flow (5 Years)</h2>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={Array.from({ length: 61 }).map((_, i) => ({
                    month: i,
                    scenarioA: i === 0 ? -totalCapEx : -totalCapEx + (scenarioA.monthlyNetProfit * i),
                    scenarioB: i === 0 ? -totalCapEx : -totalCapEx + (scenarioB.monthlyNetProfit * i),
                  }))}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} ticks={[0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60]} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                    itemStyle={{ color: '#f1f5f9' }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value: any) => [`$${Number(value).toFixed(0)}`, undefined]}
                    labelFormatter={(label) => `Month ${label}`}
                  />
                  <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="scenarioA" name="24/7 Hosting" stroke="#10b981" fillOpacity={1} fill="url(#colorA)" />
                  <Area type="monotone" dataKey="scenarioB" name="Hybrid Nightly" stroke="#3b82f6" fillOpacity={1} fill="url(#colorB)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-6 justify-center mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-slate-300">Dedicated 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-slate-300">Hybrid Nightly</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;