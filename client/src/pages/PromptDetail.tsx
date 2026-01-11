import { Layout } from "@/components/Layout";
import { usePrompt } from "@/hooks/use-prompts";
import { useRoute, Link } from "wouter";
import { RefinementDisplay } from "@/components/RefinementDisplay";
import { Loader2, ArrowLeft, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { type RefinedOutput } from "@shared/schema";

export default function PromptDetail() {
  const [, params] = useRoute("/prompts/:id");
  const id = parseInt(params?.id || "0");
  const { data: prompt, isLoading, error } = usePrompt(id);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !prompt) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-2">Prompt not found</h2>
          <Link href="/history" className="text-primary hover:underline">Return to History</Link>
        </div>
      </Layout>
    );
  }

  const refinedData = prompt.refinedPrompt as unknown as RefinedOutput;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-4">
          <Link href="/history">
            <button className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Prompt Details</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Calendar className="w-3 h-3" />
              <span>{prompt.createdAt && format(new Date(prompt.createdAt), "MMMM d, yyyy 'at' h:mm a")}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Sidebar Info - Original Input */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 shadow-lg sticky top-24">
                 <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Original Input
                 </h3>
                 <div className="bg-secondary/50 rounded-lg p-4 text-sm text-gray-300 leading-relaxed font-mono overflow-auto max-h-[60vh]">
                    {prompt.originalInput}
                 </div>
                 
                 <div className="mt-6 pt-6 border-t border-border space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Input Type</span>
                      <span className="text-white capitalize">{prompt.inputType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Refinement ID</span>
                      <span className="text-white font-mono">#{prompt.id}</span>
                    </div>
                 </div>
              </div>
           </div>
           
           {/* Main Content - Refined Output */}
           <div className="lg:col-span-8">
              <RefinementDisplay data={refinedData} />
           </div>
        </div>
      </div>
    </Layout>
  );
}
