import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useRefinePrompt } from "@/hooks/use-prompts";
import { RefinementDisplay } from "@/components/RefinementDisplay";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ArrowRight, Loader2, Paperclip, Type } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type RefinedOutput } from "@shared/schema";
import { api } from "@shared/routes";

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<RefinedOutput | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { mutate, isPending } = useRefinePrompt();
  const { toast } = useToast();

  const getFileType = (file: File): string => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'document';
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'document';
    if (file.type.startsWith('video/')) return 'document';
    return 'document';
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      try {
        // For text files, read as text
        if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          const text = await file.text();
          setInput(text);
          toast({
            title: "File loaded",
            description: `${file.name} content loaded successfully.`,
          });
        } else {
          // For binary files (images, videos, etc.), just show filename
          setInput(`[File uploaded: ${file.name}]`);
          toast({
            title: "File selected",
            description: `${file.name} selected. Non-text files will be processed by the AI.`,
          });
        }
      } catch (error) {
        toast({
          title: "Error loading file",
          description: "Failed to read the selected file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRefine = () => {
    if (!input.trim() && !selectedFile) {
      toast({
        title: "Input required",
        description: "Please enter a prompt or select a file to refine.",
        variant: "destructive",
      });
      return;
    }

    console.log("Input being sent:", input, "File:", selectedFile);

    // Prepare data for the hook
    const data: { input_text?: string; file?: File; source_type?: string } = {};

    if (selectedFile) {
      data.file = selectedFile;
      data.source_type = getFileType(selectedFile);
    } else {
      data.input_text = input;
      data.source_type = "text";
    }

    mutate(data, {
      onSuccess: (responseData) => {
        try {
          const parsedResult = JSON.parse(responseData.refinedPrompt);
          setResult(parsedResult);
          toast({
            title: "Prompt Refined",
            description: "AI analysis complete.",
          });
        } catch (parseError) {
          console.error('Failed to parse refined prompt:', parseError);
          toast({
            title: "Error",
            description: "Failed to process the refined output.",
            variant: "destructive",
          });
        }
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Layout>
      <div className="flex flex-col xl:flex-row gap-8 min-h-[calc(100vh-8rem)]">
        {/* Left Column: Input */}
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Prompt <span className="text-primary glow-text">Refinement</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Transform unstructured ideas into precise, actionable specifications using advanced AI.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-1 shadow-2xl shadow-black/50 overflow-hidden">
             {/* Toolbar */}
             <div className="flex items-center gap-2 p-3 bg-secondary/30 border-b border-border mb-0">
                <button className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors">
                  <Type className="w-4 h-4" />
                </button>
                <label className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors cursor-pointer">
                  <Paperclip className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.md,text/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                {selectedFile && (
                  <span className="text-xs text-primary truncate max-w-32">
                    {selectedFile.name}
                  </span>
                )}
             </div>
             
             {/* Textarea */}
            <textarea
              className="w-full h-64 md:h-96 bg-transparent p-6 text-lg text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none"
              placeholder="Paste your raw requirements, user stories, or rough ideas here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isPending}
            />
            
            <div className="p-4 bg-secondary/10 border-t border-border flex justify-end">
              <button
                onClick={handleRefine}
                disabled={isPending || !input}
                className="
                  group relative px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold 
                  shadow-lg shadow-primary/25 transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  overflow-hidden
                "
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Refine Prompt
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                
                {/* Button shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
             {['Structure', 'Intent', 'Constraints', 'Ambiguity'].map((feature, i) => (
               <div key={i} className="text-center p-3 rounded-xl bg-secondary/30 border border-white/5">
                 <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Detects</div>
                 <div className="font-medium text-white">{feature}</div>
               </div>
             ))}
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {result ? (
              <RefinementDisplay key="result" data={result} />
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-3xl bg-secondary/10 text-muted-foreground/50"
              >
                <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 opacity-50" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-muted-foreground">Ready to Refine</h3>
                <p className="max-w-sm">
                  Your structured prompt analysis will appear here. AI will extract intent, constraints, and success criteria.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
