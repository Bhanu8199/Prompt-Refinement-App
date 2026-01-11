import { useState } from "react";
import { motion } from "framer-motion";
import { type RefinedOutput } from "@shared/schema";
import { CheckCircle2, AlertTriangle, Target, Layers, FileText, Sparkles, Brain, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function RefinementDisplay({ data }: { data: RefinedOutput }) {
  const [showStructuredPrompt, setShowStructuredPrompt] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header Card */}
      <motion.div variants={item} className="glass-panel rounded-2xl p-6 border-l-4 border-l-primary">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Refined Analysis</h2>
              <p className="text-sm text-muted-foreground">AI Generated Structure</p>
            </div>
          </div>
          <div className="text-right">
             <div className="text-2xl font-bold text-primary tabular-nums">
               {(data.confidenceScore * 100).toFixed(0)}%
             </div>
             <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
               Confidence
             </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/5">
           <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-widest mb-2 flex items-center gap-2">
             <Target className="w-4 h-4" /> Primary Intent
           </h3>
           <p className="text-lg text-white leading-relaxed font-light">
             {data.primaryIntent}
           </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Functional Requirements */}
        <motion.div variants={item} className="bg-card rounded-xl p-6 border border-border shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent" />
            Functional Requirements
          </h3>
          <ul className="space-y-3">
            {Array.isArray(data.functionalExpectations) && data.functionalExpectations.map((req, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Technical Constraints */}
        <motion.div variants={item} className="bg-card rounded-xl p-6 border border-border shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Technical Constraints
          </h3>
          <ul className="space-y-3">
            {Array.isArray(data.technicalConstraints) && data.technicalConstraints.map((constraint, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                <span>{constraint}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Expected Outputs */}
      <motion.div variants={item} className="bg-card rounded-xl p-6 border border-border shadow-lg">
         <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Expected Outputs
          </h3>
          <div className="grid gap-3">
            {data.expectedOutputs.map((output, i) => (
              <div
                key={i}
                className="bg-secondary/50 rounded-lg p-3 text-sm text-gray-300 border border-white/5 cursor-pointer hover:bg-secondary/70 hover:border-primary/50 transition-colors"
                onClick={() => setShowStructuredPrompt(true)}
              >
                {output}
              </div>
            ))}
          </div>
      </motion.div>

      {/* Missing Information */}
      {Array.isArray(data.missingInformation) && data.missingInformation.length > 0 && (
        <motion.div variants={item} className="rounded-xl p-6 bg-red-900/10 border border-red-500/20">
          <h3 className="text-lg font-semibold text-red-200 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-400" />
            Areas for Improvement
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <h4 className="text-sm font-medium text-red-300 mb-2 uppercase tracking-wide">Missing Information</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-200/80">
                {data.missingInformation.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Structured Prompt Modal */}
      <Dialog open={showStructuredPrompt} onOpenChange={setShowStructuredPrompt}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              Structured Prompt Analysis
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <pre className="bg-secondary/50 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto border border-white/5">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
