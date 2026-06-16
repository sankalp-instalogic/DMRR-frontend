import { useState } from "react";
import { Search, BrainCircuit, FileText, CheckCircle, ExternalLink, HelpCircle } from "lucide-react";

const predefinedQuestions = [
  "What is the total cumulative budget allocated to Mumbai district?",
  "Are there any deficiencies noted in the PMU Scrutiny for WO/DMRR/2025/001?",
  "Did the TAC recommend the proposal DMRR/2025/PUN/034?",
  "Show me the environmental compliance issues from the DPR.",
];

export function AIDocumentIntelligence() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSearch = (q = query) => {
    if (!q) return;
    setQuery(q);
    setLoading(true);
    // Simulate AI response
    setTimeout(() => {
      setResponse({
        text: `Based on the latest documents, the requested information for "${q}" is verified. The cumulative allocation stands at ₹1,200 Lakhs, and the TAC has recommended it with a conditional note on the environmental clearance. The DPR indicates minor technical deviations that require justification.`,
        confidence: 94,
        citations: ["DPR_MUM_001.pdf (Page 14)", "TAC_MoM_June2025.pdf (Page 2)"],
        related: ["Technical_Sanction_MUM.pdf", "PMU_Review_Notes_001.pdf"]
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1>AI Document Intelligence</h1>
        <p className="text-sm text-muted-foreground">Ask questions to extract insights from proposals, DPRs, PAC MoMs, and Budgets.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ask Proposal Questions, DPR Questions, PAC Questions, Budget Questions..."
              className="w-full pl-12 pr-4 py-4 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            />
          </div>
          <button 
            onClick={() => handleSearch()}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-xl flex items-center gap-2 hover:opacity-90 font-medium text-lg"
          >
            <BrainCircuit className="size-6" /> Extract Insight
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {predefinedQuestions.map((pq, i) => (
            <button 
              key={i} 
              onClick={() => handleSearch(pq)}
              className="px-3 py-1.5 bg-muted text-muted-foreground rounded-full text-sm hover:bg-muted/80 hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="size-3" /> {pq}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
          <BrainCircuit className="size-12 text-primary mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-medium text-muted-foreground">Analyzing documents and extracting context...</h3>
        </div>
      )}

      {!loading && response && (
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-6 border-t-4 border-t-accent">
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#0B1F4D]">AI Insight</h3>
            <p className="text-lg leading-relaxed">{response.text}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border">
            <div>
              <h4 className="text-sm font-bold text-muted-foreground mb-2 flex items-center gap-1"><CheckCircle className="size-4"/> Confidence Score</h4>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-accent">{response.confidence}%</span>
                <span className="text-sm text-muted-foreground pb-1">High Accuracy</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-1"><FileText className="size-4"/> Source Citations</h4>
              <ul className="space-y-2">
                {response.citations.map((cite, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="size-1.5 rounded-full bg-primary" /> {cite}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-1"><ExternalLink className="size-4"/> Related Documents</h4>
              <ul className="space-y-2">
                {response.related.map((doc, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-secondary hover:underline cursor-pointer">
                    <FileText className="size-4" /> {doc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}